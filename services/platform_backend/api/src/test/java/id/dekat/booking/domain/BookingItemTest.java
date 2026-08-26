package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingItem Domain Entity Tests")
class BookingItemTest {

    @Test
    @DisplayName("constructor - should create item with correct fields")
    void constructor_createsItemWithCorrectFields() {
        UUID bookingId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        UUID variantId = UUID.randomUUID();
        Duration duration = Duration.ofMinutes(30);

        BookingItem item = new BookingItem(
                bookingId, serviceId, variantId,
                "Haircut", new BigDecimal("50000"), duration, 2);

        assertThat(item.getBookingId()).isEqualTo(bookingId);
        assertThat(item.getServiceId()).isEqualTo(serviceId);
        assertThat(item.getVariantId()).isEqualTo(variantId);
        assertThat(item.getNameSnapshot()).isEqualTo("Haircut");
        assertThat(item.getPriceSnapshot()).isEqualTo(new BigDecimal("50000"));
        assertThat(item.getDurationSnapshot()).isEqualTo(duration);
        assertThat(item.getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("lineTotal - should calculate price * quantity")
    void lineTotal_calculatesCorrectly() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null,
                "Service", new BigDecimal("75000"), Duration.ofMinutes(60), 3);

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualTo(new BigDecimal("225000"));
    }

    @Test
    @DisplayName("lineTotal - should return zero for zero quantity")
    void lineTotal_zeroQuantity_returnsZero() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null,
                "Service", new BigDecimal("50000"), Duration.ofMinutes(30), 0);

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("lineTotal - should handle decimal prices")
    void lineTotal_decimalPrice_calculatesCorrectly() {
        BookingItem item = new BookingItem(
                UUID.randomUUID(), UUID.randomUUID(), null,
                "Service", new BigDecimal("33333.33"), Duration.ofMinutes(15), 3);

        BigDecimal total = item.lineTotal();

        assertThat(total).isEqualByComparingTo(new BigDecimal("99999.99"));
    }
}
