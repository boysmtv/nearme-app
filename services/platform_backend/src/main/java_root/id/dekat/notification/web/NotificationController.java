package id.dekat.notification.web;

import id.dekat.notification.domain.DeviceToken;
import id.dekat.notification.domain.DeviceTokenRepository;
import id.dekat.notification.domain.NotificationDelivery;
import id.dekat.notification.domain.NotificationRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                   DeviceTokenRepository deviceTokenRepository) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            Principal principal,
            @RequestHeader(value = "X-Recipient-Id", required = false) UUID recipientHeader) {
        UUID recipientId = currentUserId(principal);
        if (recipientId == null) {
            recipientId = recipientHeader;
        }
        if (recipientId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Authenticated recipient required"));
        }
        Page<NotificationDelivery> result = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                recipientId, PageRequest.of(Math.max(0, page - 1), Math.max(1, limit)));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("data", result.getContent().stream().map(this::toRow).toList());
        payload.put("pagination", Map.of(
                "page", Math.max(1, page),
                "limit", Math.max(1, limit),
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()));
        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> markRead(
            @PathVariable UUID id,
            Principal principal,
            @RequestHeader(value = "X-Recipient-Id", required = false) UUID recipientHeader) {
        UUID recipientId = currentUserId(principal);
        if (recipientId == null) {
            recipientId = recipientHeader;
        }
        if (recipientId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Authenticated recipient required"));
        }
        var found = notificationRepository.findById(id);
        if (found.isEmpty() || !found.get().getRecipientId().equals(recipientId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Notification not found"));
        }
        NotificationDelivery record = found.get();
        if (record.getStatus() == NotificationDelivery.DeliveryStatus.PENDING
                || record.getStatus() == NotificationDelivery.DeliveryStatus.SENT) {
            record.setStatus(NotificationDelivery.DeliveryStatus.DELIVERED);
            record.setDeliveredAt(Instant.now());
            record = notificationRepository.save(record);
        }
        return ResponseEntity.ok(ApiResponse.ok(toRow(record), "Notification marked as read"));
    }

    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllRead(
            Principal principal,
            @RequestHeader(value = "X-Recipient-Id", required = false) UUID recipientHeader) {
        UUID recipientId = currentUserId(principal);
        if (recipientId == null) {
            recipientId = recipientHeader;
        }
        if (recipientId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Authenticated recipient required"));
        }
        int updated = notificationRepository.markAllRead(recipientId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("updated", updated), "Notifications marked as read"));
    }

    @PostMapping("/device-tokens")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerDeviceToken(
            @RequestBody DeviceToken deviceToken,
            Principal principal,
            @RequestHeader(value = "X-Recipient-Id", required = false) UUID recipientHeader) {
        UUID userId = currentUserId(principal);
        if (userId == null) {
            userId = recipientHeader;
        }
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Authenticated user required"));
        }
        deviceToken.setUserId(userId);
        if (deviceToken.getCreatedAt() == null) {
            deviceToken.setCreatedAt(Instant.now());
        }
        DeviceToken saved = deviceTokenRepository.save(deviceToken);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", saved.getId().toString());
        payload.put("token", saved.getToken());
        payload.put("deviceType", saved.getDeviceType());
        return ResponseEntity.ok(ApiResponse.ok(payload, "Device token registered"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unreadCount(
            Principal principal,
            @RequestHeader(value = "X-Recipient-Id", required = false) UUID recipientHeader) {
        UUID recipientId = currentUserId(principal);
        if (recipientId == null) {
            recipientId = recipientHeader;
        }
        if (recipientId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Authenticated recipient required"));
        }
        long count = notificationRepository.findByRecipientIdAndStatus(
                recipientId, NotificationDelivery.DeliveryStatus.PENDING).size();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }

    private Map<String, Object> toRow(NotificationDelivery record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId().toString());
        row.put("channel", record.getChannel());
        row.put("subject", record.getSubject());
        row.put("body", record.getBody());
        row.put("status", record.getStatus().name());
        row.put("read", record.getStatus() == NotificationDelivery.DeliveryStatus.DELIVERED);
        row.put("createdAt", record.getCreatedAt());
        row.put("deliveredAt", record.getDeliveredAt());
        return row;
    }

    private UUID currentUserId(Principal principal) {
        if (principal == null) {
            return null;
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
