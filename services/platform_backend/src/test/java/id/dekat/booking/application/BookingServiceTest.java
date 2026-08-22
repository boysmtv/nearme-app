package id.dekat.booking.application;

import id.dekat.booking.domain.*;
import id.dekat.common.IdempotencyException;
import id.dekat.common.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingHoldRepository bookingHoldRepository;
    @Mock
    private BookingStatusHistoryRepository statusHistoryRepository;
    @Mock
    private BookingItemRepository bookingItemRepository;
    @Mock
    private BookingAssignmentRepository bookingAssignmentRepository;

    @InjectMocks
    private BookingService bookingService;

    private UUID tenantId;
    private UUID locationId;
    private UUID serviceId;
    private UUID staffId;
    private UUID resourceId;
    private UUID customerId;
    private OffsetDateTime now;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        locationId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        resourceId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        now = OffsetDateTime.now();
    }

    @Nested
    @DisplayName("createHold")
    class CreateHoldTests {

        @Test
        @DisplayName("should create hold successfully when slot is available")
        void testCreateHold_Success() {
            OffsetDateTime startsAt = now.plusHours(2);
            OffsetDateTime endsAt = now.plusHours(3);

            when(bookingRepository.findOverlappingBookingsForStaff(
                    eq(tenantId), eq(staffId), eq(startsAt), eq(endsAt)))
                    .thenReturn(Collections.emptyList());
            when(bookingHoldRepository.findOverlappingHolds(
                    eq(tenantId), eq(startsAt), eq(endsAt)))
                    .thenReturn(Collections.emptyList());
            when(bookingHoldRepository.save(any(BookingHold.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            BookingHold hold = bookingService.createHold(
                    tenantId, locationId, serviceId, staffId, resourceId,
                    customerId, startsAt, endsAt);

            assertThat(hold).isNotNull();
            assertThat(hold.getTenantId()).isEqualTo(tenantId);
            assertThat(hold.getStaffId()).isEqualTo(staffId);
            assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.ACTIVE);
            verify(bookingHoldRepository).save(any(BookingHold.class));
        }

        @Test
        @DisplayName("should throw when slot has overlapping booking")
        void testCreateHold_SlotConflict() {
            OffsetDateTime startsAt = now.plusHours(2);
            OffsetDateTime endsAt = now.plusHours(3);

            Booking existingBooking = mock(Booking.class);
            when(bookingRepository.findOverlappingBookingsForStaff(
                    eq(tenantId), eq(staffId), eq(startsAt), eq(endsAt)))
                    .thenReturn(List.of(existingBooking));

            assertThatThrownBy(() ->
                    bookingService.createHold(tenantId, locationId, serviceId,
                            staffId, resourceId, customerId, startsAt, endsAt))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("overlapping bookings exist");

            verify(bookingHoldRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when slot has overlapping hold")
        void testCreateHold_ExpiredSlot() {
            OffsetDateTime startsAt = now.plusHours(2);
            OffsetDateTime endsAt = now.plusHours(3);

            when(bookingRepository.findOverlappingBookingsForStaff(
                    eq(tenantId), eq(staffId), eq(startsAt), eq(endsAt)))
                    .thenReturn(Collections.emptyList());

            BookingHold existingHold = mock(BookingHold.class);
            when(bookingHoldRepository.findOverlappingHolds(
                    eq(tenantId), eq(startsAt), eq(endsAt)))
                    .thenReturn(List.of(existingHold));

            assertThatThrownBy(() ->
                    bookingService.createHold(tenantId, locationId, serviceId,
                            staffId, resourceId, customerId, startsAt, endsAt))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("overlapping holds exist");
        }
    }

    @Nested
    @DisplayName("confirmBooking")
    class ConfirmBookingTests {

        @Test
        @DisplayName("should confirm booking from active hold")
        void testConfirmBooking_Success() {
            UUID holdId = UUID.randomUUID();
            BookingHold hold = createActiveHold(holdId);

            when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
            when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> {
                        Booking b = invocation.getArgument(0);
                        b.setId(UUID.randomUUID());
                        return b;
                    });
            when(bookingHoldRepository.save(any(BookingHold.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Booking booking = bookingService.confirmBooking(
                    holdId, tenantId, locationId, customerId, "IDR", null);

            assertThat(booking).isNotNull();
            assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
            assertThat(booking.getBookingCode()).startsWith("DKT-");
            verify(statusHistoryRepository).save(any(BookingStatusHistory.class));
            verify(bookingHoldRepository, atLeastOnce()).save(any(BookingHold.class));
        }

        @Test
        @DisplayName("should throw when hold has expired")
        void testConfirmBooking_ExpiredHold() {
            UUID holdId = UUID.randomUUID();
            BookingHold hold = createActiveHold(holdId);
            hold.setExpiresAt(OffsetDateTime.now().minusMinutes(5));

            when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
            when(bookingHoldRepository.save(any(BookingHold.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            assertThatThrownBy(() ->
                    bookingService.confirmBooking(holdId, tenantId, locationId,
                            customerId, "IDR", null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("expired");
        }
    }

    @Nested
    @DisplayName("rescheduleBooking")
    class RescheduleBookingTests {

        @Test
        @DisplayName("should reschedule booking successfully")
        void testRescheduleBooking_Success() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createConfirmedBooking(bookingId);
            booking.setVersion(1L);

            OffsetDateTime newStart = now.plusDays(1).withHour(10).withMinute(0);
            OffsetDateTime newEnd = now.plusDays(1).withHour(11).withMinute(0);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
            when(bookingRepository.findOverlappingBookings(
                    eq(tenantId), eq(newStart), eq(newEnd)))
                    .thenReturn(Collections.emptyList());
            when(bookingHoldRepository.findOverlappingHolds(
                    eq(tenantId), eq(newStart), eq(newEnd)))
                    .thenReturn(Collections.emptyList());
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Booking result = bookingService.rescheduleBooking(
                    bookingId, newStart, newEnd, 1L);

            assertThat(result.getStartsAt()).isEqualTo(newStart);
            assertThat(result.getEndsAt()).isEqualTo(newEnd);
            verify(statusHistoryRepository).save(any(BookingStatusHistory.class));
        }

        @Test
        @DisplayName("should throw on version conflict")
        void testRescheduleBooking_Conflict() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createConfirmedBooking(bookingId);
            booking.setVersion(2L);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

            OffsetDateTime newStart = now.plusDays(1).withHour(10);
            OffsetDateTime newEnd = now.plusDays(1).withHour(11);

            assertThatThrownBy(() ->
                    bookingService.rescheduleBooking(bookingId, newStart, newEnd, 1L))
                    .isInstanceOf(IdempotencyException.class)
                    .hasMessageContaining("concurrently");
        }
    }

    @Nested
    @DisplayName("cancelBooking")
    class CancelBookingTests {

        @Test
        @DisplayName("should cancel and allow full refund for early cancellation")
        void testCancelBooking_FullRefund() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createConfirmedBooking(bookingId);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(bookingAssignmentRepository.findByBookingId(bookingId))
                    .thenReturn(Collections.emptyList());

            Booking result = bookingService.cancelBooking(
                    bookingId, "Customer requested", customerId);

            assertThat(result.getStatus()).isEqualTo(BookingStatus.CANCELLED);
            assertThat(result.getCancelledAt()).isNotNull();
            verify(statusHistoryRepository).save(any(BookingStatusHistory.class));
        }

        @Test
        @DisplayName("should cancel and record partial refund policy")
        void testCancelBooking_PartialRefund() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createConfirmedBooking(bookingId);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(bookingAssignmentRepository.findByBookingId(bookingId))
                    .thenReturn(Collections.emptyList());

            Booking result = bookingService.cancelBooking(
                    bookingId, "Late cancellation - partial refund", customerId);

            assertThat(result.getStatus()).isEqualTo(BookingStatus.CANCELLED);
            verify(statusHistoryRepository).save(argThat(history ->
                    "Late cancellation - partial refund".equals(history.getReason())));
        }
    }

    @Nested
    @DisplayName("completeService")
    class CompleteServiceTests {

        @Test
        @DisplayName("should complete in-service booking")
        void testCompleteService_Success() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createInServiceBooking(bookingId);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(bookingAssignmentRepository.findByBookingId(bookingId))
                    .thenReturn(Collections.emptyList());

            Booking result = bookingService.completeService(bookingId, staffId);

            assertThat(result.getStatus()).isEqualTo(BookingStatus.COMPLETED);
            assertThat(result.getCompletedAt()).isNotNull();
            verify(statusHistoryRepository).save(argThat(history ->
                    BookingStatus.COMPLETED.equals(history.getToStatus())));
        }
    }

    @Nested
    @DisplayName("recordNoShow")
    class RecordNoShowTests {

        @Test
        @DisplayName("should record no-show for confirmed booking")
        void testRecordNoShow_Success() {
            UUID bookingId = UUID.randomUUID();
            Booking booking = createConfirmedBooking(bookingId);

            when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Booking result = bookingService.recordNoShow(bookingId, staffId);

            assertThat(result.getStatus()).isEqualTo(BookingStatus.NO_SHOW);
            verify(statusHistoryRepository).save(argThat(history ->
                    BookingStatus.NO_SHOW.equals(history.getToStatus())));
        }
    }

    @Nested
    @DisplayName("releaseExpiredHolds")
    class ReleaseExpiredHoldsTests {

        @Test
        @DisplayName("should release expired holds")
        void testReleaseExpiredHolds() {
            when(bookingHoldRepository.expireHolds(any(OffsetDateTime.class))).thenReturn(3);

            bookingService.releaseExpiredHolds();

            verify(bookingHoldRepository).expireHolds(any(OffsetDateTime.class));
        }
    }

    // --- Helper methods ---

    private BookingHold createActiveHold(UUID holdId) {
        BookingHold hold = new BookingHold(
                tenantId, locationId, serviceId, staffId, resourceId, customerId,
                now.plusHours(2), now.plusHours(3),
                OffsetDateTime.now().plusMinutes(10)
        );
        return hold;
    }

    private Booking createConfirmedBooking(UUID bookingId) {
        Booking booking = new Booking(
                tenantId, locationId, customerId, "DKT-TEST1",
                ServiceMode.AT_BUSINESS, now.plusDays(1).withHour(10),
                now.plusDays(1).withHour(11), ZoneId.of("Asia/Jakarta"), "IDR"
        );
        booking.setId(bookingId);
        booking.confirm();
        return booking;
    }

    private Booking createInServiceBooking(UUID bookingId) {
        Booking booking = createConfirmedBooking(bookingId);
        booking.checkIn();
        booking.startService();
        return booking;
    }
}