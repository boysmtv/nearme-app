package id.dekat.booking.web;

import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingHold;
import id.dekat.booking.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/holds")
    public ResponseEntity<BookingHold> createHold(@RequestBody CreateHoldRequest request) {
        BookingHold hold = bookingService.createHold(
                request.getTenantId(), request.getLocationId(), request.getServiceId(),
                request.getStaffId(), request.getResourceId(), request.getCustomerId(),
                request.getStartsAt(), request.getEndsAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(hold);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody CreateBookingRequest request) {
        Booking booking = bookingService.confirmBooking(
                request.getHoldId(), request.getTenantId(), request.getLocationId(),
                request.getCustomerId(), request.getCurrency(), request.getItems()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirmBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<Booking> reschedule(@PathVariable UUID id,
                                              @RequestBody RescheduleRequest request) {
        Booking booking = bookingService.rescheduleBooking(
                id, request.getNewStartsAt(), request.getNewEndsAt(),
                request.getExpectedVersion()
        );
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable UUID id,
                                          @RequestParam(required = false) String reason,
                                          @RequestHeader("X-Actor-Id") UUID actorId) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason, actorId));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<Booking> checkIn(@PathVariable UUID id,
                                           @RequestHeader("X-Actor-Id") UUID actorId) {
        return ResponseEntity.ok(bookingService.checkIn(id, actorId));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Booking> startService(@PathVariable UUID id,
                                                @RequestHeader("X-Actor-Id") UUID actorId) {
        return ResponseEntity.ok(bookingService.startService(id, actorId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Booking> complete(@PathVariable UUID id,
                                            @RequestHeader("X-Actor-Id") UUID actorId) {
        return ResponseEntity.ok(bookingService.completeService(id, actorId));
    }

    @PostMapping("/{id}/no-show")
    public ResponseEntity<Booking> noShow(@PathVariable UUID id,
                                          @RequestHeader("X-Actor-Id") UUID actorId) {
        return ResponseEntity.ok(bookingService.recordNoShow(id, actorId));
    }
}
