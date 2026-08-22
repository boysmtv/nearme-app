package id.dekat.scheduling.web;

import id.dekat.scheduling.application.AvailabilityService;
import id.dekat.scheduling.domain.AvailabilitySlot;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<List<AvailabilitySlot>> getAvailableSlots(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestParam UUID staffId,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AvailabilitySlot> slots = availabilityService.getAvailableSlots(
                tenantId, staffId, resourceId, date);
        return ResponseEntity.ok(slots);
    }

    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateSlot(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody ValidateSlotRequest request) {
        boolean valid = availabilityService.validateSlot(
                tenantId, request.getStaffId(), request.getStartsAt(), request.getEndsAt());
        return ResponseEntity.ok(valid);
    }

    public record ValidateSlotRequest(UUID staffId, Instant startsAt, Instant endsAt) {}
}
