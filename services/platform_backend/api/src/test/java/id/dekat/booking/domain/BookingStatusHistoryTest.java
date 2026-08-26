package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingStatusHistory Domain Entity Tests")
class BookingStatusHistoryTest {

    @Test
    @DisplayName("constructor - should create history with correct fields")
    void constructor_createsHistoryWithCorrectFields() {
        UUID bookingId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, BookingStatus.HELD, BookingStatus.CONFIRMED,
                actorId, "Booking confirmed");

        assertThat(history.getBookingId()).isEqualTo(bookingId);
        assertThat(history.getFromStatus()).isEqualTo(BookingStatus.HELD);
        assertThat(history.getToStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(history.getActorId()).isEqualTo(actorId);
        assertThat(history.getReason()).isEqualTo("Booking confirmed");
        assertThat(history.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("constructor - should accept null fromStatus")
    void constructor_nullFromStatus_succeeds() {
        UUID bookingId = UUID.randomUUID();

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, null, BookingStatus.HELD,
                null, "Initial status");

        assertThat(history.getFromStatus()).isNull();
        assertThat(history.getToStatus()).isEqualTo(BookingStatus.HELD);
    }

    @Test
    @DisplayName("constructor - should accept metadata parameter")
    void constructor_withMetadata_succeeds() {
        UUID bookingId = UUID.randomUUID();

        BookingStatusHistory history = new BookingStatusHistory(
                bookingId, BookingStatus.CONFIRMED, BookingStatus.CANCELLED,
                UUID.randomUUID(), "Cancelled by customer", new Object());

        assertThat(history.getFromStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(history.getToStatus()).isEqualTo(BookingStatus.CANCELLED);
    }
}
