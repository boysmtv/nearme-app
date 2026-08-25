package id.dekat.notification.web;

import id.dekat.notification.domain.DeliveryRecord;
import id.dekat.notification.domain.DeliveryRecordRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final DeliveryRecordRepository deliveryRecordRepository;

    public NotificationController(DeliveryRecordRepository deliveryRecordRepository) {
        this.deliveryRecordRepository = deliveryRecordRepository;
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
        Page<DeliveryRecord> result = deliveryRecordRepository.findByRecipientIdOrderByCreatedAtDesc(
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
        var found = deliveryRecordRepository.findByIdAndRecipientId(id, recipientId);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Notification not found"));
        }
        DeliveryRecord record = found.get();
        if ("PENDING".equals(record.getStatus()) || "SENT".equals(record.getStatus())) {
            record.setStatus("DELIVERED");
            record.setDeliveredAt(java.time.OffsetDateTime.now());
            record = deliveryRecordRepository.save(record);
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
        int updated = deliveryRecordRepository.markAllRead(recipientId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("updated", updated), "Notifications marked as read"));
    }

    private Map<String, Object> toRow(DeliveryRecord record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId().toString());
        row.put("channel", record.getChannel());
        row.put("subject", record.getSubject());
        row.put("body", record.getBody());
        row.put("status", record.getStatus());
        row.put("read", "DELIVERED".equals(record.getStatus()));
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
