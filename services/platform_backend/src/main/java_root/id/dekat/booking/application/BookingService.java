package id.dekat.booking.application;

import id.dekat.booking.domain.*;
import id.dekat.common.IdempotencyException;
import id.dekat.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int HOLD_EXPIRY_MINUTES = 10;

    private final BookingRepository bookingRepository;
    private final BookingHoldRepository bookingHoldRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final BookingItemRepository bookingItemRepository;
    private final BookingAssignmentRepository bookingAssignmentRepository;

    @Transactional
    public BookingHold createHold(UUID tenantId, UUID locationId, UUID serviceId,
                                  UUID staffId, UUID resourceId, UUID customerId,
                                  OffsetDateTime startsAt, OffsetDateTime endsAt) {
        if (startsAt == null || endsAt == null) {
            throw new IllegalArgumentException("Start and end times are required");
        }
        if (!startsAt.isBefore(endsAt)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (startsAt.isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Cannot hold a slot in the past");
        }

        validateSlotAvailability(tenantId, staffId, startsAt, endsAt);

        BookingHold hold = new BookingHold(
                tenantId, locationId, serviceId, staffId, resourceId, customerId,
                startsAt, endsAt, OffsetDateTime.now().plusMinutes(HOLD_EXPIRY_MINUTES)
        );

        return bookingHoldRepository.save(hold);
    }

    @Transactional
    public Booking confirmBooking(UUID holdId, UUID tenantId, UUID locationId,
                                  UUID customerId, String currency, List<BookingItem> items) {
        BookingHold hold = bookingHoldRepository.findById(holdId)
                .orElseThrow(() -> new NotFoundException("Hold not found: " + holdId));

        if (hold.getStatus() != BookingHold.HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is no longer active: " + hold.getStatus());
        }
        if (hold.isExpired()) {
            hold.markExpired();
            bookingHoldRepository.save(hold);
            throw new IllegalStateException("Hold has expired. Please create a new hold.");
        }

        UUID effectiveLocationId = locationId != null ? locationId : hold.getLocationId();
        String bookingCode = generateBookingCode(tenantId);

        Booking booking = new Booking(
                tenantId, effectiveLocationId, customerId, bookingCode,
                ServiceMode.IN_PERSON,
                hold.getStartsAt(), hold.getEndsAt(),
                ZoneId.of("Asia/Jakarta"),
                currency
        );

        if (items != null) {
            booking.setItems(items);
        }
        booking.recalculateTotal();
        booking.confirm();

        Booking savedBooking = bookingRepository.save(booking);

        if (items != null) {
            for (BookingItem item : items) {
                BookingItem newItem = new BookingItem(
                        savedBooking.getId(), item.getServiceId(), item.getVariantId(),
                        item.getNameSnapshot(), item.getPriceSnapshot(),
                        item.getDurationSnapshot(), item.getQuantity()
                );
                bookingItemRepository.save(newItem);
            }
        }

        if (hold.getStaffId() != null) {
            BookingAssignment assignment = new BookingAssignment(
                    savedBooking.getId(), hold.getStaffId(), hold.getResourceId(),
                    hold.getStartsAt(), hold.getEndsAt()
            );
            bookingAssignmentRepository.save(assignment);
        }

        BookingStatusHistory history = new BookingStatusHistory(
                savedBooking.getId(), null, BookingStatus.CONFIRMED,
                customerId, "Booking confirmed from hold");
        statusHistoryRepository.save(history);

        hold.markConverted();
        bookingHoldRepository.save(hold);

        return savedBooking;
    }

    @Transactional
    public Booking rescheduleBooking(UUID bookingId, OffsetDateTime newStartsAt,
                                     OffsetDateTime newEndsAt, long expectedVersion) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (!booking.getVersion().equals(expectedVersion)) {
            throw new IdempotencyException(
                "Booking modified concurrently. Expected v" + expectedVersion
                + " but found v" + booking.getVersion()
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule in status: " + booking.getStatus());
        }

        validateSlotAvailability(booking.getTenantId(), null, newStartsAt, newEndsAt);

        OffsetDateTime oldStartsAt = booking.getStartsAt();
        OffsetDateTime oldEndsAt = booking.getEndsAt();

        booking.reschedule(newStartsAt, newEndsAt);
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("oldStartsAt", oldStartsAt.toString());
        metadata.put("oldEndsAt", oldEndsAt.toString());
        metadata.put("newStartsAt", newStartsAt.toString());
        metadata.put("newEndsAt", newEndsAt.toString());

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, booking.getStatus(), booking.getStatus(),
                null, "Booking rescheduled");
        statusHistoryRepository.save(history);

        return savedBooking;
    }

    @Transactional
    public Booking cancelBooking(UUID bookingId, String reason, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        BookingStatus fromStatus = booking.getStatus();
        booking.cancel();
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("cancellationReason", reason);

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.CANCELLED,
                actorId, reason, metadata
        );
        statusHistoryRepository.save(history);

        List<BookingAssignment> assignments = bookingAssignmentRepository.findByBookingId(bookingId);
        for (BookingAssignment assignment : assignments) {
            assignment.cancel();
            bookingAssignmentRepository.save(assignment);
        }

        return savedBooking;
    }

    @Transactional
    public Booking checkIn(UUID bookingId, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingStatus fromStatus = booking.getStatus();
        booking.checkIn();
        Booking savedBooking = bookingRepository.save(booking);

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.CHECKED_IN,
                actorId, "Customer checked in"));

        return savedBooking;
    }

    @Transactional
    public Booking startService(UUID bookingId, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingStatus fromStatus = booking.getStatus();
        booking.startService();
        Booking savedBooking = bookingRepository.save(booking);

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.IN_SERVICE,
                actorId, "Service started"));

        return savedBooking;
    }

    @Transactional
    public Booking completeService(UUID bookingId, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingStatus fromStatus = booking.getStatus();
        booking.complete();

        Map<String, Object> metadata = new HashMap<>();
        if (booking.getStartsAt() != null) {
            Duration actualDuration = Duration.between(booking.getStartsAt(), OffsetDateTime.now());
            metadata.put("actualDurationMinutes", actualDuration.toMinutes());
        }

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.COMPLETED,
                actorId, "Service completed", metadata.isEmpty() ? null : metadata
        ));

        List<BookingAssignment> assignments = bookingAssignmentRepository.findByBookingId(bookingId);
        for (BookingAssignment assignment : assignments) {
            if (assignment.getStatus() == BookingAssignment.AssignmentStatus.ASSIGNED
                    || assignment.getStatus() == BookingAssignment.AssignmentStatus.CONFIRMED) {
                assignment.complete();
                bookingAssignmentRepository.save(assignment);
            }
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking recordNoShow(UUID bookingId, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingStatus fromStatus = booking.getStatus();
        booking.noShow();
        Booking savedBooking = bookingRepository.save(booking);

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.NO_SHOW,
                actorId, "No-show recorded", null
        ));

        return savedBooking;
    }

    @Transactional(readOnly = true)
    public void validateSlotAvailability(UUID tenantId, UUID staffId,
                                         OffsetDateTime startsAt, OffsetDateTime endsAt) {
        List<Booking> overlaps;
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.EN_ROUTE,
                BookingStatus.IN_SERVICE, BookingStatus.PENDING_APPROVAL, BookingStatus.HELD);
        if (staffId != null) {
            overlaps = bookingRepository.findOverlappingBookingsForStaff(
                    tenantId, staffId, startsAt, endsAt, activeStatuses
            );
        } else {
            overlaps = bookingRepository.findOverlappingBookings(tenantId, startsAt, endsAt, activeStatuses);
        }
        if (!overlaps.isEmpty()) {
            throw new IllegalStateException("Time slot not available: overlapping bookings exist");
        }

        List<BookingHold> holdOverlaps = bookingHoldRepository.findOverlappingHolds(
                tenantId, startsAt, endsAt
        );
        if (!holdOverlaps.isEmpty()) {
            throw new IllegalStateException("Time slot not available: overlapping holds exist");
        }
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredHolds() {
        int expired = bookingHoldRepository.expireHolds(OffsetDateTime.now());
        if (expired > 0) {
            System.out.println("[BookingService] Released " + expired + " expired holds");
        }
    }

    @Transactional(readOnly = true)
    public Booking getBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));
        booking.getItems().size();
        booking.getAssignments().size();
        return booking;
    }

    @Transactional(readOnly = true)
    public Booking getBookingByCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new NotFoundException("Booking not found with code: " + bookingCode));
    }

    @Transactional(readOnly = true)
    public List<BookingStatusHistory> getBookingHistory(UUID bookingId) {
        return statusHistoryRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    private String generateBookingCode(UUID tenantId) {
        String prefix = "DKT-";
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = prefix + generateRandomCode(5);
            if (bookingRepository.findByBookingCode(code).isEmpty()) {
                return code;
            }
        }
        throw new RuntimeException("Unable to generate unique booking code");
    }

    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(ThreadLocalRandom.current().nextInt(chars.length())));
        }
        return sb.toString();
    }
}

