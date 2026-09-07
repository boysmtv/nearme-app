package id.dekat.notification.application;

import id.dekat.notification.domain.*;
import id.dekat.notification.infrastructure.push.PushNotificationPort;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final EmailService emailService;
    private final PushNotificationPort pushPort;
    private final UserRepository userRepository;

    @Transactional
    public NotificationDelivery sendBookingConfirmation(UUID tenantId, UUID recipientId,
                                                         String bookingCode, String serviceName,
                                                         String providerName, Instant bookingTime) {
        NotificationTemplate template = templateRepository.findByEventType("BOOKING_CONFIRMATION")
                .orElse(null);

        String subject = "Booking Confirmed - " + bookingCode;
        String body;

        if (template != null) {
            body = template.getBodyTemplate()
                    .replace("{{bookingCode}}", bookingCode)
                    .replace("{{serviceName}}", serviceName != null ? serviceName : "")
                    .replace("{{providerName}}", providerName != null ? providerName : "")
                    .replace("{{bookingTime}}", bookingTime != null ? bookingTime.toString() : "");
        } else {
            body = "Your booking " + bookingCode + " has been confirmed successfully.";
        }

        NotificationDelivery delivery = NotificationDelivery.builder()
                .recipientId(recipientId)
                .channel("EMAIL")
                .subject(subject)
                .body(body)
                .status(NotificationDelivery.DeliveryStatus.PENDING)
                .build();

        NotificationDelivery saved = notificationRepository.save(delivery);
        log.info("Booking confirmation notification sent for booking {} to user {}", bookingCode, recipientId);

        sendPushNotification(recipientId, subject, body);
        sendEmailNotification(recipientId, subject, body, "booking-confirmation", Map.of(
            "bookingCode", bookingCode,
            "serviceName", serviceName != null ? serviceName : "",
            "providerName", providerName != null ? providerName : "",
            "bookingTime", bookingTime != null ? bookingTime.toString() : ""
        ));

        return saved;
    }

    @Transactional
    public NotificationDelivery sendReminder(UUID tenantId, UUID recipientId,
                                              String bookingCode, String serviceName,
                                              String providerName, Instant bookingTime,
                                              int hoursBefore) {
        String templateCode = hoursBefore >= 24 ? "REMINDER_H24" : "REMINDER_H2";
        NotificationTemplate template = templateRepository.findByEventType(templateCode)
                .orElse(null);

        String subject = "Booking Reminder - " + bookingCode;
        String body;

        if (template != null) {
            body = template.getBodyTemplate()
                    .replace("{{bookingCode}}", bookingCode)
                    .replace("{{serviceName}}", serviceName != null ? serviceName : "")
                    .replace("{{providerName}}", providerName != null ? providerName : "")
                    .replace("{{hoursBefore}}", String.valueOf(hoursBefore));
        } else {
            body = "Reminder: Your booking " + bookingCode + " is in " + hoursBefore + " hours.";
        }

        NotificationDelivery delivery = NotificationDelivery.builder()
                .recipientId(recipientId)
                .channel("PUSH")
                .subject(subject)
                .body(body)
                .status(NotificationDelivery.DeliveryStatus.PENDING)
                .build();

        NotificationDelivery saved = notificationRepository.save(delivery);
        log.info("Reminder notification sent for booking {} (H-{}) to user {}", bookingCode, hoursBefore, recipientId);

        sendPushNotification(recipientId, subject, body);

        return saved;
    }

    @Transactional
    public NotificationDelivery sendCancellation(UUID tenantId, UUID recipientId,
                                                   String bookingCode, String reason) {
        NotificationTemplate template = templateRepository.findByEventType("CANCELLATION")
                .orElse(null);

        String subject = "Booking Cancelled - " + bookingCode;
        String body;

        if (template != null) {
            body = template.getBodyTemplate()
                    .replace("{{bookingCode}}", bookingCode)
                    .replace("{{reason}}", reason != null ? reason : "");
        } else {
            body = "Your booking " + bookingCode + " has been cancelled."
                    + (reason != null ? " Reason: " + reason : "");
        }

        NotificationDelivery delivery = NotificationDelivery.builder()
                .recipientId(recipientId)
                .channel("EMAIL")
                .subject(subject)
                .body(body)
                .status(NotificationDelivery.DeliveryStatus.PENDING)
                .build();

        NotificationDelivery saved = notificationRepository.save(delivery);
        log.info("Cancellation notification sent for booking {} to user {}", bookingCode, recipientId);

        sendPushNotification(recipientId, subject, body);
        sendEmailNotification(recipientId, subject, body, "booking-cancellation", Map.of(
            "bookingCode", bookingCode,
            "reason", reason != null ? reason : ""
        ));

        return saved;
    }

    @Transactional
    public NotificationDelivery sendPaymentReceipt(UUID tenantId, UUID recipientId,
                                                     String bookingCode, String amount,
                                                     String currency) {
        NotificationTemplate template = templateRepository.findByEventType("PAYMENT_RECEIPT")
                .orElse(null);

        String subject = "Payment Receipt - " + bookingCode;
        String body;

        if (template != null) {
            body = template.getBodyTemplate()
                    .replace("{{bookingCode}}", bookingCode)
                    .replace("{{amount}}", amount != null ? amount : "")
                    .replace("{{currency}}", currency != null ? currency : "");
        } else {
            body = "Payment of " + (currency != null ? currency : "") + " " + (amount != null ? amount : "")
                    + " received for booking " + bookingCode + ".";
        }

        NotificationDelivery delivery = NotificationDelivery.builder()
                .recipientId(recipientId)
                .channel("EMAIL")
                .subject(subject)
                .body(body)
                .status(NotificationDelivery.DeliveryStatus.PENDING)
                .build();

        NotificationDelivery saved = notificationRepository.save(delivery);
        log.info("Payment receipt notification sent for booking {} to user {}", bookingCode, recipientId);

        sendEmailNotification(recipientId, subject, body, "payment-receipt", Map.of(
            "bookingCode", bookingCode,
            "amount", amount != null ? amount : "",
            "currency", currency != null ? currency : ""
        ));

        return saved;
    }

    @Transactional
    public void scheduleReminders(UUID tenantId, UUID recipientId, String bookingCode,
                                   String serviceName, String providerName, Instant bookingTime) {
        Instant h24Reminder = bookingTime.minus(24, ChronoUnit.HOURS);
        Instant h2Reminder = bookingTime.minus(2, ChronoUnit.HOURS);

        Instant now = Instant.now();

        if (h24Reminder.isAfter(now)) {
            log.info("Scheduled H-24 reminder for booking {} at {}", bookingCode, h24Reminder);
            // In production, this would create a scheduled job or use a message queue
            // For now, we log the scheduling intent
        }

        if (h2Reminder.isAfter(now)) {
            log.info("Scheduled H-2 reminder for booking {} at {}", bookingCode, h2Reminder);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDelivery> getPendingNotifications(UUID tenantId, UUID recipientId) {
        return notificationRepository.findByRecipientId(recipientId).stream()
                .filter(n -> n.getStatus() == NotificationDelivery.DeliveryStatus.PENDING)
                .toList();
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setStatus(NotificationDelivery.DeliveryStatus.DELIVERED);
            notificationRepository.save(notification);
        });
    }

    private void sendPushNotification(UUID userId, String title, String body) {
        List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(userId);
        if (deviceTokens.isEmpty()) {
            log.debug("No active device tokens for user {}", userId);
            return;
        }

        for (DeviceToken deviceToken : deviceTokens) {
            try {
                pushPort.sendPush(deviceToken.getToken(), title, body, Map.of());
                log.info("Push notification sent to {} ({})", deviceToken.getToken(), deviceToken.getDeviceType());
            } catch (Exception e) {
                log.warn("Failed to send push to {}: {}", deviceToken.getToken(), e.getMessage());
            }
        }
    }

    private void sendEmailNotification(UUID userId, String subject, String body, String templateId, Map<String, String> templateVars) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getEmail() == null) {
                log.warn("No email found for user {}", userId);
                return;
            }
            Map<String, String> vars = new java.util.HashMap<>(templateVars);
            vars.putIfAbsent("userName", user.getName() != null ? user.getName() : "User");
            emailService.sendTemplateEmail(user.getEmail(), templateId, subject, vars);
            log.info("Email notification sent to user {} ({}) using template {}", userId, user.getEmail(), templateId);
        } catch (Exception e) {
            log.warn("Failed to send email to user {}: {}", userId, e.getMessage());
        }
    }
}
