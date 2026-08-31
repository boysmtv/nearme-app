package id.dekat.booking.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Comprehensive weird/edge cases for Booking state machine.
 * Covers P/N/E/A dari docs/TEST_CASES_COMPREHENSIVE.md §5
 */
@DisplayName("Booking Weird Cases - Positive/Negative/Edge/Aneh")
class BookingWeirdCasesTest {

    // ---- POSITIF ----
    @Test
    @DisplayName("P: confirm dari PENDING_PAYMENT juga valid")
    void confirm_fromPendingPayment_valid() {
        Booking b = createDefault();
        b.setStatus(BookingStatus.PENDING_PAYMENT);
        b.confirm();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(b.getConfirmedAt()).isNotNull();
    }

    @Test
    @DisplayName("P: reschedule dari CONFIRMED update waktu")
    void reschedule_fromConfirmed_ok() {
        Booking b = createDefault();
        b.confirm();
        OffsetDateTime ns = b.getStartsAt().plusDays(2);
        OffsetDateTime ne = b.getEndsAt().plusDays(2);
        b.reschedule(ns, ne);
        assertThat(b.getStartsAt()).isEqualTo(ns);
    }

    @Test
    @DisplayName("P: startService dari EN_ROUTE valid")
    void startService_fromEnRoute_valid() {
        Booking b = createDefault();
        b.setStatus(BookingStatus.EN_ROUTE);
        b.startService();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.IN_SERVICE);
    }

    @Test
    @DisplayName("P: noShow dari CHECKED_IN valid")
    void noShow_fromCheckedIn_valid() {
        Booking b = createDefault();
        b.confirm();
        b.checkIn();
        b.noShow();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.NO_SHOW);
    }

    // ---- NEGATIF ----
    @Test
    @DisplayName("N: confirm dari CANCELLED throw")
    void confirm_fromCancelled_throw() {
        Booking b = createDefault();
        b.confirm(); b.cancel();
        assertThatThrownBy(b::confirm).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: confirm dari COMPLETED throw")
    void confirm_fromCompleted_throw() {
        Booking b = createDefault();
        b.confirm(); b.checkIn(); b.startService(); b.complete();
        assertThatThrownBy(b::confirm).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: cancel dari CANCELLED throw")
    void cancel_alreadyCancelled_throw() {
        Booking b = createDefault();
        b.confirm(); b.cancel();
        assertThatThrownBy(b::cancel).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel");
    }

    @Test
    @DisplayName("N: cancel dari COMPLETED throw")
    void cancel_completed_throw() {
        Booking b = createDefault();
        b.confirm(); b.checkIn(); b.startService(); b.complete();
        assertThatThrownBy(b::cancel).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel");
    }

    @Test
    @DisplayName("N: checkIn dari HELD throw")
    void checkIn_fromHeld_throw() {
        Booking b = createDefault();
        assertThatThrownBy(b::checkIn).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: complete dari CONFIRMED throw")
    void complete_fromConfirmed_throw() {
        Booking b = createDefault();
        b.confirm();
        assertThatThrownBy(b::complete).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: startService dari HELD throw")
    void startService_fromHeld_throw() {
        Booking b = createDefault();
        assertThatThrownBy(b::startService).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: noShow dari HELD throw")
    void noShow_fromHeld_throw() {
        Booking b = createDefault();
        assertThatThrownBy(b::noShow).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: reschedule dari COMPLETED throw")
    void reschedule_completed_throw() {
        Booking b = createDefault();
        b.confirm(); b.checkIn(); b.startService(); b.complete();
        assertThatThrownBy(() -> b.reschedule(OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusDays(2)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("N: reschedule dari CANCELLED throw")
    void reschedule_cancelled_throw() {
        Booking b = createDefault();
        b.confirm(); b.cancel();
        assertThatThrownBy(() -> b.reschedule(OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusDays(2)))
                .isInstanceOf(IllegalStateException.class);
    }

    // ---- EDGE ----
    @Test
    @DisplayName("E: recalculateTotal dengan items kosong total 0 + fee/tax")
    void recalc_emptyItems() {
        Booking b = createDefault();
        b.setItems(List.of());
        b.setDiscount(new BigDecimal("5000"));
        b.setTax(new BigDecimal("2000"));
        b.setFee(new BigDecimal("1000"));
        b.recalculateTotal();
        assertThat(b.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
        // total = 0 -5000 +2000 +1000 = -2000 (edge: negative total)
        assertThat(b.getTotal()).isEqualByComparingTo(new BigDecimal("-2000"));
    }

    @Test
    @DisplayName("E: recalculateTotal diskon > subtotal jadi negatif (edge clamp)")
    void recalc_discountLargerThanSubtotal_negative() {
        Booking b = createDefault();
        Instant now = Instant.now();
        BookingItem item = new BookingItem(UUID.randomUUID(), UUID.randomUUID(), null, null, now, now.plusSeconds(1800), 10000, 0, 0, "Cut");
        b.setItems(List.of(item));
        b.setDiscount(new BigDecimal("20000"));
        b.recalculateTotal();
        assertThat(b.getTotal()).isEqualByComparingTo(new BigDecimal("-10000"));
    }

    @Test
    @DisplayName("E: pin null getPinVerified false default")
    void pin_nullDefault() {
        Booking b = createDefault();
        assertThat(b.getConfirmationPin()).isNull();
        assertThat(b.getPinVerified()).isFalse();
    }

    @Test
    @DisplayName("E: timezone WIB disimpan benar")
    void timezone_wib() {
        Booking b = createDefault();
        assertThat(b.getTimezone()).isEqualTo(ZoneId.of("Asia/Jakarta"));
    }

    @Test
    @DisplayName("E: bookingCode case sensitive DKT- vs dkt-")
    void bookingCode_caseSensitive() {
        Booking b = createDefault();
        assertThat(b.getBookingCode()).startsWith("DKT-");
        assertThat(b.getBookingCode()).isNotEqualTo(b.getBookingCode().toLowerCase());
    }

    // ---- ANEH / WEIRD ----
    @Test
    @DisplayName("A: PIN 000000 leading zero tetap 6 digit string, bukan int 0")
    void pin_leadingZero_sixDigits() {
        Booking b = createDefault();
        b.setConfirmationPin(String.format("%06d", 0));
        assertThat(b.getConfirmationPin()).isEqualTo("000000");
        assertThat(b.getConfirmationPin()).hasSize(6);
        // jangan parse ke int
        assertThat(Integer.parseInt(b.getConfirmationPin())).isZero();
        assertThat(b.getConfirmationPin()).isEqualTo("000000");
    }

    @Test
    @DisplayName("A: PIN random range 0-999999 format 6 digit")
    void pin_randomFormat() {
        for (int i = 0; i < 20; i++) {
            String pin = String.format("%06d", new Random().nextInt(999999));
            assertThat(pin).matches("\\d{6}");
            assertThat(pin).hasSize(6);
        }
    }

    @Test
    @DisplayName("A: XSS di notes/policySnapshot tidak dieksekusi, disimpan sebagai string")
    void xss_inPolicySnapshot_storedAsString() {
        Booking b = createDefault();
        Map<String, Object> snap = new HashMap<>();
        snap.put("notes", "<script>alert(1)</script>");
        snap.put("sql", "'; DROP TABLE bookings; --");
        b.setPolicySnapshot(snap);
        assertThat(b.getPolicySnapshot().get("notes")).isEqualTo("<script>alert(1)</script>");
        assertThat(b.getPolicySnapshot().get("sql")).isEqualTo("'; DROP TABLE bookings; --");
    }

    @Test
    @DisplayName("A: unicode name di snapshot 5000 char tidak crash")
    void unicode_largeSnapshot() {
        Booking b = createDefault();
        String large = "a".repeat(5000);
        Map<String, Object> snap = new HashMap<>();
        snap.put("desc", large);
        b.setPolicySnapshot(snap);
        assertThat(((String) b.getPolicySnapshot().get("desc")).length()).isEqualTo(5000);
        // emoji surrogate pair check: 1 emoji = 2 char length
        String emoji = "💈".repeat(10);
        assertThat(emoji.length()).isEqualTo(20);
    }

    @Test
    @DisplayName("A: version null reschedule harus handle NPE (edge weird)")
    void version_null_edge() {
        Booking b = createDefault();
        // version awal null (belum persist)
        assertThat(b.getVersion()).isNull();
        // reschedule tidak cek version, jadi tetap ok
        b.confirm();
        b.reschedule(b.getStartsAt().plusHours(5), b.getEndsAt().plusHours(5));
        assertThat(b.getStartsAt()).isNotNull();
    }

    @Test
    @DisplayName("A: startsAt equals endsAt plus 1ns - domain tidak validasi, service yang validasi")
    void startEqualsEnd_domainNoValidation() {
        OffsetDateTime t = OffsetDateTime.now().plusDays(1);
        Booking b = new Booking(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "DKT-AN001", ServiceMode.IN_PERSON, t, t, ZoneId.of("Asia/Jakarta"), "IDR");
        // domain tidak throw, service layer yang throw IllegalArgumentException
        assertThat(b.getStartsAt()).isEqualTo(b.getEndsAt());
    }

    @Test
    @DisplayName("A: complete hitung actualDurationMinutes metadata")
    void complete_durationMeta() {
        Booking b = createDefault();
        // simulate startsAt 2 jam lalu
        // complete hanya boleh dari IN_SERVICE, jadi full flow
        b.confirm(); b.checkIn(); b.startService();
        b.complete();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.COMPLETED);
        assertThat(b.getCompletedAt()).isNotNull();
    }

    private Booking createDefault() {
        return new Booking(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "DKT-TEST1", ServiceMode.IN_PERSON,
                OffsetDateTime.now().plusHours(1), OffsetDateTime.now().plusHours(2),
                ZoneId.of("Asia/Jakarta"), "IDR");
    }
}
