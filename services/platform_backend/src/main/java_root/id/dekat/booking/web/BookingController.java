package id.dekat.booking.web;

import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingHold;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.booking.domain.BookingStatusHistory;
import id.dekat.booking.web.dto.*;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) UUID customerId,
            Principal principal) {
        int safePage = Math.max(1, page);
        int safeLimit = Math.max(1, limit);
        PageRequest pageRequest = PageRequest.of(safePage - 1, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        BookingStatus statusFilter = parseStatus(status);

        UUID effectiveCustomer = customerId != null ? customerId : currentUserId(principal);
        Page<Booking> result;
        if (tenantId != null) {
            result = statusFilter != null
                    ? bookingRepository.findByTenantIdAndStatus(tenantId, statusFilter, pageRequest)
                    : bookingRepository.findByTenantId(tenantId, pageRequest);
        } else if (effectiveCustomer != null) {
            result = statusFilter != null
                    ? bookingRepository.findByCustomerIdAndStatus(effectiveCustomer, statusFilter, pageRequest)
                    : bookingRepository.findByCustomerId(effectiveCustomer, pageRequest);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("tenantId or customerId is required"));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("data", result.getContent().stream().map(this::toRow).toList());
        payload.put("pagination", Map.of(
                "page", safePage,
                "limit", safeLimit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()));
        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @PostMapping("/holds")
    public ResponseEntity<ApiResponse<BookingHold>> createHold(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateHoldRequest request) {
        UUID customerId = request.getCustomerId() != null
                ? request.getCustomerId()
                : UUID.fromString(jwt.getSubject());
        BookingHold hold = bookingService.createHold(
                request.getTenantId(), request.getLocationId(), request.getServiceId(),
                request.getStaffId(), request.getResourceId(), customerId,
                request.getStartsAt(), request.getEndsAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(hold));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateBookingRequest request) {
        UUID customerId = request.getCustomerId() != null
                ? request.getCustomerId()
                : UUID.fromString(jwt.getSubject());

        // Convert BookingItemRequest DTOs to BookingItem domain entities
        List<id.dekat.booking.domain.BookingItem> domainItems = null;
        if (request.getItems() != null) {
            domainItems = new java.util.ArrayList<>();
            for (BookingItemRequest req : request.getItems()) {
                java.time.Instant starts = req.getStartsAt() != null
                        ? java.time.Instant.parse(req.getStartsAt()) : null;
                java.time.Instant ends = req.getEndsAt() != null
                        ? java.time.Instant.parse(req.getEndsAt()) : null;
                int price = req.getPrice() != null ? req.getPrice()
                        : (req.getPriceSnapshot() != null ? req.getPriceSnapshot() : 0);
                domainItems.add(new id.dekat.booking.domain.BookingItem(
                        null,
                        req.getServiceId() != null ? UUID.fromString(req.getServiceId()) : null,
                        req.getStaffId() != null ? UUID.fromString(req.getStaffId()) : null,
                        req.getResourceId() != null ? UUID.fromString(req.getResourceId()) : null,
                        starts, ends,
                        price,
                        req.getDiscount() != null ? req.getDiscount() : 0,
                        req.getTax() != null ? req.getTax() : 0,
                        req.getNotes()
                ));
            }
        }

        Booking booking = bookingService.confirmBooking(
                request.getHoldId(), request.getTenantId(), request.getLocationId(),
                customerId, request.getCurrency(), domainItems
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(booking));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBooking(id)));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Booking>> confirmBooking(@PathVariable UUID id,
                                                   @AuthenticationPrincipal Jwt jwt,
                                                   @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.confirmExistingBooking(id, effectiveActorId)));
    }

    @PostMapping("/{id}/verify-pin")
    public ResponseEntity<ApiResponse<Booking>> verifyPin(@PathVariable UUID id,
                                              @Valid @RequestBody VerifyPinRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(bookingService.verifyPin(id, request.getPin())));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<Booking>> reschedule(@PathVariable UUID id,
                                              @Valid @RequestBody RescheduleRequest request) {
        try {
            Booking booking = bookingService.rescheduleBooking(
                    id, request.getNewStartsAt(), request.getNewEndsAt(),
                    request.getExpectedVersion()
            );
            return ResponseEntity.ok(ApiResponse.ok(booking));
        } catch (IllegalStateException e) {
            String msg = e.getMessage() != null && e.getMessage().contains("Reschedule limit") ? e.getMessage() : "Time slot not available or reschedule not allowed: " + e.getMessage();
            // 409 for reschedule limit exceeded
            if (e.getMessage() != null && e.getMessage().contains("Reschedule limit")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(msg));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancel(@PathVariable UUID id,
                                          @RequestParam(required = false) String reason,
                                          @AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        try {
            return ResponseEntity.ok(ApiResponse.ok(bookingService.cancelBooking(id, reason, effectiveActorId)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<Booking>> checkIn(@PathVariable UUID id,
                                           @AuthenticationPrincipal Jwt jwt,
                                           @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.checkIn(id, effectiveActorId)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<Booking>> startService(@PathVariable UUID id,
                                                @AuthenticationPrincipal Jwt jwt,
                                                @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.startService(id, effectiveActorId)));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Booking>> complete(@PathVariable UUID id,
                                            @AuthenticationPrincipal Jwt jwt,
                                            @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.completeService(id, effectiveActorId)));
    }

    @PostMapping("/{id}/no-show")
    public ResponseEntity<ApiResponse<Booking>> noShow(@PathVariable UUID id,
                                          @AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Actor-Id", required = false) UUID actorId) {
        UUID effectiveActorId = actorId != null ? actorId : UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.recordNoShow(id, effectiveActorId)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<BookingStatusHistory>>> getBookingHistory(@PathVariable UUID id) {
        List<BookingStatusHistory> history = bookingService.getBookingHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Booking>> getBookingByCode(@PathVariable String code) {
        Booking booking = bookingService.getBookingByCode(code);
        return ResponseEntity.ok(ApiResponse.ok(booking));
    }

    private Map<String, Object> toRow(Booking booking) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", booking.getId().toString());
        row.put("tenantId", booking.getTenantId().toString());
        row.put("locationId", booking.getLocationId().toString());
        row.put("customerId", booking.getCustomerId().toString());
        row.put("bookingCode", booking.getBookingCode());
        row.put("status", booking.getStatus().name());
        row.put("serviceMode", booking.getServiceMode().name());
        row.put("startsAt", booking.getStartsAt());
        row.put("endsAt", booking.getEndsAt());
        row.put("currency", booking.getCurrency());
        row.put("total", booking.getTotal());
        row.put("createdAt", booking.getCreatedAt());
        return row;
    }

    private UUID currentUserId(Principal principal) {
        if (principal == null) {
            return null;
        }
        String name = principal.getName();
        if (name == null) {
            return null;
        }
        try {
            return UUID.fromString(name);
        } catch (IllegalArgumentException e) {
            return null;
        } catch (NullPointerException e) {
            return null;
        }
    }

    private BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return BookingStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
