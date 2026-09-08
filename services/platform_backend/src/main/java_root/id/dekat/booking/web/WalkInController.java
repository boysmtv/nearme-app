package id.dekat.booking.web;

import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.*;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/provider/walk-in")
public class WalkInController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    public WalkInController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createWalkIn(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        UUID locationId = UUID.fromString((String) body.get("locationId"));
        UUID serviceId = UUID.fromString((String) body.get("serviceId"));
        UUID staffId = body.get("staffId") != null ? UUID.fromString((String) body.get("staffId")) : null;
        String customerName = (String) body.getOrDefault("customerName", "Walk-In");
        String customerPhone = (String) body.get("customerPhone");

        // Create instant booking for walk-in
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Jakarta"));
        OffsetDateTime endsAt = now.plusMinutes(30); // default 30 min

        BookingHold hold = bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, null, now, endsAt);

        UUID walkInCustomerId = UUID.randomUUID(); // anonymous walk-in
        Booking booking = bookingService.confirmBooking(
                hold.getId(), tenantId, locationId, walkInCustomerId, "IDR", null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", booking.getId().toString());
        result.put("bookingCode", booking.getBookingCode());
        result.put("status", booking.getStatus().toString());
        result.put("customerName", customerName);
        result.put("source", "WALK_IN");
        result.put("createdAt", now.toString());
        result.put("qrData", "DEKAT-" + booking.getBookingCode());

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/qr/{bookingCode}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWalkInQR(
            @PathVariable String bookingCode) {
        Optional<Booking> bookingOpt = bookingRepository.findByBookingCode(bookingCode);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of("error", "Booking not found")));
        }

        Booking booking = bookingOpt.get();
        Map<String, Object> qrInfo = new LinkedHashMap<>();
        qrInfo.put("bookingCode", booking.getBookingCode());
        qrInfo.put("status", booking.getStatus().toString());
        qrInfo.put("qrData", "DEKAT-" + booking.getBookingCode());
        qrInfo.put("checkInUrl", "/api/v1/bookings/" + booking.getId() + "/check-in");

        return ResponseEntity.ok(ApiResponse.ok(qrInfo));
    }
}
