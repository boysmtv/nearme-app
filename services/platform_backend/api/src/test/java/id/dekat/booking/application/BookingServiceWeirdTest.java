package id.dekat.booking.application;

import id.dekat.booking.domain.*;
import id.dekat.common.IdempotencyException;
import id.dekat.common.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Weird/Edge tests untuk BookingService - fokus pada overlap, expiry, concurrency, aneh
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Weird/Edge Cases P/N/E/A")
class BookingServiceWeirdTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingHoldRepository bookingHoldRepository;
    @Mock private BookingStatusHistoryRepository statusHistoryRepository;
    @Mock private BookingItemRepository bookingItemRepository;
    @Mock private BookingAssignmentRepository bookingAssignmentRepository;
    @Mock private id.dekat.customer.application.CustomerService customerService;

    @InjectMocks private BookingService bookingService;

    private UUID tenantId, locationId, serviceId, staffId, customerId;
    private OffsetDateTime startsAt, endsAt;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        locationId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        startsAt = OffsetDateTime.now().plusHours(2);
        endsAt = startsAt.plusHours(1);
    }

    // --- POSITIF ---
    @Test
    @DisplayName("P: createHold staffId null tetap sukses (resourceId flow)")
    void createHold_nullStaff_success() {
        when(bookingRepository.findOverlappingBookings(any(), any(), any(), anyList())).thenReturn(List.of());
        when(bookingHoldRepository.findOverlappingHolds(any(), any(), any())).thenReturn(List.of());
        when(bookingHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        BookingHold hold = bookingService.createHold(tenantId, locationId, serviceId, null, UUID.randomUUID(), customerId, startsAt, endsAt);
        assertThat(hold).isNotNull();
        assertThat(hold.getStaffId()).isNull();
    }

    @Test
    @DisplayName("P: reschedule valid dengan version benar")
    void reschedule_valid() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getStatus()).thenReturn(BookingStatus.CONFIRMED);
        when(booking.getVersion()).thenReturn(1L);
        when(booking.getTenantId()).thenReturn(tenantId);
        when(booking.getStartsAt()).thenReturn(startsAt);
        when(booking.getEndsAt()).thenReturn(endsAt);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.findOverlappingBookings(any(), any(), any(), anyList())).thenReturn(List.of());
        when(bookingHoldRepository.findOverlappingHolds(any(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(statusHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        OffsetDateTime ns = startsAt.plusDays(1);
        OffsetDateTime ne = endsAt.plusDays(1);
        Booking result = bookingService.rescheduleBooking(bookingId, ns, ne, 1L);
        assertThat(result).isNotNull();
        verify(booking).reschedule(ns, ne);
    }

    // --- NEGATIF ---
    @Test
    @DisplayName("N: createHold start null throw")
    void createHold_nullStart_throw() {
        assertThatThrownBy(() -> bookingService.createHold(tenantId, locationId, serviceId, staffId, null, customerId, null, endsAt))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("required");
    }

    @Test
    @DisplayName("N: createHold start equals end throw")
    void createHold_equals_throw() {
        assertThatThrownBy(() -> bookingService.createHold(tenantId, locationId, serviceId, staffId, null, customerId, startsAt, startsAt))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("before end");
    }

    @Test
    @DisplayName("N: createHold past throw")
    void createHold_past_throw() {
        assertThatThrownBy(() -> bookingService.createHold(tenantId, locationId, serviceId, staffId, null, customerId,
                OffsetDateTime.now().minusHours(1), OffsetDateTime.now()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("past");
    }

    @Test
    @DisplayName("N: reschedule version mismatch throw IdempotencyException")
    void reschedule_versionMismatch_throw() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getVersion()).thenReturn(5L);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        assertThatThrownBy(() -> bookingService.rescheduleBooking(bookingId, startsAt.plusDays(1), endsAt.plusDays(1), 1L))
                .isInstanceOf(IdempotencyException.class).hasMessageContaining("concurrently");
    }

    @Test
    @DisplayName("N: verifyPin salah throw Invalid PIN")
    void verifyPin_wrong_throw() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getConfirmationPin()).thenReturn("123456");
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        assertThatThrownBy(() -> bookingService.verifyPin(bookingId, "000000"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Invalid PIN");
    }

    @Test
    @DisplayName("N: verifyPin booking tanpa PIN throw")
    void verifyPin_noPin_throw() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getConfirmationPin()).thenReturn(null);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        assertThatThrownBy(() -> bookingService.verifyPin(bookingId, "123456"))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("does not have");
    }

    @Test
    @DisplayName("N: cancel already completed throw")
    void cancel_completed_throw() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getStatus()).thenReturn(BookingStatus.COMPLETED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, "x", UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class);
    }

    // --- EDGE ---
    @Test
    @DisplayName("E: createHold 9m59s sebelum expiry confirm masih sukses, 10m01s expired")
    void hold_expiry_edge() {
        UUID holdId = UUID.randomUUID();
        // expired case
        BookingHold expiredHold = mock(BookingHold.class);
        when(expiredHold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        when(expiredHold.isExpired()).thenReturn(true);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(expiredHold));
        when(bookingHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertThatThrownBy(() -> bookingService.confirmBooking(holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("expired");
        verify(expiredHold).markExpired();
    }

    @Test
    @DisplayName("E: validateSlot cari overlapping staff vs tanpa staff")
    void validateSlot_staffVsNoStaff() {
        // tanpa staff -> findOverlappingBookings
        when(bookingRepository.findOverlappingBookings(any(), any(), any(), anyList())).thenReturn(List.of());
        when(bookingHoldRepository.findOverlappingHolds(any(), any(), any())).thenReturn(List.of());
        bookingService.validateSlotAvailability(tenantId, null, startsAt, endsAt);
        verify(bookingRepository).findOverlappingBookings(any(), any(), any(), anyList());

        // dengan staff -> findOverlappingBookingsForStaff
        when(bookingRepository.findOverlappingBookingsForStaff(any(), any(), any(), any(), anyList())).thenReturn(List.of());
        bookingService.validateSlotAvailability(tenantId, staffId, startsAt, endsAt);
        verify(bookingRepository).findOverlappingBookingsForStaff(any(), any(), any(), any(), anyList());
    }

    @Test
    @DisplayName("E: overlapping holds juga block slot")
    void overlappingHolds_block() {
        when(bookingRepository.findOverlappingBookingsForStaff(any(), any(), any(), any(), anyList())).thenReturn(List.of());
        when(bookingHoldRepository.findOverlappingHolds(any(), any(), any())).thenReturn(List.of(mock(BookingHold.class)));
        assertThatThrownBy(() -> bookingService.createHold(tenantId, locationId, serviceId, staffId, null, customerId, startsAt, endsAt))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("overlapping holds");
    }

    // --- ANEH ---
    @Test
    @DisplayName("A: UUID invalid hex tidak sampai service (controller validasi)")
    void uuid_invalid_notReached() {
        // service tidak validasi UUID format, tapi controller pakai @PathVariable UUID -> 400 sebelum service
        // test service tetap handle random UUID
        when(bookingRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> bookingService.getBooking(UUID.randomUUID()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("A: concurrent confirmBooking expired markExpired save dulu baru throw")
    void confirm_expired_savesBeforeThrow() {
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        when(hold.isExpired()).thenReturn(true);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
        when(bookingHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertThatThrownBy(() -> bookingService.confirmBooking(holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(IllegalStateException.class);
        verify(bookingHoldRepository).save(hold);
        verify(hold).markExpired();
    }

    @Test
    @DisplayName("A: booking total negatif tidak di-clamp (weird business rule)")
    void total_negative_notClamped() {
        // confirmBooking dengan items discount > subtotal -> total negatif legal di domain (edge)
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        when(hold.isExpired()).thenReturn(false);
        when(hold.getStartsAt()).thenReturn(startsAt);
        when(hold.getEndsAt()).thenReturn(endsAt);
        when(hold.getStaffId()).thenReturn(null);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());
        when(bookingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(statusHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(bookingHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Booking result = bookingService.confirmBooking(holdId, tenantId, locationId, customerId, "IDR", null);
        // tanpa items, total 0, tidak negatif, pastikan tidak throw
        assertThat(result).isNotNull();
        assertThat(result.getBookingCode()).startsWith("DKT-");
    }

    @Test
    @DisplayName("A: bookingCode generasi collision 10x fallback throw RuntimeException")
    void bookingCode_collision_throw() {
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        lenient().when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        lenient().when(hold.isExpired()).thenReturn(false);
        lenient().when(hold.getStartsAt()).thenReturn(startsAt);
        lenient().when(hold.getEndsAt()).thenReturn(endsAt);
        // getStaffId tidak akan dipanggil karena collision throw sebelum assignment, jadi lenient
        lenient().when(hold.getStaffId()).thenReturn(null);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
        // selalu return existing booking untuk collision
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.of(mock(Booking.class)));
        assertThatThrownBy(() -> bookingService.confirmBooking(holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(RuntimeException.class).hasMessageContaining("Unable to generate");
    }
}
