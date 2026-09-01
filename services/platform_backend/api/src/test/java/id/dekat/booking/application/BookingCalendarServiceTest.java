package id.dekat.booking.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.booking.domain.ServiceMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BookingCalendarService - Bundle B Kalender sync")
class BookingCalendarServiceTest {

    private BookingCalendarService service;
    private Booking booking;

    @BeforeEach
    void setUp() {
        service = new BookingCalendarService();
        UUID tenantId = UUID.randomUUID();
        UUID locationId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.parse("2026-09-10T10:00:00+07:00");
        OffsetDateTime endsAt = OffsetDateTime.parse("2026-09-10T11:00:00+07:00");
        booking = new Booking(tenantId, locationId, customerId, "DKT-TEST1", ServiceMode.IN_PERSON, startsAt, endsAt, ZoneId.of("Asia/Jakarta"), "IDR");
        // set id via reflection
        try {
            var f = Booking.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(booking, UUID.fromString("11111111-1111-1111-1111-111111111111"));
            var v = Booking.class.getDeclaredField("version");
            v.setAccessible(true);
            v.set(booking, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        booking.setConfirmationPin("123456");
        booking.setDepositAmount(20000);
        booking.setCancelPolicy("24h_full_refund");
        // force CONFIRMED status (constructor sets HELD then confirm)
        booking.confirm();
    }

    @Test
    @DisplayName("generateIcs produces VCALENDAR with required fields")
    void ics_valid() {
        String ics = service.generateIcs(booking);
        assertThat(ics).contains("BEGIN:VCALENDAR");
        assertThat(ics).contains("END:VCALENDAR");
        assertThat(ics).contains("BEGIN:VEVENT");
        assertThat(ics).contains("END:VEVENT");
        assertThat(ics).contains("UID:11111111-1111-1111-1111-111111111111@dekat.id");
        assertThat(ics).contains("DTSTART:");
        assertThat(ics).contains("DTEND:");
        assertThat(ics).contains("SUMMARY:");
        assertThat(ics).contains("DKT-TEST1");
        assertThat(ics).contains("STATUS:CONFIRMED");
        assertThat(ics).contains("PRODID:-//DEKAT//Booking//ID");
    }

    @Test
    @DisplayName("generateGoogleCalendarLink is valid URL with dates")
    void google_link_valid() {
        String url = service.generateGoogleCalendarLink(booking);
        assertThat(url).startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE");
        assertThat(url).contains("text=DEKAT");
        assertThat(url).contains("dates=");
        assertThat(url).contains("details=");
        assertThat(url).contains("location=");
        // dates should contain UTC 'Z' format
        assertThat(url).contains("Z");
    }

    @Test
    @DisplayName("ics DTSTART is UTC (Z) even though booking is Asia/Jakarta")
    void ics_utc_conversion() {
        String ics = service.generateIcs(booking);
        // booking 10:00+07 -> UTC 03:00Z
        assertThat(ics).contains("DTSTART:20260910T030000Z");
        assertThat(ics).contains("DTEND:20260910T040000Z");
    }

    @Test
    @DisplayName("ics escapes special chars in summary")
    void ics_escape() {
        booking = new Booking(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), "DKT,TEST;2", ServiceMode.IN_PERSON,
                OffsetDateTime.parse("2026-09-10T10:00:00+07:00"),
                OffsetDateTime.parse("2026-09-10T11:00:00+07:00"),
                ZoneId.of("Asia/Jakarta"), "IDR");
        try {
            var f = Booking.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(booking, UUID.randomUUID());
            var v = Booking.class.getDeclaredField("version");
            v.setAccessible(true);
            v.set(booking, 1L);
        } catch (Exception e) { throw new RuntimeException(e); }
        booking.confirm();
        String ics = service.generateIcs(booking);
        // comma and semicolon should be escaped
        assertThat(ics).contains("DKT\\,TEST\\;2");
    }
}
