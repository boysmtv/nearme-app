package id.dekat.identity.application;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtTokenProvider {

    private static final String KID_HEADER = "kid";
    private static final String REFRESH_TOKEN_PREFIX = "rt_";

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;

    private final Map<String, SecretKey> accessKeyRing = new ConcurrentHashMap<>();
    private String currentKid;

    public JwtTokenProvider(
            @Value("${jwt.access-secret}") String accessSecret,
            @Value("${jwt.refresh-secret}") String refreshSecret,
            @Value("${jwt.access-token-validity-ms:900000}") long accessTokenValidityMs,
            @Value("${jwt.refresh-token-validity-ms:604800000}") long refreshTokenValidityMs) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityMs = accessTokenValidityMs;
        this.refreshTokenValidityMs = refreshTokenValidityMs;

        this.currentKid = "key-" + UUID.randomUUID().toString().substring(0, 8);
        this.accessKeyRing.put(currentKid, accessKey);
    }

    public String generateAccessToken(UUID userId, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidityMs);

        return Jwts.builder()
                .header().add(KID_HEADER, currentKid).and()
                .subject(userId.toString())
                .claim("email", email)
                .claim("token_type", "access")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(accessKeyRing.get(currentKid), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return REFRESH_TOKEN_PREFIX + UUID.randomUUID().toString();
    }

    public String hashRefreshToken(String refreshToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(refreshToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash refresh token", e);
        }
    }

    public boolean verifyRefreshTokenHash(String refreshToken, String storedHash) {
        String computedHash = hashRefreshToken(refreshToken);
        return MessageDigest.isEqual(computedHash.getBytes(StandardCharsets.UTF_8),
                                     storedHash.getBytes(StandardCharsets.UTF_8));
    }

    public UUID extractUserIdFromRefreshToken(String refreshToken) {
        // Refresh tokens are opaque - the userId is determined via session lookup
        // This method is used for initial validation that the token format is correct
        if (refreshToken == null || !refreshToken.startsWith(REFRESH_TOKEN_PREFIX)) {
            throw new IllegalArgumentException("Invalid refresh token format");
        }
        // The actual userId resolution happens through session matching in AuthService
        // We return null here as the AuthService handles the lookup
        return null;
    }

    public Claims extractAccessTokenClaims(String token) {
        return Jwts.parser()
                .verifyWith(accessKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserIdFromAccessToken(String token) {
        Claims claims = extractAccessTokenClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractEmailFromAccessToken(String token) {
        Claims claims = extractAccessTokenClaims(token);
        return claims.get("email", String.class);
    }

    public boolean validateAccessToken(String token) {
        try {
            Jwts.parser().verifyWith(accessKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        // Opaque refresh tokens don't have JWT structure - validation happens via session lookup
        return token != null && token.startsWith(REFRESH_TOKEN_PREFIX);
    }

    public String getCurrentKid() {
        return currentKid;
    }

    public SecretKey getKeyForKid(String kid) {
        return accessKeyRing.get(kid);
    }

    public void rotateKeys() {
        SecretKey oldKey = accessKey;
        String newKid = "key-" + UUID.randomUUID().toString().substring(0, 8);

        byte[] newSecret = new byte[64];
        new java.security.SecureRandom().nextBytes(newSecret);
        SecretKey newKey = Keys.hmacShaKeyFor(newSecret);

        accessKeyRing.put(newKid, newKey);
        accessKeyRing.put(currentKid, oldKey);

        currentKid = newKid;

        // Remove keys older than 2 rotations (keep at most 3)
        if (accessKeyRing.size() > 3) {
            List<String> keys = new ArrayList<>(accessKeyRing.keySet());
            for (int i = 0; i < keys.size() - 2; i++) {
                if (!keys.get(i).equals(currentKid)) {
                    accessKeyRing.remove(keys.get(i));
                }
            }
        }
    }
}
