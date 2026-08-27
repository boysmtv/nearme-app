package id.dekat.notification.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import id.dekat.notification.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWorker {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "notification.requests.v1", groupId = "notification-consumer")
    public void handleNotificationRequest(String message) {
        log.info("Received notification request: {}", message);

        try {
            Map<String, String> request = parseMessage(message);
            String type = request.get("type");
            UUID tenantId = UUID.fromString(request.get("tenantId"));
            UUID recipientId = UUID.fromString(request.get("recipientId"));
            String bookingCode = request.get("bookingCode");
            Instant bookingTime = request.get("bookingTime") != null
                    ? Instant.parse(request.get("bookingTime")) : null;

            switch (type) {
                case "BOOKING_CONFIRMATION" -> notificationService.sendBookingConfirmation(
                        tenantId, recipientId, bookingCode,
                        request.get("serviceName"), request.get("providerName"), bookingTime);
                case "REMINDER" -> notificationService.sendReminder(
                        tenantId, recipientId, bookingCode,
                        request.get("serviceName"), request.get("providerName"),
                        bookingTime, Integer.parseInt(request.getOrDefault("hoursBefore", "24")));
                case "CANCELLATION" -> notificationService.sendCancellation(
                        tenantId, recipientId, bookingCode, request.get("reason"));
                case "PAYMENT_RECEIPT" -> notificationService.sendPaymentReceipt(
                        tenantId, recipientId, bookingCode,
                        request.get("amount"), request.get("currency"));
                default -> log.warn("Unknown notification type: {}", type);
            }
        } catch (Exception e) {
            log.error("Failed to process notification request", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> parseMessage(String message) throws Exception {
        Map<String, Object> raw = objectMapper.readValue(message, Map.class);
        Map<String, String> result = new java.util.HashMap<>();
        raw.forEach((k, v) -> result.put(k, v != null ? v.toString() : null));
        return result;
    }
}
