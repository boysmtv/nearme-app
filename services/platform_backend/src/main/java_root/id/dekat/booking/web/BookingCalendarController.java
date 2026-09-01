package id.dekat.booking.web;

import id.dekat.booking.application.BookingCalendarService;
import id.dekat.booking.application.BookingService;
import id.dekat.booking.domain.Booking;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
public class BookingCalendarController {

    private final BookingService bookingService;
    private final BookingCalendarService calendarService;

    public BookingCalendarController(BookingService bookingService, BookingCalendarService calendarService) {
        this.bookingService = bookingService;
        this.calendarService = calendarService;
    }

    @GetMapping("/{id}/ics")
    public ResponseEntity<String> getIcs(@PathVariable UUID id) {
        Booking booking = bookingService.getBooking(id);
        String ics = calendarService.generateIcs(booking);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=booking-" + booking.getBookingCode() + ".ics")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(ics);
    }

    @GetMapping("/{id}/calendar-link")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCalendarLink(@PathVariable UUID id) {
        Booking booking = bookingService.getBooking(id);
        String googleUrl = calendarService.generateGoogleCalendarLink(booking);
        String icsUrl = "/api/v1/bookings/" + id + "/ics";
        Map<String, String> data = new LinkedHashMap<>();
        data.put("googleCalendarUrl", googleUrl);
        data.put("icsUrl", icsUrl);
        data.put("icsContent", calendarService.generateIcs(booking));
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
