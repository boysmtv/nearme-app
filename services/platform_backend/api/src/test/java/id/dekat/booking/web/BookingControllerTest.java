package id.dekat.booking.web;

import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.*;
import id.dekat.booking.web.dto.CreateBookingRequest;
import id.dekat.booking.web.dto.CreateHoldRequest;
import id.dekat.sharedkernel.web.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingController bookingController;

    private UUID tenantId;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        customerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("listBookings with tenantId returns paginated response with 200 OK")
    void listBookings_withTenantId_returnsPaginatedResponse() {
        int page = 1;
        int limit = 10;
        Booking booking1 = createTestBooking(UUID.randomUUID(), "DKT-TEST1");
        Booking booking2 = createTestBooking(UUID.randomUUID(), "DKT-TEST2");
        List<Booking> bookings = List.of(booking1, booking2);
        Page<Booking> pageResult = new PageImpl<>(bookings, PageRequest.of(0, limit), 2);

        when(bookingRepository.findByTenantId(eq(tenantId), any(Pageable.class)))
                .thenReturn(pageResult);

        Principal principal = mock(Principal.class);

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(page, limit, null, tenantId, null, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).containsKey("data");
        assertThat(response.getBody().getData()).containsKey("pagination");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().getData().get("data");
        assertThat(data).hasSize(2);

        @SuppressWarnings("unchecked")
        Map<String, Object> pagination = (Map<String, Object>) response.getBody().getData().get("pagination");
        assertThat(pagination.get("page")).isEqualTo(1);
        assertThat(pagination.get("limit")).isEqualTo(10);
        assertThat(pagination.get("total")).isEqualTo(2L);
    }

    @Test
    @DisplayName("listBookings with customerId returns bookings for that customer")
    void listBookings_withCustomerId_returnsCustomerBookings() {
        int page = 1;
        int limit = 20;
        Booking booking = createTestBooking(UUID.randomUUID(), "DKT-CUST1");
        Page<Booking> pageResult = new PageImpl<>(List.of(booking), PageRequest.of(0, limit), 1);

        when(bookingRepository.findByCustomerId(eq(customerId), any(Pageable.class)))
                .thenReturn(pageResult);

        Principal principal = mock(Principal.class);

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(page, limit, null, null, customerId, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
    }

    @Test
    @DisplayName("listBookings with status filter applies filter correctly")
    void listBookings_withStatusFilter_appliesFilter() {
        int page = 1;
        int limit = 20;
        Booking booking = createTestBooking(UUID.randomUUID(), "DKT-FILT1");
        Page<Booking> pageResult = new PageImpl<>(List.of(booking), PageRequest.of(0, limit), 1);

        when(bookingRepository.findByTenantIdAndStatus(
                eq(tenantId), eq(BookingStatus.CONFIRMED), any(Pageable.class)))
                .thenReturn(pageResult);

        Principal principal = mock(Principal.class);

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(page, limit, "CONFIRMED", tenantId, null, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(bookingRepository).findByTenantIdAndStatus(
                eq(tenantId), eq(BookingStatus.CONFIRMED), any(Pageable.class));
    }

    @Test
    @DisplayName("listBookings with invalid status string returns all bookings without filter")
    void listBookings_withInvalidStatus_returnsUnfiltered() {
        int page = 1;
        int limit = 20;
        Page<Booking> pageResult = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, limit), 0);

        when(bookingRepository.findByTenantId(eq(tenantId), any(Pageable.class)))
                .thenReturn(pageResult);

        Principal principal = mock(Principal.class);

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(page, limit, "INVALID_STATUS", tenantId, null, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(bookingRepository).findByTenantId(eq(tenantId), any(Pageable.class));
    }

    @Test
    @DisplayName("listBookings with null tenantId and no customerId returns 400 BAD_REQUEST")
    void listBookings_noTenantNoCustomer_returnsBadRequest() {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("not-a-uuid");

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(1, 20, null, null, null, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
    }

    @Test
    @DisplayName("listBookings with invalid page and limit uses safe defaults")
    void listBookings_invalidPageLimit_usesSafeDefaults() {
        Page<Booking> pageResult = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 1), 0);

        when(bookingRepository.findByTenantId(eq(tenantId), any(Pageable.class)))
                .thenReturn(pageResult);

        Principal principal = mock(Principal.class);

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                bookingController.listBookings(-1, 0, null, tenantId, null, principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("createHold returns 201 CREATED with saved hold data")
    void createHold_returns201() {
        UUID holdId = UUID.randomUUID();
        CreateHoldRequest request = new CreateHoldRequest();
        request.setTenantId(tenantId);
        request.setLocationId(UUID.randomUUID());
        request.setServiceId(UUID.randomUUID());
        request.setStaffId(UUID.randomUUID());
        request.setResourceId(UUID.randomUUID());
        request.setCustomerId(customerId);
        request.setStartsAt(OffsetDateTime.now().plusHours(1));
        request.setEndsAt(OffsetDateTime.now().plusHours(2));

        BookingHold hold = new BookingHold(
                request.getTenantId(), request.getLocationId(), request.getServiceId(),
                request.getStaffId(), request.getResourceId(), customerId,
                request.getStartsAt(), request.getEndsAt(),
                OffsetDateTime.now().plusMinutes(10)
        );

        when(bookingService.createHold(
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(hold);

        org.springframework.security.oauth2.jwt.Jwt jwt =
                mock(org.springframework.security.oauth2.jwt.Jwt.class);

        ResponseEntity<ApiResponse<BookingHold>> response =
                bookingController.createHold(jwt, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).isNotNull();
        verify(bookingService).createHold(
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    @DisplayName("createHold uses customerId from JWT when request customerId is null")
    void createHold_nullCustomerIdInRequest_usesJwtSubject() {
        UUID jwtCustomerId = UUID.randomUUID();
        CreateHoldRequest request = new CreateHoldRequest();
        request.setTenantId(tenantId);
        request.setLocationId(UUID.randomUUID());
        request.setServiceId(UUID.randomUUID());
        request.setStaffId(UUID.randomUUID());
        request.setResourceId(UUID.randomUUID());
        request.setCustomerId(null);
        request.setStartsAt(OffsetDateTime.now().plusHours(1));
        request.setEndsAt(OffsetDateTime.now().plusHours(2));

        BookingHold hold = new BookingHold(
                request.getTenantId(), request.getLocationId(), request.getServiceId(),
                request.getStaffId(), request.getResourceId(), jwtCustomerId,
                request.getStartsAt(), request.getEndsAt(),
                OffsetDateTime.now().plusMinutes(10)
        );

        when(bookingService.createHold(
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(UUID.class), any(UUID.class), eq(jwtCustomerId),
                any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(hold);

        org.springframework.security.oauth2.jwt.Jwt jwt =
                mock(org.springframework.security.oauth2.jwt.Jwt.class);
        when(jwt.getSubject()).thenReturn(jwtCustomerId.toString());

        ResponseEntity<ApiResponse<BookingHold>> response =
                bookingController.createHold(jwt, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(bookingService).createHold(
                any(UUID.class), any(UUID.class), any(UUID.class),
                any(UUID.class), any(UUID.class), eq(jwtCustomerId),
                any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    @DisplayName("createBooking returns 201 CREATED with confirmed booking")
    void createBooking_returns201() {
        UUID holdId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();
        CreateBookingRequest request = new CreateBookingRequest();
        request.setHoldId(holdId);
        request.setTenantId(tenantId);
        request.setLocationId(UUID.randomUUID());
        request.setCustomerId(customerId);
        request.setCurrency("IDR");

        Booking booking = new Booking(
                tenantId, request.getLocationId(), customerId, "DKT-NEWB1",
                ServiceMode.IN_PERSON,
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                ZoneId.of("Asia/Jakarta"), "IDR"
        );
        booking.confirm();

        when(bookingService.confirmBooking(
                eq(holdId), eq(tenantId), any(UUID.class),
                eq(customerId), eq("IDR"), isNull()))
                .thenReturn(booking);

        org.springframework.security.oauth2.jwt.Jwt jwt =
                mock(org.springframework.security.oauth2.jwt.Jwt.class);

        ResponseEntity<ApiResponse<Booking>> response =
                bookingController.createBooking(jwt, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getBookingCode()).startsWith("DKT-");
        verify(bookingService).confirmBooking(
                eq(holdId), eq(tenantId), any(UUID.class),
                eq(customerId), eq("IDR"), isNull());
    }

    @Test
    @DisplayName("getBooking returns 200 OK with booking data")
    void getBooking_returns200() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = createTestBooking(bookingId, "DKT-FIND1");

        when(bookingService.getBooking(bookingId)).thenReturn(booking);

        ResponseEntity<ApiResponse<Booking>> response =
                bookingController.getBooking(bookingId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getBookingCode()).isEqualTo("DKT-FIND1");
    }

    private Booking createTestBooking(UUID id, String bookingCode) {
        Booking booking = new Booking(
                tenantId, UUID.randomUUID(), customerId, bookingCode,
                ServiceMode.IN_PERSON,
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                ZoneId.of("Asia/Jakarta"), "IDR"
        );
        try {
            var idField = Booking.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(booking, id);
        } catch (Exception ignored) {
        }
        return booking;
    }
}
