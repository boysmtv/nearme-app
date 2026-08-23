package id.dekat.notification.infrastructure.messaging.whatsapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import id.dekat.notification.infrastructure.messaging.MessagingPort;
import id.dekat.notification.infrastructure.messaging.SendResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Component
public class WhatsAppBusinessAdapter implements MessagingPort {

    private static final String WHATSAPP_API_URL =
            "https://graph.facebook.com/v18.0/{phoneNumberId}/messages";

    private final WhatsAppProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public WhatsAppBusinessAdapter(WhatsAppProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public SendResult sendWhatsApp(String phone, String message) {
        log.info("Sending WhatsApp message to: {}", phone);

        try {
            String url = WHATSAPP_API_URL.replace("{phoneNumberId}", properties.phoneNumberId());

            Map<String, Object> body = Map.of(
                    "messaging_product", "whatsapp",
                    "to", normalizePhone(phone),
                    "type", "text",
                    "text", Map.of("body", message)
            );

            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.accessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            JsonNode messages = json.path("messages");
            if (messages.isArray() && !messages.isEmpty()) {
                String messageId = messages.get(0).path("id").asText(null);
                log.info("WhatsApp message sent. to={}, messageId={}", phone, messageId);
                return SendResult.success(messageId);
            }

            log.warn("WhatsApp API returned no messages array. Response: {}", response.getBody());
            return SendResult.failed("No message ID returned from WhatsApp API");

        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to: {}", phone, e);
            return SendResult.failed(e.getMessage());
        }
    }

    @Override
    public SendResult sendSms(String phone, String message) {
        log.info("Sending SMS to: {} (via WhatsApp)", phone);
        return sendWhatsApp(phone, message);
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String cleaned = phone.replaceAll("[^\\d+]", "");
        if (cleaned.startsWith("0")) {
            cleaned = "62" + cleaned.substring(1);
        }
        if (cleaned.startsWith("+")) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }
}
