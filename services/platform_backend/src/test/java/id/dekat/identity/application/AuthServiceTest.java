package id.dekat.identity.application;

import id.dekat.identity.domain.*;
import id.dekat.identity.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthService authService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("register")
    class RegisterTests {

        @Test
        @DisplayName("should register new user successfully")
        void testRegister_Success() {
            RegisterRequest request = RegisterRequest.builder()
                    .email("user@dekat.id")
                    .name("Test User")
                    .password("password123")
                    .build();

            when(userRepository.existsByEmail("user@dekat.id")).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("$2a$hashed");
            when(userRepository.save(any(User.class)))
                    .thenAnswer(invocation -> {
                        User u = invocation.getArgument(0);
                        u.setId(userId);
                        return u;
                    });
            when(jwtTokenProvider.generateAccessToken(userId, "user@dekat.id"))
                    .thenReturn("access-token");
            when(jwtTokenProvider.generateRefreshToken(userId))
                    .thenReturn("refresh-token");
            when(jwtTokenProvider.hashRefreshToken("refresh-token"))
                    .thenReturn("hashed-refresh");
            when(sessionRepository.save(any(Session.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            TokenResponse response = authService.register(request);

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            verify(userRepository).save(any(User.class));
            verify(sessionRepository).save(any(Session.class));
        }

        @Test
        @DisplayName("should throw on duplicate email")
        void testRegister_DuplicateEmail() {
            RegisterRequest request = RegisterRequest.builder()
                    .email("existing@dekat.id")
                    .name("Test User")
                    .password("password123")
                    .build();

            when(userRepository.existsByEmail("existing@dekat.id")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Email already registered");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("login")
    class LoginTests {

        @Test
        @DisplayName("should login successfully with valid credentials")
        void testLogin_Success() {
            LoginRequest request = LoginRequest.builder()
                    .email("user@dekat.id")
                    .password("password123")
                    .build();

            User user = User.builder()
                    .id(userId)
                    .email("user@dekat.id")
                    .passwordHash("$2a$hashed")
                    .status(UserStatus.ACTIVE)
                    .build();

            when(userRepository.findByEmail("user@dekat.id")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(userId, "user@dekat.id"))
                    .thenReturn("access-token");
            when(jwtTokenProvider.generateRefreshToken(userId))
                    .thenReturn("refresh-token");
            when(jwtTokenProvider.hashRefreshToken("refresh-token"))
                    .thenReturn("hashed-refresh");
            when(sessionRepository.save(any(Session.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            TokenResponse response = authService.login(request);

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        }

        @Test
        @DisplayName("should throw on invalid credentials")
        void testLogin_InvalidCredentials() {
            LoginRequest request = LoginRequest.builder()
                    .email("user@dekat.id")
                    .password("wrongpassword")
                    .build();

            when(userRepository.findByEmail("user@dekat.id")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid credentials");
        }

        @Test
        @DisplayName("should throw when account is locked")
        void testLogin_AccountLocked() {
            LoginRequest request = LoginRequest.builder()
                    .email("user@dekat.id")
                    .password("password123")
                    .build();

            User user = User.builder()
                    .id(userId)
                    .email("user@dekat.id")
                    .passwordHash("$2a$hashed")
                    .status(UserStatus.SUSPENDED)
                    .build();

            when(userRepository.findByEmail("user@dekat.id")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not active");
        }
    }

    @Nested
    @DisplayName("refreshToken")
    class RefreshTokenTests {

        @Test
        @DisplayName("should refresh token successfully")
        void testRefreshToken_Success() {
            String refreshToken = "valid-refresh-token";

            User user = User.builder()
                    .id(userId)
                    .email("user@dekat.id")
                    .status(UserStatus.ACTIVE)
                    .build();

            Session session = Session.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .refreshTokenHash("hashed-refresh")
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();

            when(jwtTokenProvider.extractUserIdFromRefreshToken(refreshToken))
                    .thenReturn(userId);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(sessionRepository.findByUserIdAndRevokedAtIsNull(userId))
                    .thenReturn(List.of(session));
            when(jwtTokenProvider.verifyRefreshTokenHash(refreshToken, "hashed-refresh"))
                    .thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(userId, "user@dekat.id"))
                    .thenReturn("new-access-token");
            when(jwtTokenProvider.generateRefreshToken(userId))
                    .thenReturn("new-refresh-token");
            when(jwtTokenProvider.hashRefreshToken("new-refresh-token"))
                    .thenReturn("new-hashed-refresh");
            when(sessionRepository.save(any(Session.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            TokenResponse response = authService.refreshToken(refreshToken);

            assertThat(response.getAccessToken()).isEqualTo("new-access-token");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        }

        @Test
        @DisplayName("should throw when refresh token is expired")
        void testRefreshToken_Expired() {
            String refreshToken = "expired-refresh-token";

            User user = User.builder()
                    .id(userId)
                    .email("user@dekat.id")
                    .status(UserStatus.ACTIVE)
                    .build();

            Session session = Session.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .refreshTokenHash("hashed-refresh")
                    .expiresAt(LocalDateTime.now().minusDays(1))
                    .build();

            when(jwtTokenProvider.extractUserIdFromRefreshToken(refreshToken))
                    .thenReturn(userId);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(sessionRepository.findByUserIdAndRevokedAtIsNull(userId))
                    .thenReturn(List.of(session));
            when(jwtTokenProvider.verifyRefreshTokenHash(refreshToken, "hashed-refresh"))
                    .thenReturn(true);
            when(sessionRepository.save(any(Session.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("expired");
        }
    }

    @Nested
    @DisplayName("logout")
    class LogoutTests {

        @Test
        @DisplayName("should revoke session on logout")
        void testLogout_Success() {
            String refreshToken = "valid-refresh-token";

            Session session = Session.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .refreshTokenHash("hashed-refresh")
                    .build();

            when(jwtTokenProvider.extractUserIdFromRefreshToken(refreshToken))
                    .thenReturn(userId);
            when(sessionRepository.findByUserIdAndRevokedAtIsNull(userId))
                    .thenReturn(List.of(session));
            when(jwtTokenProvider.verifyRefreshTokenHash(refreshToken, "hashed-refresh"))
                    .thenReturn(true);
            when(sessionRepository.save(any(Session.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            authService.logout(refreshToken);

            verify(sessionRepository).save(argThat(s ->
                    s.getRevokedAt() != null));
        }
    }
}