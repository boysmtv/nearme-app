package id.dekat.identity.application;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String ACCESS_SECRET = "test-access-secret-key-that-is-at-least-32-bytes-long-for-hmac";
    private static final String REFRESH_SECRET = "test-refresh-secret-key-that-is-at-least-32-bytes-long-for-hmac";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                ACCESS_SECRET, REFRESH_SECRET, 900000L, 604800000L);
    }

    @Test
    @DisplayName("generateAccessToken - should return non-null token")
    void generateAccessToken_returnsNonNullToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    @DisplayName("extractUserIdFromAccessToken - should return correct UUID")
    void extractUserIdFromAccessToken_returnsCorrectUuid() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

        UUID extracted = jwtTokenProvider.extractUserIdFromAccessToken(token);

        assertThat(extracted).isEqualTo(userId);
    }

    @Test
    @DisplayName("extractEmailFromAccessToken - should return correct email")
    void extractEmailFromAccessToken_returnsCorrectEmail() {
        UUID userId = UUID.randomUUID();
        String email = "user@dekat.id";
        String token = jwtTokenProvider.generateAccessToken(userId, email);

        String extracted = jwtTokenProvider.extractEmailFromAccessToken(token);

        assertThat(extracted).isEqualTo(email);
    }

    @Test
    @DisplayName("validateAccessToken - should return true for valid token")
    void validateAccessToken_validToken_returnsTrue() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

        boolean valid = jwtTokenProvider.validateAccessToken(token);

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("validateAccessToken - should return false for invalid token")
    void validateAccessToken_invalidToken_returnsFalse() {
        boolean valid = jwtTokenProvider.validateAccessToken("invalid.token.here");

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("validateAccessToken - should return false for tampered token")
    void validateAccessToken_tamperedToken_returnsFalse() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        boolean valid = jwtTokenProvider.validateAccessToken(tampered);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("extractAccessTokenClaims - should return valid claims")
    void extractAccessTokenClaims_validToken_returnsClaims() {
        UUID userId = UUID.randomUUID();
        String email = "test@dekat.id";
        String token = jwtTokenProvider.generateAccessToken(userId, email);

        Claims claims = jwtTokenProvider.extractAccessTokenClaims(token);

        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("email", String.class)).isEqualTo(email);
        assertThat(claims.get("token_type", String.class)).isEqualTo("access");
    }

    @Test
    @DisplayName("generateRefreshToken - should return token with rt_ prefix")
    void generateRefreshToken_returnsTokenWithPrefix() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(UUID.randomUUID());

        assertThat(refreshToken).startsWith("rt_");
        assertThat(refreshToken).hasSizeGreaterThan(3);
    }

    @Test
    @DisplayName("hashRefreshToken - should return consistent hash")
    void hashRefreshToken_returnsConsistentHash() {
        String token = "rt_" + UUID.randomUUID();

        String hash1 = jwtTokenProvider.hashRefreshToken(token);
        String hash2 = jwtTokenProvider.hashRefreshToken(token);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).isNotEmpty();
    }

    @Test
    @DisplayName("hashRefreshToken - should return different hashes for different tokens")
    void hashRefreshToken_differentTokens_returnsDifferentHashes() {
        String token1 = "rt_" + UUID.randomUUID();
        String token2 = "rt_" + UUID.randomUUID();

        String hash1 = jwtTokenProvider.hashRefreshToken(token1);
        String hash2 = jwtTokenProvider.hashRefreshToken(token2);

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    @DisplayName("verifyRefreshTokenHash - should return true for matching token")
    void verifyRefreshTokenHash_matchingToken_returnsTrue() {
        String token = "rt_" + UUID.randomUUID();
        String hash = jwtTokenProvider.hashRefreshToken(token);

        boolean verified = jwtTokenProvider.verifyRefreshTokenHash(token, hash);

        assertThat(verified).isTrue();
    }

    @Test
    @DisplayName("verifyRefreshTokenHash - should return false for non-matching token")
    void verifyRefreshTokenHash_nonMatchingToken_returnsFalse() {
        String token = "rt_" + UUID.randomUUID();
        String wrongToken = "rt_" + UUID.randomUUID();
        String hash = jwtTokenProvider.hashRefreshToken(token);

        boolean verified = jwtTokenProvider.verifyRefreshTokenHash(wrongToken, hash);

        assertThat(verified).isFalse();
    }

    @Test
    @DisplayName("validateRefreshToken - should return true for valid format")
    void validateRefreshToken_validFormat_returnsTrue() {
        boolean valid = jwtTokenProvider.validateRefreshToken("rt_" + UUID.randomUUID());

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("validateRefreshToken - should return false for null")
    void validateRefreshToken_null_returnsFalse() {
        boolean valid = jwtTokenProvider.validateRefreshToken(null);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("validateRefreshToken - should return false for wrong prefix")
    void validateRefreshToken_wrongPrefix_returnsFalse() {
        boolean valid = jwtTokenProvider.validateRefreshToken("at_" + UUID.randomUUID());

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("getCurrentKid - should return non-null key id")
    void getCurrentKid_returnsNonNullKid() {
        String kid = jwtTokenProvider.getCurrentKid();

        assertThat(kid).isNotNull();
        assertThat(kid).startsWith("key-");
    }

    @Test
    @DisplayName("getKeyForKid - should return key for current kid")
    void getKeyForKid_currentKid_returnsKey() {
        String kid = jwtTokenProvider.getCurrentKid();

        var key = jwtTokenProvider.getKeyForKid(kid);

        assertThat(key).isNotNull();
    }

    @Test
    @DisplayName("getKeyForKid - should return null for unknown kid")
    void getKeyForKid_unknownKid_returnsNull() {
        var key = jwtTokenProvider.getKeyForKid("key-unknown");

        assertThat(key).isNull();
    }

    @Test
    @DisplayName("rotateKeys - should change current kid")
    void rotateKeys_changesCurrentKid() {
        String oldKid = jwtTokenProvider.getCurrentKid();

        jwtTokenProvider.rotateKeys();

        String newKid = jwtTokenProvider.getCurrentKid();
        assertThat(newKid).isNotEqualTo(oldKid);
        assertThat(newKid).startsWith("key-");
    }
}
