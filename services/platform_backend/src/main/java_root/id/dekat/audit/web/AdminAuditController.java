package id.dekat.audit.web;

import id.dekat.audit.application.AuditService;
import id.dekat.audit.domain.AuditLog;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLog>>> listAuditLogs(
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate since,
            @RequestParam(required = false) String requestId) {

        List<AuditLog> logs;

        if (requestId != null && !requestId.isBlank()) {
            logs = auditService.getByRequestId(requestId);
        } else if (action != null && !action.isBlank() && since != null) {
            Instant sinceInstant = since.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
            logs = auditService.getRecentByAction(action, sinceInstant);
        } else if (actorId != null && since != null) {
            Instant from = since.atStartOfDay(ZoneId.of("Asia/Jakarta")).toInstant();
            Instant to = from.plusSeconds(86400);
            logs = auditService.getActorActivity(actorId, from, to);
        } else if (resourceType != null && resourceId != null) {
            logs = auditService.getAuditTrail(resourceId, resourceType);
        } else {
            logs = auditService.getRecentByAction("%", Instant.now().minusSeconds(86400 * 30));
        }

        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<List<String>>> listActions() {
        List<String> actions = List.of(
            "USER_LOGIN", "USER_REGISTER", "USER_STATUS_CHANGE",
            "TENANT_APPROVE", "TENANT_REJECT",
            "BOOKING_CREATE", "BOOKING_CONFIRM", "BOOKING_CANCEL", "BOOKING_RESCHEDULE",
            "PAYMENT_INTENT", "PAYMENT_WEBHOOK", "REFUND_PROCESS",
            "REVIEW_CREATE", "REVIEW_REPORT",
            "STAFF_INVITE", "SERVICE_CREATE", "SERVICE_UPDATE",
            "SETTINGS_UPDATE", "FLAG_TOGGLE"
        );
        return ResponseEntity.ok(ApiResponse.ok(actions));
    }
}
