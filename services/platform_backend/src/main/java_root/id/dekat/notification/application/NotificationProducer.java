package id.dekat.notification.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendNotificationRequest(Map<String, String> request) {
        String key = request.getOrDefault("recipientId", "system");
        String json;
        try {
            json = objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            log.error("Failed to serialize notification request", e);
            return;
        }
        kafkaTemplate.send("notification.requests.v1", key, json);
        log.info("Sent notification request: type={}, recipient={}",
                request.get("type"), request.get("recipientId"));
    }
}
