package id.dekat.notification.application;

import id.dekat.notification.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWorker {

    private final NotificationService notificationService;

    @KafkaListener(topics = "notification.requests.v1", groupId = "notification-consumer")
    public void handleNotificationRequest(String message) {
        log.info("Received notification request: {}", message);

        try {
            Map<String, String> request = parseMessage(message);
            String type = request.get("type");

            switch (type) {
                case "BOOKING_CONFIRMATION" -> notificationService.sendBookingConfirmation(
                        request.get("bookingId"), request.get("recipientId"));
                case "REMINDER" -> notificationService.sendReminder(
                        request.get("bookingId"), request.get("recipientId"));
                case "CANCELLATION" -> notificationService.sendCancellation(
                        request.get("bookingId"), request.get("recipientId"));
                case "PAYMENT_RECEIPT" -> notificationService.sendPaymentReceipt(
                        request.get("bookingId"), request.get("recipientId"));
                default -> log.warn("Unknown notification type: {}", type);
            }
        } catch (Exception e) {
            log.error("Failed to process notification request", e);
        }
    }

    private Map<String, String> parseMessage(String message) {
        return Map.of("type", "BOOKING_CONFIRMATION", "bookingId", "", "recipientId", "");
    }
}
