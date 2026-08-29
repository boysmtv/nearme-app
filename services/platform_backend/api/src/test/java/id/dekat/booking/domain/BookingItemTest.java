package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingItem Domain Entity Tests")
class BookingItemTest {

    @Test
    @DisplayName("constructor - should create item with correct fields")
    void constructor_createsItemWithCorrectFields() {
        UUID bookingId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        UUID resourceId = UUID.randomUUID();
        Instant startsAt = Instant.now().plusSeconds(3600);
        Instant endsAt = startsAt.plusSeconds(1800);

        BookingItem item = new BookingItem(
                bookingId, serviceId, staffId, resourceId,
                startsAt, endsAt, 50000, 5000, 2500, "Haircut");

        assertThat(item.getBookingId()).isEqualTo(bookingId);
        assertThat(item.getServiceId()).isEqualTo(serviceId);
        assertThat(item.getStaffId()).isEqualTo(staffId);
        assertThat(item.getResourceId()).isEqualTo(resourceId);
        assertThat(item.getStartsAt()).isEqualTo(startsAt);
        assertThat(item.getEndsAt()).isEqualTo(endsAt);
        assertThat(item.getPrice()).isEqualTo(50000);
        assertThat(item.getDiscount()).isEqualTo(5000);
        assertThat(item.getTax()).isEqualTo(2500);
        assertThat(item.getNotes()).isEqualTo("Haircut");
    }

    @Test
    @DisplayName("lineTotal - should return price as BigDecimal")
    void lineTotal_calculatesCorrectly() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null, null,
                Instant.now(), Instant.now().plusSeconds(3600),
                75000, 0, 0, "Service");

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualTo(BigDecimal.valueOf(75000));
    }

    @Test
    @DisplayName("lineTotal - should return zero for zero price")
    void lineTotal_zeroQuantity_returnsZero() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null, null,
                Instant.now(), Instant.now().plusSeconds(1800),
                0, 0, 0, "Service");

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualTo(BigDecimal.valueOf(0));
    }

    @Test
    @DisplayName("lineTotal - should handle large price")
    void lineTotal_decimalPrice_calculatesCorrectly() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null, null,
                Instant.now(), Instant.now().plusSeconds(900),
                999999, 0, 0, "Service");

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(999999));
    }
}
