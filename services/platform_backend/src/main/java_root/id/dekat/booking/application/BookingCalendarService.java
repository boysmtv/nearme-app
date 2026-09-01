package id.dekat.booking.application;

import id.dekat.booking.domain.Booking;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class BookingCalendarService {

    private static final DateTimeFormatter ICS_FMT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    public String generateIcs(Booking booking) {
        String uid = booking.getId().toString() + "@dekat.id";
        String dtStamp = java.time.OffsetDateTime.now(ZoneOffset.UTC).format(ICS_FMT);
        String dtStart = booking.getStartsAt().withOffsetSameInstant(ZoneOffset.UTC).format(ICS_FMT);
        String dtEnd = booking.getEndsAt() != null ? booking.getEndsAt().withOffsetSameInstant(ZoneOffset.UTC).format(ICS_FMT) : dtStart;
        String summary = escape("DEKAT Booking " + booking.getBookingCode());
        String description = escape("Booking " + booking.getBookingCode() + " - Status: " + booking.getStatus() + "\\nDeposit: " + booking.getDepositAmount() + " Policy: " + (booking.getCancelPolicy() != null ? booking.getCancelPolicy() : ""));
        String location = escape(booking.getTenantId() != null ? booking.getTenantId().toString() : "DEKAT");

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//DEKAT//Booking//ID\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("BEGIN:VEVENT\r\n");
        sb.append("UID:").append(uid).append("\r\n");
        sb.append("DTSTAMP:").append(dtStamp).append("\r\n");
        sb.append("DTSTART:").append(dtStart).append("\r\n");
        sb.append("DTEND:").append(dtEnd).append("\r\n");
        sb.append("SUMMARY:").append(summary).append("\r\n");
        sb.append("DESCRIPTION:").append(description).append("\r\n");
        sb.append("LOCATION:").append(location).append("\r\n");
        sb.append("STATUS:CONFIRMED\r\n");
        sb.append("SEQUENCE:").append(booking.getVersion() != null ? booking.getVersion() : 0).append("\r\n");
        sb.append("END:VEVENT\r\n");
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    public String generateGoogleCalendarLink(Booking booking) {
        try {
            String title = URLEncoder.encode("DEKAT Booking " + booking.getBookingCode(), StandardCharsets.UTF_8);
            String details = URLEncoder.encode("Booking " + booking.getBookingCode() + " - Status: " + booking.getStatus(), StandardCharsets.UTF_8);
            String location = URLEncoder.encode(booking.getTenantId() != null ? booking.getTenantId().toString() : "DEKAT", StandardCharsets.UTF_8);
            String start = booking.getStartsAt().withOffsetSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
            String end = booking.getEndsAt() != null ? booking.getEndsAt().withOffsetSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'")) : start;
            String dates = start + "/" + end;
            return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + title + "&dates=" + dates + "&details=" + details + "&location=" + location;
        } catch (Exception e) {
            return "";
        }
    }

    private String escape(String v) {
        if (v == null) return "";
        return v.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n");
    }
}
