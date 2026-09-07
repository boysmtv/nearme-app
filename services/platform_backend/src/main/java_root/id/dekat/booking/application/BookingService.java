package id.dekat.booking.application;

import id.dekat.booking.domain.*;
import id.dekat.common.IdempotencyException;
import id.dekat.common.NotFoundException;
import id.dekat.customer.application.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.Random;

@Slf4j
@Service
public class BookingService {

    private static final int HOLD_EXPIRY_MINUTES = 10;

    private final BookingRepository bookingRepository;
    private final BookingHoldRepository bookingHoldRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final BookingItemRepository bookingItemRepository;
    private final BookingAssignmentRepository bookingAssignmentRepository;
    private final CustomerService customerService;
    private final id.dekat.payment.application.PaymentService paymentService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          BookingHoldRepository bookingHoldRepository,
                          BookingStatusHistoryRepository statusHistoryRepository,
                          BookingItemRepository bookingItemRepository,
                          BookingAssignmentRepository bookingAssignmentRepository,
                          CustomerService customerService,
                          @Lazy @Autowired(required = false) id.dekat.payment.application.PaymentService paymentService) {
        this.bookingRepository = bookingRepository;
        this.bookingHoldRepository = bookingHoldRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.bookingItemRepository = bookingItemRepository;
        this.bookingAssignmentRepository = bookingAssignmentRepository;
        this.customerService = customerService;
        this.paymentService = paymentService;
    }

    // Constructor for tests without PaymentService
    public BookingService(BookingRepository bookingRepository,
                          BookingHoldRepository bookingHoldRepository,
                          BookingStatusHistoryRepository statusHistoryRepository,
                          BookingItemRepository bookingItemRepository,
                          BookingAssignmentRepository bookingAssignmentRepository,
                          CustomerService customerService) {
        this(bookingRepository, bookingHoldRepository, statusHistoryRepository, bookingItemRepository, bookingAssignmentRepository, customerService, null);
    }

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

        // Temporarily set items for total calculation, then clear before save
        // (items don't have bookingId yet, so cascade persist would insert NULL booking_id)
        if (items != null) {
            booking.setItems(new ArrayList<>(items));
        }
        booking.recalculateTotal();
        if (items != null) {
            booking.setItems(new ArrayList<>());
        }
        String pin = String.format("%06d", new Random().nextInt(999999));
        booking.setConfirmationPin(pin);
        // Bundle B: default deposit & policy fields
        if (booking.getDepositAmount() == null) booking.setDepositAmount(0);
        if (booking.getDepositRequired() == null) booking.setDepositRequired(false);
        if (booking.getRescheduleCount() == null) booking.setRescheduleCount(0);
        if (booking.getMaxReschedule() == null) booking.setMaxReschedule(1);
        if (booking.getCancelDeadline() == null) {
            // default 24h before start
            booking.setCancelDeadline(hold.getStartsAt().minusHours(24));
        }
        if (booking.getCancelPolicy() == null) {
            booking.setCancelPolicy("24h_full_refund");
        }
        // enforce deposit: if depositRequired true and amount >0, set pending payment until deposit paid
        // For now we still confirm but create payment intent via payment module
        booking.confirm();

        Booking savedBooking = bookingRepository.save(booking);

        // Enforce deposit creation via payment module if required
        if (Boolean.TRUE.equals(savedBooking.getDepositRequired()) && savedBooking.getDepositAmount() != null && savedBooking.getDepositAmount() > 0) {
            try {
                if (paymentService != null) {
                    // create deposit payment intent - will be in PENDING state, gateway will handle
                    paymentService.createPaymentIntent(savedBooking.getId(), tenantId, savedBooking.getDepositAmount(), currency, "DEPOSIT");
                    log.info("[BookingService] Deposit payment intent created for booking {} amount {}", savedBooking.getId(), savedBooking.getDepositAmount());
                } else {
                    log.warn("[BookingService] Deposit required but PaymentService not available for booking {}", savedBooking.getId());
                }
            } catch (Exception e) {
                log.warn("[BookingService] Failed to create deposit intent for booking {}: {}", savedBooking.getId(), e.getMessage());
                // do not fail booking creation, deposit can be paid via separate endpoint
            }
        }

        if (items != null) {
            List<BookingItem> savedItems = new ArrayList<>();
            for (BookingItem item : items) {
                // Safety: derive from hold if missing
                java.time.Instant itemStarts = item.getStartsAt() != null
                        ? item.getStartsAt()
                        : hold.getStartsAt().toInstant();
                java.time.Instant itemEnds = item.getEndsAt() != null
                        ? item.getEndsAt()
                        : hold.getEndsAt().toInstant();

                BookingItem newItem = new BookingItem(
                        savedBooking.getId(), item.getServiceId(), item.getStaffId(),
                        item.getResourceId(), itemStarts, itemEnds,
                        item.getPrice(), item.getDiscount(), item.getTax(), item.getNotes()
                );
                savedItems.add(bookingItemRepository.save(newItem));
            }
            savedBooking.setItems(savedItems);
        }

        if (hold.getStaffId() != null) {
            BookingAssignment assignment = new BookingAssignment(
                    savedBooking.getId(), hold.getStaffId(),
                    hold.getStartsAt(), hold.getEndsAt()
            );
            bookingAssignmentRepository.save(assignment);
        }

        BookingStatusHistory history = new BookingStatusHistory(
                savedBooking.getId(), null, BookingStatus.CONFIRMED,
                customerId, "Booking confirmed from hold");
        statusHistoryRepository.save(history);

        if (customerId != null) {
            customerService.incrementBookingStats(customerId, tenantId, booking.getTotal());
        }

        hold.markConverted();
        bookingHoldRepository.save(hold);

        return savedBooking;
    }

    @Transactional
    public Booking confirmExistingBooking(UUID bookingId, UUID actorId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingStatus fromStatus = booking.getStatus();
        booking.confirm();
        Booking savedBooking = bookingRepository.save(booking);

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.CONFIRMED,
                actorId, "Booking confirmed"));

        return savedBooking;
    }

    @Transactional
    public Booking verifyPin(UUID bookingId, String pin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (booking.getConfirmationPin() == null) {
            throw new IllegalStateException("This booking does not have a confirmation PIN");
        }
        if (!booking.getConfirmationPin().equals(pin)) {
            throw new IllegalArgumentException("Invalid PIN");
        }

        BookingStatus fromStatus = booking.getStatus();
        booking.setPinVerified(true);
        booking.confirm();
        Booking savedBooking = bookingRepository.save(booking);

        statusHistoryRepository.save(new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.CONFIRMED,
                null, "PIN verified, booking confirmed"));

        return savedBooking;
    }

    @Transactional
    public Booking rescheduleBooking(UUID bookingId, OffsetDateTime newStartsAt,
                                     OffsetDateTime newEndsAt, long expectedVersion) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (booking.getVersion() == null || !booking.getVersion().equals(expectedVersion)) {
            throw new IdempotencyException(
                "Booking modified concurrently. Expected v" + expectedVersion
                + " but found v" + booking.getVersion()
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule in status: " + booking.getStatus());
        }

        // Bundle B: reschedule max 1 free else 409 (handle mock default 0)
        Integer countBox = booking.getRescheduleCount();
        Integer maxBox = booking.getMaxReschedule();
        int currentCount = countBox != null ? countBox : 0;
        int maxAllowed = (maxBox != null && maxBox > 0) ? maxBox : 1;
        if (currentCount >= maxAllowed) {
            throw new IllegalStateException("Reschedule limit reached. Maximum " + maxAllowed + " free reschedule(s) allowed");
        }

        validateSlotAvailability(booking.getTenantId(), null, newStartsAt, newEndsAt);

        OffsetDateTime oldStartsAt = booking.getStartsAt();
        OffsetDateTime oldEndsAt = booking.getEndsAt();

        booking.reschedule(newStartsAt, newEndsAt);
        booking.setRescheduleCount(currentCount + 1);
        // update cancelDeadline to new start minus 24h if policy is 24h
        if (booking.getCancelPolicy() != null && booking.getCancelPolicy().contains("24h")) {
            booking.setCancelDeadline(newStartsAt.minusHours(24));
        }
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("oldStartsAt", oldStartsAt.toString());
        metadata.put("oldEndsAt", oldEndsAt.toString());
        metadata.put("newStartsAt", newStartsAt.toString());
        metadata.put("newEndsAt", newEndsAt.toString());
        metadata.put("rescheduleCount", savedBooking.getRescheduleCount());

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, booking.getStatus(), booking.getStatus(),
                null, "Booking rescheduled " + (currentCount+1) + "/" + maxAllowed);
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

        // Bundle B: cancel after deadline => no refund
        boolean afterDeadline = false;
        if (booking.getCancelDeadline() != null && OffsetDateTime.now().isAfter(booking.getCancelDeadline())) {
            afterDeadline = true;
            log.info("[BookingService] Cancel after deadline for booking {} deadline {} now {} => no refund", bookingId, booking.getCancelDeadline(), OffsetDateTime.now());
        }

        BookingStatus fromStatus = booking.getStatus();
        booking.cancel();
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("cancellationReason", reason);
        metadata.put("afterDeadline", afterDeadline);
        metadata.put("depositAmount", booking.getDepositAmount());
        metadata.put("cancelPolicy", booking.getCancelPolicy());
        if (afterDeadline) {
            metadata.put("refund", 0);
            metadata.put("refundNote", "No refund - cancelled after deadline");
        }

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, fromStatus, BookingStatus.CANCELLED,
                actorId, afterDeadline ? reason + " (no refund - after deadline)" : reason, metadata
        );
        statusHistoryRepository.save(history);

        List<BookingAssignment> assignments = bookingAssignmentRepository.findByBookingId(bookingId);
        for (BookingAssignment assignment : assignments) {
            assignment.decline();
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
                    || assignment.getStatus() == BookingAssignment.AssignmentStatus.ACCEPTED) {
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
