package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Booking Domain Entity Tests")
class BookingTest {

    @Test
    @DisplayName("constructor - should create booking with HELD status")
    void constructor_createsBookingWithHeldStatus() {
        UUID tenantId = UUID.randomUUID();
        UUID locationId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.now().plusHours(1);
        OffsetDateTime endsAt = startsAt.plusHours(1);

        Booking booking = new Booking(
                tenantId, locationId, customerId, "DKT-TEST1",
                ServiceMode.IN_PERSON, startsAt, endsAt,
                ZoneId.of("Asia/Jakarta"), "IDR");

        assertThat(booking.getTenantId()).isEqualTo(tenantId);
        assertThat(booking.getLocationId()).isEqualTo(locationId);
        assertThat(booking.getCustomerId()).isEqualTo(customerId);
        assertThat(booking.getBookingCode()).isEqualTo("DKT-TEST1");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.HELD);
        assertThat(booking.getServiceMode()).isEqualTo(ServiceMode.IN_PERSON);
        assertThat(booking.getStartsAt()).isEqualTo(startsAt);
        assertThat(booking.getEndsAt()).isEqualTo(endsAt);
        assertThat(booking.getTimezone()).isEqualTo(ZoneId.of("Asia/Jakarta"));
        assertThat(booking.getCurrency()).isEqualTo("IDR");
        assertThat(booking.getSubtotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(booking.getTotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(booking.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("confirm - should transition from HELD to CONFIRMED")
    void confirm_fromHeld_transitionsToConfirmed() {
        Booking booking = createDefaultBooking();

        booking.confirm();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(booking.getConfirmedAt()).isNotNull();
    }

    @Test
    @DisplayName("confirm - should throw when not in HELD or PENDING_PAYMENT status")
    void confirm_invalidStatus_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.cancel();

        assertThatThrownBy(booking::confirm)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot confirm booking in status");
    }

    @Test
    @DisplayName("cancel - should transition to CANCELLED")
    void cancel_fromConfirmed_transitionsToCancelled() {
        Booking booking = createDefaultBooking();
        booking.confirm();

        booking.cancel();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getCancelledAt()).isNotNull();
    }

    @Test
    @DisplayName("cancel - should throw when already completed")
    void cancel_completedBooking_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.checkIn();
        booking.startService();
        booking.complete();

        assertThatThrownBy(booking::cancel)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel booking in status");
    }

    @Test
    @DisplayName("cancel - should throw when already cancelled")
    void cancel_alreadyCancelled_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.cancel();

        assertThatThrownBy(booking::cancel)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel booking in status");
    }

    @Test
    @DisplayName("checkIn - should transition from CONFIRMED to CHECKED_IN")
    void checkIn_fromConfirmed_transitionsToCheckedIn() {
        Booking booking = createDefaultBooking();
        booking.confirm();

        booking.checkIn();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
    }

    @Test
    @DisplayName("checkIn - should throw when not CONFIRMED")
    void checkIn_invalidStatus_throwsIllegalState() {
        Booking booking = createDefaultBooking();

        assertThatThrownBy(booking::checkIn)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot check in booking in status");
    }

    @Test
    @DisplayName("startService - should transition from CHECKED_IN to IN_SERVICE")
    void startService_fromCheckedIn_transitionsToInService() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.checkIn();

        booking.startService();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.IN_SERVICE);
    }

    @Test
    @DisplayName("startService - should throw when not CHECKED_IN or EN_ROUTE")
    void startService_invalidStatus_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();

        assertThatThrownBy(booking::startService)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot start service in status");
    }

    @Test
    @DisplayName("complete - should transition from IN_SERVICE to COMPLETED")
    void complete_fromInService_transitionsToCompleted() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.checkIn();
        booking.startService();

        booking.complete();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.COMPLETED);
        assertThat(booking.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("complete - should throw when not IN_SERVICE")
    void complete_invalidStatus_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();

        assertThatThrownBy(booking::complete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot complete booking in status");
    }

    @Test
    @DisplayName("noShow - should transition from CONFIRMED to NO_SHOW")
    void noShow_fromConfirmed_transitionsToNoShow() {
        Booking booking = createDefaultBooking();
        booking.confirm();

        booking.noShow();

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.NO_SHOW);
    }

    @Test
    @DisplayName("noShow - should throw when not CONFIRMED or CHECKED_IN")
    void noShow_invalidStatus_throwsIllegalState() {
        Booking booking = createDefaultBooking();

        assertThatThrownBy(booking::noShow)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot record no-show in status");
    }

    @Test
    @DisplayName("reschedule - should update start and end times")
    void reschedule_validBooking_updatesTimes() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        OffsetDateTime newStart = booking.getStartsAt().plusDays(1);
        OffsetDateTime newEnd = booking.getEndsAt().plusDays(1);

        booking.reschedule(newStart, newEnd);

        assertThat(booking.getStartsAt()).isEqualTo(newStart);
        assertThat(booking.getEndsAt()).isEqualTo(newEnd);
    }

    @Test
    @DisplayName("reschedule - should throw when completed")
    void reschedule_completedBooking_throwsIllegalState() {
        Booking booking = createDefaultBooking();
        booking.confirm();
        booking.checkIn();
        booking.startService();
        booking.complete();

        assertThatThrownBy(() -> booking.reschedule(
                OffsetDateTime.now().plusDays(1),
                OffsetDateTime.now().plusDays(2)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot reschedule booking in status");
    }

    @Test
    @DisplayName("recalculateTotal - should calculate total from items")
    void recalculateTotal_withItems_calculatesCorrectly() {
        Booking booking = createDefaultBooking();
        Instant now = Instant.now();
        BookingItem item1 = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null, null,
                now, now.plusSeconds(1800), 50000, 0, 0, "Haircut");
        BookingItem item2 = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null, null,
                now, now.plusSeconds(900), 50000, 0, 0, "Shave");
        booking.setItems(java.util.List.of(item1, item2));
        booking.setDiscount(new BigDecimal("5000"));
        booking.setTax(new BigDecimal("7500"));
        booking.setFee(new BigDecimal("2500"));

        booking.recalculateTotal();

        assertThat(booking.getSubtotal()).isEqualTo(new BigDecimal("100000")); // 50000 + 50000
        assertThat(booking.getTotal()).isEqualTo(new BigDecimal("105000")); // 100000 - 5000 + 7500 + 2500
    }

    private Booking createDefaultBooking() {
        return new Booking(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "DKT-TEST1", ServiceMode.IN_PERSON,
                OffsetDateTime.now().plusHours(1), OffsetDateTime.now().plusHours(2),
                ZoneId.of("Asia/Jakarta"), "IDR");
    }
}
