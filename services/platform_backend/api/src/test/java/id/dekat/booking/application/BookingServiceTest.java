package id.dekat.booking.application;

import id.dekat.booking.domain.*;
import id.dekat.common.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("BookingService Unit Tests")
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
    @Mock
    private id.dekat.customer.application.CustomerService customerService;

    @InjectMocks
    private BookingService bookingService;

    private UUID tenantId;
    private UUID locationId;
    private UUID serviceId;
    private UUID staffId;
    private UUID customerId;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        locationId = UUID.randomUUID();
        serviceId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        startsAt = OffsetDateTime.now().plusHours(1);
        endsAt = startsAt.plusHours(1);
    }

    @Test
    @DisplayName("createHold - should create hold with valid data")
    void createHold_validData_returnsHold() {
        when(bookingRepository.findOverlappingBookingsForStaff(any(), any(), any(), any(), anyList()))
                .thenReturn(Collections.emptyList());
        when(bookingHoldRepository.findOverlappingHolds(any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(bookingHoldRepository.save(any(BookingHold.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        BookingHold hold = bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, startsAt, endsAt);

        assertThat(hold).isNotNull();
        assertThat(hold.getTenantId()).isEqualTo(tenantId);
        assertThat(hold.getLocationId()).isEqualTo(locationId);
        assertThat(hold.getServiceId()).isEqualTo(serviceId);
        assertThat(hold.getStaffId()).isEqualTo(staffId);
        assertThat(hold.getCustomerId()).isEqualTo(customerId);
        assertThat(hold.getStartsAt()).isEqualTo(startsAt);
        assertThat(hold.getEndsAt()).isEqualTo(endsAt);
        assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.ACTIVE);
        verify(bookingHoldRepository).save(any(BookingHold.class));
    }

    @Test
    @DisplayName("createHold - should throw when start time is null")
    void createHold_nullStartTime_throwsIllegalArgument() {
        assertThatThrownBy(() -> bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, null, endsAt))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start and end times are required");
    }

    @Test
    @DisplayName("createHold - should throw when end time is null")
    void createHold_nullEndTime_throwsIllegalArgument() {
        assertThatThrownBy(() -> bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, startsAt, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start and end times are required");
    }

    @Test
    @DisplayName("createHold - should throw when start is after end")
    void createHold_startAfterEnd_throwsIllegalArgument() {
        OffsetDateTime badStart = endsAt.plusHours(1);
        assertThatThrownBy(() -> bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, badStart, endsAt))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start time must be before end time");
    }

    @Test
    @DisplayName("createHold - should throw when slot is in the past")
    void createHold_pastSlot_throwsIllegalArgument() {
        OffsetDateTime pastStart = OffsetDateTime.now().minusHours(1);
        OffsetDateTime pastEnd = OffsetDateTime.now();
        assertThatThrownBy(() -> bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, pastStart, pastEnd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot hold a slot in the past");
    }

    @Test
    @DisplayName("createHold - should throw when slot overlaps existing booking")
    void createHold_overlappingBooking_throwsIllegalState() {
        Booking overlapping = mock(Booking.class);
        when(bookingRepository.findOverlappingBookingsForStaff(any(), any(), any(), any(), anyList()))
                .thenReturn(List.of(overlapping));

        assertThatThrownBy(() -> bookingService.createHold(
                tenantId, locationId, serviceId, staffId, null, customerId, startsAt, endsAt))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Time slot not available");
    }

    @Test
    @DisplayName("confirmBooking - should confirm from active hold")
    void confirmBooking_validHold_returnsBooking() {
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        when(hold.isExpired()).thenReturn(false);
        when(hold.getStartsAt()).thenReturn(startsAt);
        when(hold.getEndsAt()).thenReturn(endsAt);
        when(hold.getStaffId()).thenReturn(staffId);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());
        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(bookingAssignmentRepository.save(any(BookingAssignment.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(statusHistoryRepository.save(any(BookingStatusHistory.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(bookingHoldRepository.save(any(BookingHold.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Booking booking = bookingService.confirmBooking(
                holdId, tenantId, locationId, customerId, "IDR", null);

        assertThat(booking).isNotNull();
        assertThat(booking.getBookingCode()).startsWith("DKT-");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(booking.getTenantId()).isEqualTo(tenantId);
        assertThat(booking.getCustomerId()).isEqualTo(customerId);
        verify(hold).markConverted();
    }

    @Test
    @DisplayName("confirmBooking - should throw when hold is expired")
    void confirmBooking_expiredHold_throwsIllegalState() {
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.ACTIVE);
        when(hold.isExpired()).thenReturn(true);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));
        when(bookingHoldRepository.save(any(BookingHold.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> bookingService.confirmBooking(
                holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Hold has expired");
    }

    @Test
    @DisplayName("confirmBooking - should throw when hold is not active")
    void confirmBooking_nonActiveHold_throwsIllegalState() {
        UUID holdId = UUID.randomUUID();
        BookingHold hold = mock(BookingHold.class);
        when(hold.getStatus()).thenReturn(BookingHold.HoldStatus.CONVERTED);
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.of(hold));

        assertThatThrownBy(() -> bookingService.confirmBooking(
                holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Hold is no longer active");
    }

    @Test
    @DisplayName("confirmBooking - should throw when hold not found")
    void confirmBooking_holdNotFound_throwsNotFound() {
        UUID holdId = UUID.randomUUID();
        when(bookingHoldRepository.findById(holdId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.confirmBooking(
                holdId, tenantId, locationId, customerId, "IDR", null))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("cancelBooking - should cancel a confirmed booking")
    void cancelBooking_confirmedBooking_returnsCancelled() {
        UUID bookingId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getStatus()).thenReturn(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(statusHistoryRepository.save(any(BookingStatusHistory.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(bookingAssignmentRepository.findByBookingId(bookingId))
                .thenReturn(Collections.emptyList());

        Booking result = bookingService.cancelBooking(bookingId, "Customer request", actorId);

        assertThat(result).isNotNull();
        verify(booking).cancel();
    }

    @Test
    @DisplayName("cancelBooking - should throw when booking is completed")
    void cancelBooking_completedBooking_throwsIllegalState() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getStatus()).thenReturn(BookingStatus.COMPLETED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, "test", UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel a completed booking");
    }

    @Test
    @DisplayName("cancelBooking - should throw when booking is already cancelled")
    void cancelBooking_alreadyCancelled_throwsIllegalState() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getStatus()).thenReturn(BookingStatus.CANCELLED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, "test", UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Booking is already cancelled");
    }

    @Test
    @DisplayName("cancelBooking - should throw when booking not found")
    void cancelBooking_bookingNotFound_throwsNotFound() {
        UUID bookingId = UUID.randomUUID();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, "test", UUID.randomUUID()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("getBooking - should return booking with items and assignments")
    void getBooking_validId_returnsBooking() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = mock(Booking.class);
        when(booking.getItems()).thenReturn(new ArrayList<>());
        when(booking.getAssignments()).thenReturn(new ArrayList<>());
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        Booking result = bookingService.getBooking(bookingId);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(booking);
    }

    @Test
    @DisplayName("getBooking - should throw when not found")
    void getBooking_notFound_throwsNotFound() {
        UUID bookingId = UUID.randomUUID();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBooking(bookingId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("getBookingByCode - should return booking by code")
    void getBookingByCode_validCode_returnsBooking() {
        String code = "DKT-ABC12";
        Booking booking = mock(Booking.class);
        when(bookingRepository.findByBookingCode(code)).thenReturn(Optional.of(booking));

        Booking result = bookingService.getBookingByCode(code);

        assertThat(result).isEqualTo(booking);
    }

    @Test
    @DisplayName("getBookingByCode - should throw when not found")
    void getBookingByCode_notFound_throwsNotFound() {
        when(bookingRepository.findByBookingCode("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingByCode("INVALID"))
                .isInstanceOf(NotFoundException.class);
    }
}
