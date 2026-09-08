package id.dekat.identity.application;

import id.dekat.access.domain.Role;
import id.dekat.access.domain.RoleAssignmentRepository;
import id.dekat.access.domain.RoleRepository;
import id.dekat.identity.domain.*;
import id.dekat.identity.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_MINUTES = 5;
    private static final int OTP_RATE_LIMIT_SECONDS = 60;
    private static final int SESSION_EXPIRY_DAYS = 7;

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final RoleRepository roleRepository;

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String OTP_ATTEMPT_PREFIX = "otp_attempts:";
    private static final String OTP_RATE_PREFIX = "otp_rate:";

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone already registered");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .name(request.getName())
                .passwordHash(passwordHash)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        return createTokenResponse(user, null);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (user.getPasswordHash() == null) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Account is not active: " + user.getStatus());
        }

        return createTokenResponse(user, null);
    }

    public void requestOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String rateKey = OTP_RATE_PREFIX + request.getEmail();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(rateKey))) {
            throw new IllegalStateException("Please wait before requesting another OTP");
        }

        String code = generateOtpCode();
        String hashedCode = hashOtp(code);

        String otpKey = OTP_KEY_PREFIX + request.getEmail() + ":" + request.getPurpose();
        redisTemplate.opsForValue().set(otpKey, hashedCode, OTP_TTL_MINUTES, TimeUnit.MINUTES);

        redisTemplate.opsForValue().set(rateKey, "1", OTP_RATE_LIMIT_SECONDS, TimeUnit.SECONDS);

        int attempts = 0;
        String attemptsKey = OTP_ATTEMPT_PREFIX + request.getEmail();
        String attemptsVal = redisTemplate.opsForValue().get(attemptsKey);
        if (attemptsVal != null) {
            attempts = Integer.parseInt(attemptsVal);
        }
        redisTemplate.opsForValue().set(attemptsKey, String.valueOf(attempts + 1), OTP_TTL_MINUTES + 5, TimeUnit.MINUTES);

        // TODO: Send OTP via email/SMS provider
        log.warn("[OTP] Generated code for {} (purpose={}) — email/SMS provider not configured", request.getEmail(), request.getPurpose());
    }

    public TokenResponse verifyOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("OTP code is required");
        }

        String otpKey = OTP_KEY_PREFIX + request.getEmail() + ":" + request.getPurpose();
        String storedHash = redisTemplate.opsForValue().get(otpKey);

        if (storedHash == null) {
            throw new IllegalArgumentException("OTP has expired or was not requested");
        }

        String attemptsKey = OTP_ATTEMPT_PREFIX + request.getEmail();
        String attemptsVal = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = attemptsVal != null ? Integer.parseInt(attemptsVal) : 0;
        if (attempts >= 5) {
            redisTemplate.delete(otpKey);
            redisTemplate.delete(attemptsKey);
            throw new IllegalArgumentException("Too many failed OTP attempts. Please request a new code.");
        }

        if (!verifyOtp(request.getCode(), storedHash)) {
            redisTemplate.opsForValue().set(attemptsKey, String.valueOf(attempts + 1), OTP_TTL_MINUTES + 5, TimeUnit.MINUTES);
            throw new IllegalArgumentException("Invalid OTP code");
        }

        redisTemplate.delete(otpKey);
        redisTemplate.delete(attemptsKey);

        if (request.getPurpose() == OtpPurpose.REGISTER && user.getStatus() == UserStatus.INACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        return createTokenResponse(user, null);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        UUID userId = jwtTokenProvider.extractUserIdFromRefreshToken(refreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Account is not active");
        }

        List<Session> activeSessions = sessionRepository.findByUserIdAndRevokedAtIsNull(userId);

        Session matchedSession = null;
        for (Session session : activeSessions) {
            if (jwtTokenProvider.verifyRefreshTokenHash(refreshToken, session.getRefreshTokenHash())) {
                matchedSession = session;
                break;
            }
        }

        if (matchedSession == null) {
            throw new IllegalArgumentException("Invalid or revoked refresh token");
        }

        if (matchedSession.isExpired()) {
            matchedSession.setRevokedAt(LocalDateTime.now());
            sessionRepository.save(matchedSession);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        matchedSession.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(matchedSession);

        String tokenFamily = matchedSession.getTokenFamily() != null
                ? matchedSession.getTokenFamily()
                : UUID.randomUUID().toString();

        return createTokenResponse(user, tokenFamily);
    }

    @Transactional
    public void logout(String refreshToken) {
        UUID userId = jwtTokenProvider.extractUserIdFromRefreshToken(refreshToken);

        List<Session> activeSessions = sessionRepository.findByUserIdAndRevokedAtIsNull(userId);

        for (Session session : activeSessions) {
            if (jwtTokenProvider.verifyRefreshTokenHash(refreshToken, session.getRefreshTokenHash())) {
                session.setRevokedAt(LocalDateTime.now());
                sessionRepository.save(session);
                break;
            }
        }
    }

    @Transactional
    public void logoutAllDevices(UUID userId) {
        List<Session> sessions = sessionRepository.findByUserIdAndRevokedAtIsNull(userId);
        sessions.forEach(session -> session.setRevokedAt(LocalDateTime.now()));
        sessionRepository.saveAll(sessions);
    }

    private TokenResponse createTokenResponse(User user, String existingTokenFamily) {
        String tokenFamily = existingTokenFamily != null ? existingTokenFamily : UUID.randomUUID().toString();

        List<String> roles = roleAssignmentRepository.findByUserId(user.getId()).stream()
                .map(ra -> roleRepository.findById(ra.getRoleId()).orElse(null))
                .filter(r -> r != null)
                .map(Role::getName)
                .toList();
        if (roles.isEmpty()) {
            // Fallback: assign default customer role if no explicit assignment
            roles = List.of("ROLE_CUSTOMER");
        }
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roles);

        String refreshTokenPlain = jwtTokenProvider.generateRefreshToken(user.getId());
        String refreshTokenHash = jwtTokenProvider.hashRefreshToken(refreshTokenPlain);

        Session session = Session.builder()
                .userId(user.getId())
                .tokenFamily(tokenFamily)
                .refreshTokenHash(refreshTokenHash)
                .expiresAt(LocalDateTime.now().plusDays(SESSION_EXPIRY_DAYS))
                .build();
        sessionRepository.save(session);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenPlain)
                .expiresIn(900)
                .tokenType("Bearer")
                .build();
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int code = random.nextInt(bound);
        return String.format("%0" + OTP_LENGTH + "d", code);
    }

    private String hashOtp(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash OTP", e);
        }
    }

    private boolean verifyOtp(String code, String storedHash) {
        String computedHash = hashOtp(code);
        return MessageDigest.isEqual(computedHash.getBytes(), storedHash.getBytes());
    }
}
