package id.dekat.api.web;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingItem;
import id.dekat.booking.domain.BookingItemRepository;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.tenant.domain.Tenant;
import id.dekat.tenant.domain.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/export")
@RequiredArgsConstructor
public class AdminExportController {

    private static final int MAX_EXPORT_ROWS = 10000;

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final TenantRepository tenantRepository;

    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10000") int limit) {

        int safeLimit = Math.min(limit, MAX_EXPORT_ROWS);
        List<User> users;
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            users = userRepository.findAll(PageRequest.of(offset / safeLimit, safeLimit, Sort.by("createdAt").descending()))
                    .getContent().stream().filter(u ->
                (u.getName() != null && u.getName().toLowerCase().contains(q)) ||
                (u.getEmail() != null && u.getEmail().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        } else {
            users = userRepository.findAll(PageRequest.of(offset / safeLimit, safeLimit, Sort.by("createdAt").descending())).getContent();
        }

        StringWriter sw = new StringWriter();
        sw.append("ID,Email,Name,Status,Created At\n");
        for (User u : users) {
            sw.append(u.getId().toString()).append(",")
              .append(u.getEmail() != null ? u.getEmail() : "").append(",")
              .append(u.getName() != null ? u.getName() : "").append(",")
              .append(u.getStatus().name()).append(",")
              .append(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "").append("\n");
        }

        byte[] csvBytes = sw.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvBytes);
    }

    @GetMapping("/bookings")
    public ResponseEntity<byte[]> exportBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10000") int limit) {

        int safeLimit = Math.min(limit, MAX_EXPORT_ROWS);
        List<Booking> bookings = bookingRepository.findAll(PageRequest.of(offset / safeLimit, safeLimit, Sort.by("createdAt").descending())).getContent();
        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bs = BookingStatus.valueOf(status);
                bookings = bookings.stream().filter(b -> b.getStatus() == bs).collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        Set<UUID> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toSet());
        Map<UUID, List<BookingItem>> itemsByBooking = new HashMap<>();
        if (!bookingIds.isEmpty()) {
            List<BookingItem> allItems = bookingItemRepository.findByBookingIdIn(bookingIds);
            itemsByBooking = allItems.stream().collect(Collectors.groupingBy(BookingItem::getBookingId));
        }

        Set<UUID> tenantIds = bookings.stream().map(Booking::getTenantId).collect(Collectors.toSet());
        Map<UUID, Tenant> tenantMap = new HashMap<>();
        for (UUID tid : tenantIds) {
            tenantRepository.findById(tid).ifPresent(t -> tenantMap.put(tid, t));
        }

        StringWriter sw = new StringWriter();
        sw.append("Code,Provider,Customer ID,Status,Total,Start Time,Created At\n");
        for (Booking b : bookings) {
            String providerName = tenantMap.containsKey(b.getTenantId()) ? tenantMap.get(b.getTenantId()).getName() : "";
            sw.append(b.getBookingCode()).append(",")
              .append("\"").append(providerName.replace("\"", "\"\"")).append("\",")
              .append(b.getCustomerId().toString()).append(",")
              .append(b.getStatus().name()).append(",")
              .append(b.getTotal() != null ? b.getTotal().toString() : "0").append(",")
              .append(b.getStartsAt() != null ? b.getStartsAt().toString() : "").append(",")
              .append(b.getCreatedAt() != null ? b.getCreatedAt().toString() : "").append("\n");
        }

        byte[] csvBytes = sw.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvBytes);
    }
}
