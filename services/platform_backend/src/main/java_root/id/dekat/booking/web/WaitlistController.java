package id.dekat.booking.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/waitlist")
public class WaitlistController {

    // In-memory store (production would use DB table)
    private static final Map<UUID, List<Map<String, Object>>> waitlistStore = new HashMap<>();

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(required = false) String date) {
        List<Map<String, Object>> entries = waitlistStore.getOrDefault(tenantId, new ArrayList<>());
        if (date != null) {
            entries = entries.stream()
                    .filter(e -> date.equals(e.get("date")))
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.ok(entries));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> joinWaitlist(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", UUID.randomUUID().toString());
        entry.put("tenantId", tenantId.toString());
        entry.put("customerId", body.get("customerId"));
        entry.put("customerName", body.get("customerName"));
        entry.put("customerPhone", body.get("customerPhone"));
        entry.put("serviceId", body.get("serviceId"));
        entry.put("staffId", body.get("staffId"));
        entry.put("preferredDate", body.get("preferredDate"));
        entry.put("preferredTime", body.get("preferredTime"));
        entry.put("status", "WAITING");
        entry.put("position", waitlistStore.getOrDefault(tenantId, new ArrayList<>()).size() + 1);
        entry.put("createdAt", OffsetDateTime.now().toString());

        waitlistStore.computeIfAbsent(tenantId, k -> new ArrayList<>()).add(entry);
        return ResponseEntity.ok(ApiResponse.ok(entry));
    }

    @PostMapping("/{entryId}/notify")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> notifyCustomer(
            @PathVariable UUID entryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        List<Map<String, Object>> entries = waitlistStore.getOrDefault(tenantId, new ArrayList<>());
        for (Map<String, Object> entry : entries) {
            if (entryId.toString().equals(entry.get("id"))) {
                entry.put("status", "NOTIFIED");
                entry.put("notifiedAt", OffsetDateTime.now().toString());
                return ResponseEntity.ok(ApiResponse.ok(entry));
            }
        }
        throw new RuntimeException("Waitlist entry not found");
    }

    @DeleteMapping("/{entryId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> removeEntry(
            @PathVariable UUID entryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        List<Map<String, Object>> entries = waitlistStore.getOrDefault(tenantId, new ArrayList<>());
        entries.removeIf(e -> entryId.toString().equals(e.get("id")));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
