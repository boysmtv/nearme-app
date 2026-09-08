package id.dekat.customer.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/customer/recurring-bookings")
public class RecurringBookingController {

    // In-memory store (production would use DB table)
    private static final Map<UUID, List<Map<String, Object>>> store = new HashMap<>();

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        List<Map<String, Object>> bookings = store.getOrDefault(customerId, new ArrayList<>());
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("id", UUID.randomUUID().toString());
        booking.put("customerId", customerId.toString());
        booking.put("serviceName", body.get("serviceName"));
        booking.put("providerName", body.get("providerName"));
        booking.put("frequency", body.getOrDefault("frequency", "weekly"));
        booking.put("dayOfWeek", body.get("dayOfWeek"));
        booking.put("time", body.get("time"));
        booking.put("isActive", true);
        booking.put("nextBooking", OffsetDateTime.now().plusDays(7).toString());
        booking.put("createdAt", OffsetDateTime.now().toString());

        store.computeIfAbsent(customerId, k -> new ArrayList<>()).add(booking);
        return ResponseEntity.ok(ApiResponse.ok(booking));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        for (List<Map<String, Object>> bookings : store.values()) {
            for (Map<String, Object> b : bookings) {
                if (id.toString().equals(b.get("id"))) {
                    if (body.containsKey("frequency")) b.put("frequency", body.get("frequency"));
                    if (body.containsKey("dayOfWeek")) b.put("dayOfWeek", body.get("dayOfWeek"));
                    if (body.containsKey("time")) b.put("time", body.get("time"));
                    if (body.containsKey("isActive")) b.put("isActive", body.get("isActive"));
                    return ResponseEntity.ok(ApiResponse.ok(b));
                }
            }
        }
        throw new RuntimeException("Recurring booking not found");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        for (List<Map<String, Object>> bookings : store.values()) {
            bookings.removeIf(b -> id.toString().equals(b.get("id")));
        }
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
