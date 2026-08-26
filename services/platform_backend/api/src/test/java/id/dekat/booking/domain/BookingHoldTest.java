package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingHold Domain Entity Tests")
class BookingHoldTest {

    @Test
    @DisplayName("constructor - should create hold with ACTIVE status")
    void constructor_createsHoldWithActiveStatus() {
        UUID tenantId = UUID.randomUUID();
        UUID locationId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.now().plusHours(1);
        OffsetDateTime endsAt = startsAt.plusHours(1);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);

        BookingHold hold = new BookingHold(
                tenantId, locationId, serviceId, staffId, null,
                customerId, startsAt, endsAt, expiresAt);

        assertThat(hold.getTenantId()).isEqualTo(tenantId);
        assertThat(hold.getLocationId()).isEqualTo(locationId);
        assertThat(hold.getServiceId()).isEqualTo(serviceId);
        assertThat(hold.getStaffId()).isEqualTo(staffId);
        assertThat(hold.getCustomerId()).isEqualTo(customerId);
        assertThat(hold.getStartsAt()).isEqualTo(startsAt);
        assertThat(hold.getEndsAt()).isEqualTo(endsAt);
        assertThat(hold.getExpiresAt()).isEqualTo(expiresAt);
        assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.ACTIVE);
    }

    @Test
    @DisplayName("isExpired - should return true when now is after expiresAt")
    void isExpired_pastExpiry_returnsTrue() {
        BookingHold hold = new BookingHold(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, null, UUID.randomUUID(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                OffsetDateTime.now().minusMinutes(1)); // already expired

        assertThat(hold.isExpired()).isTrue();
    }

    @Test
    @DisplayName("isExpired - should return false when now is before expiresAt")
    void isExpired_futureExpiry_returnsFalse() {
        BookingHold hold = new BookingHold(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, null, UUID.randomUUID(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                OffsetDateTime.now().plusMinutes(10)); // not expired yet

        assertThat(hold.isExpired()).isFalse();
    }

    @Test
    @DisplayName("markExpired - should set status to EXPIRED")
    void markExpired_setsStatusToExpired() {
        BookingHold hold = createDefaultHold();

        hold.markExpired();

        assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.EXPIRED);
    }

    @Test
    @DisplayName("markConverted - should set status to CONVERTED")
    void markConverted_setsStatusToConverted() {
        BookingHold hold = createDefaultHold();

        hold.markConverted();

        assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.CONVERTED);
    }

    @Test
    @DisplayName("markCancelled - should set status to CANCELLED")
    void markCancelled_setsStatusToCancelled() {
        BookingHold hold = createDefaultHold();

        hold.markCancelled();

        assertThat(hold.getStatus()).isEqualTo(BookingHold.HoldStatus.CANCELLED);
    }

    private BookingHold createDefaultHold() {
        return new BookingHold(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, null, UUID.randomUUID(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                OffsetDateTime.now().plusMinutes(10));
    }
}
