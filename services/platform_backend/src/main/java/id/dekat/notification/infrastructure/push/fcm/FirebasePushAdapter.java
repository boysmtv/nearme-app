package id.dekat.notification.infrastructure.push.fcm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import id.dekat.notification.infrastructure.push.PushNotificationPort;
import id.dekat.notification.infrastructure.push.SendResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Component
public class FirebasePushAdapter implements PushNotificationPort {

    private static final String FCM_SEND_URL =
            "https://fcm.googleapis.com/v1/projects/{projectId}/messages:send";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    private final FirebaseProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private volatile String cachedAccessToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public FirebasePushAdapter(FirebaseProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public SendResult sendPush(String deviceToken, String title, String body,
                                Map<String, Object> data) {
        log.info("Sending FCM push to token: {}...", deviceToken.substring(0, Math.min(16, deviceToken.length())));

        try {
            String accessToken = getAccessToken();
            ObjectNode message = buildMessage(deviceToken, title, body, data);
            ObjectNode payload = objectMapper.createObjectNode();
            payload.set("message", message);

            String url = FCM_SEND_URL.replace("{projectId}", properties.projectId());

            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload.toString())
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String messageId = json.path("name").asText(null);

            log.info("FCM push sent successfully. messageId={}", messageId);
            return SendResult.success(messageId);

        } catch (Exception e) {
            log.error("Failed to send FCM push to token: {}", deviceToken, e);
            return SendResult.failed(e.getMessage());
        }
    }

    @Override
    public SendResult sendToTopic(String topic, String title, String body,
                                   Map<String, Object> data) {
        log.info("Sending FCM push to topic: {}", topic);

        try {
            String accessToken = getAccessToken();
            ObjectNode message = buildTopicMessage(topic, title, body, data);
            ObjectNode payload = objectMapper.createObjectNode();
            payload.set("message", message);

            String url = FCM_SEND_URL.replace("{projectId}", properties.projectId());

            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload.toString())
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String messageId = json.path("name").asText(null);

            log.info("FCM topic push sent. topic={}, messageId={}", topic, messageId);
            return SendResult.success(messageId);

        } catch (Exception e) {
            log.error("Failed to send FCM push to topic: {}", topic, e);
            return SendResult.failed(e.getMessage());
        }
    }

    private ObjectNode buildMessage(String token, String title, String body,
                                     Map<String, Object> data) {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("token", token);

        ObjectNode notification = objectMapper.createObjectNode();
        notification.put("title", title);
        notification.put("body", body);
        message.set("notification", notification);

        if (data != null && !data.isEmpty()) {
            ObjectNode dataNode = objectMapper.createObjectNode();
            data.forEach((key, value) -> dataNode.put(key, String.valueOf(value)));
            message.set("data", dataNode);
        }

        ObjectNode android = objectMapper.createObjectNode();
        android.put("priority", "high");
        message.set("android", android);

        return message;
    }

    private ObjectNode buildTopicMessage(String topic, String title, String body,
                                          Map<String, Object> data) {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("topic", topic);

        ObjectNode notification = objectMapper.createObjectNode();
        notification.put("title", title);
        notification.put("body", body);
        message.set("notification", notification);

        if (data != null && !data.isEmpty()) {
            ObjectNode dataNode = objectMapper.createObjectNode();
            data.forEach((key, value) -> dataNode.put(key, String.valueOf(value)));
            message.set("data", dataNode);
        }

        return message;
    }

    private synchronized String getAccessToken() throws IOException {
        if (cachedAccessToken != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedAccessToken;
        }

        log.debug("Refreshing FCM access token");
        String serviceAccountJson = Files.readString(Path.of(properties.serviceAccountPath()));
        JsonNode sa = objectMapper.readTree(serviceAccountJson);

        String clientEmail = sa.path("client_email").asText();
        String privateKey = sa.path("private_key").asText();

        String jwt = createSignedJwt(clientEmail, privateKey);

        ResponseEntity<String> response = restClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt)
                .retrieve()
                .toEntity(String.class);

        JsonNode tokenJson = objectMapper.readTree(response.getBody());
        cachedAccessToken = tokenJson.path("access_token").asText();
        long expiresIn = tokenJson.path("expires_in").asLong(3600);
        tokenExpiry = Instant.now().plusSeconds(expiresIn - 300);

        log.debug("FCM access token refreshed, expires in {}s", expiresIn);
        return cachedAccessToken;
    }

    private String createSignedJwt(String clientEmail, String privateKeyPem) {
        try {
            String header = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString("{\"alg\":\"RS256\",\"typ\":\"JWT\"}".getBytes());
            long now = Instant.now().getEpochSecond();
            String claimSet = String.format(
                    "{\"iss\":\"%s\",\"scope\":\"https://www.googleapis.com/auth/firebase.messaging\","
                            + "\"aud\":\"https://oauth2.googleapis.com/token\","
                            + "\"exp\":%d,\"iat\":%d}",
                    clientEmail, now + 3600, now
            );
            String payload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(claimSet.getBytes());

            String toSign = header + "." + payload;
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");

            String cleanedKey = privateKeyPem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getMimeDecoder().decode(cleanedKey);

            java.security.spec.PKCS8EncodedKeySpec keySpec = new java.security.spec.PKCS8EncodedKeySpec(keyBytes);
            java.security.KeyFactory kf = java.security.KeyFactory.getInstance("RSA");
            java.security.PrivateKey key = kf.generatePrivate(keySpec);

            signature.initSign(key);
            signature.update(toSign.getBytes());
            byte[] signedBytes = signature.sign();
            String signatureStr = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(signedBytes);

            return toSign + "." + signatureStr;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create signed JWT for FCM", e);
        }
    }
}
