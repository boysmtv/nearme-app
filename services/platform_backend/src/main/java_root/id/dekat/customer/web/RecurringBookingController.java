package id.dekat.customer.web;

import id.dekat.customer.domain.*;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/customer/recurring-bookings")
@RequiredArgsConstructor
public class RecurringBookingController {

    private final RecurringBookingRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringBooking>>> list(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        List<RecurringBooking> bookings = repository.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<RecurringBooking>> create(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestBody Map<String, Object> body) {
        UUID tenantId = UUID.fromString((String) body.get("tenantId"));
        UUID serviceId = UUID.fromString((String) body.get("serviceId"));
        UUID staffId = body.get("staffId") != null ? UUID.fromString((String) body.get("staffId")) : null;
        String frequency = (String) body.getOrDefault("frequency", "WEEKLY");
        Integer dayOfWeek = body.get("dayOfWeek") != null ? ((Number) body.get("dayOfWeek")).intValue() : null;
        Integer dayOfMonth = body.get("dayOfMonth") != null ? ((Number) body.get("dayOfMonth")).intValue() : null;
        String timeStr = (String) body.get("time");
        LocalTime timeOfDay = timeStr != null ? LocalTime.parse(timeStr) : null;
        String startDateStr = (String) body.getOrDefault("startDate", LocalDate.now().toString());
        LocalDate startDate = LocalDate.parse(startDateStr);

        RecurringBooking booking = RecurringBooking.builder()
                .customerId(customerId)
                .tenantId(tenantId)
                .serviceId(serviceId)
                .staffId(staffId)
                .frequency(frequency)
                .dayOfWeek(dayOfWeek)
                .dayOfMonth(dayOfMonth)
                .timeOfDay(timeOfDay)
                .startDate(startDate)
                .nextOccurrence(startDate.plusWeeks(1))
                .isActive(true)
                .build();

        RecurringBooking saved = repository.save(booking);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<RecurringBooking>> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        RecurringBooking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring booking not found"));

        if (body.containsKey("frequency")) booking.setFrequency((String) body.get("frequency"));
        if (body.containsKey("dayOfWeek")) booking.setDayOfWeek(((Number) body.get("dayOfWeek")).intValue());
        if (body.containsKey("dayOfMonth")) booking.setDayOfMonth(((Number) body.get("dayOfMonth")).intValue());
        if (body.containsKey("time")) booking.setTimeOfDay(LocalTime.parse((String) body.get("time")));
        if (body.containsKey("isActive")) booking.setIsActive((Boolean) body.get("isActive"));

        RecurringBooking saved = repository.save(booking);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
