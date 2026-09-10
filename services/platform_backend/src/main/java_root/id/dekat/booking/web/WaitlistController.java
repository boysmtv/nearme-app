package id.dekat.booking.web;

import id.dekat.booking.domain.*;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/provider/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistEntryRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WaitlistEntry>>> list(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestParam(required = false) String date) {
        List<WaitlistEntry> entries;
        if (date != null) {
            entries = repository.findByTenantIdAndPreferredDate(tenantId, LocalDate.parse(date));
        } else {
            entries = repository.findByTenantId(tenantId);
        }
        return ResponseEntity.ok(ApiResponse.ok(entries));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<WaitlistEntry>> joinWaitlist(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        UUID customerId = body.get("customerId") != null ? UUID.fromString((String) body.get("customerId")) : null;
        UUID serviceId = body.get("serviceId") != null ? UUID.fromString((String) body.get("serviceId")) : null;
        UUID staffId = body.get("staffId") != null ? UUID.fromString((String) body.get("staffId")) : null;
        LocalDate preferredDate = body.get("preferredDate") != null ? LocalDate.parse((String) body.get("preferredDate")) : null;
        LocalTime preferredTime = body.get("preferredTime") != null ? LocalTime.parse((String) body.get("preferredTime")) : null;

        long position = repository.countByTenantIdAndPreferredDateAndStatus(tenantId, preferredDate, "WAITING") + 1;

        WaitlistEntry entry = WaitlistEntry.builder()
                .tenantId(tenantId)
                .customerId(customerId)
                .customerName((String) body.get("customerName"))
                .customerPhone((String) body.get("customerPhone"))
                .serviceId(serviceId)
                .staffId(staffId)
                .preferredDate(preferredDate)
                .preferredTime(preferredTime)
                .status("WAITING")
                .position((int) position)
                .build();

        WaitlistEntry saved = repository.save(entry);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @PostMapping("/{entryId}/notify")
    @Transactional
    public ResponseEntity<ApiResponse<WaitlistEntry>> notifyCustomer(
            @PathVariable UUID entryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        WaitlistEntry entry = repository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));
        entry.setStatus("NOTIFIED");
        entry.setNotifiedAt(OffsetDateTime.now());
        WaitlistEntry saved = repository.save(entry);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @DeleteMapping("/{entryId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> removeEntry(
            @PathVariable UUID entryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        repository.deleteById(entryId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
