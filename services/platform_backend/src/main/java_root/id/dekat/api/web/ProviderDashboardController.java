package id.dekat.api.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/provider")
public class ProviderDashboardController {

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = Map.of(
            "todayBookings", 3,
            "todayRevenue", 150000,
            "weekBookings", 18,
            "weekRevenue", 900000,
            "totalCustomers", 42,
            "avgRating", 4.8,
            "currency", "IDR"
        );
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/dashboard/recent-bookings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentBookings() {
        List<Map<String, Object>> bookings = List.of(
            Map.of("id", "a0000001-0000-0000-0000-000000000001", "customerName", "Siti Rahayu", "serviceName", "Potong Rapi", "status", "COMPLETED", "time", "09:00", "amount", 50000),
            Map.of("id", "a0000001-0000-0000-0000-000000000002", "customerName", "Siti Rahayu", "serviceName", "Fade Master", "status", "CONFIRMED", "time", "10:30", "amount", 65000)
        );
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        Map<String, Object> result = Map.of(
            "data", List.of(),
            "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBooking(@PathVariable UUID id) {
        Map<String, Object> booking = Map.of("id", id.toString(), "status", "CONFIRMED");
        return ResponseEntity.ok(ApiResponse.ok(booking));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBookingStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Map<String, Object> booking = Map.of("id", id.toString(), "status", body.getOrDefault("status", "CONFIRMED"));
        return ResponseEntity.ok(ApiResponse.ok(booking, "Booking status updated"));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listServices() {
        List<Map<String, Object>> services = List.of(
            Map.of("id", UUID.randomUUID().toString(), "name", "Potong Rapi", "price", 50000, "duration", 30, "currency", "IDR", "active", true),
            Map.of("id", UUID.randomUUID().toString(), "name", "Fade Master", "price", 65000, "duration", 40, "currency", "IDR", "active", true),
            Map.of("id", UUID.randomUUID().toString(), "name", "Potong + Cukur", "price", 75000, "duration", 45, "currency", "IDR", "active", true),
            Map.of("id", UUID.randomUUID().toString(), "name", "Hair Coloring", "price", 150000, "duration", 90, "currency", "IDR", "active", true)
        );
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createService(@RequestBody Map<String, Object> request) {
        Map<String, Object> service = Map.of(
            "id", UUID.randomUUID().toString(),
            "name", request.getOrDefault("name", "New Service"),
            "price", request.getOrDefault("price", 0),
            "duration", request.getOrDefault("duration", 30),
            "currency", "IDR",
            "active", true
        );
        return ResponseEntity.ok(ApiResponse.ok(service, "Service created"));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateService(
            @PathVariable UUID id, @RequestBody Map<String, Object> request) {
        Map<String, Object> service = Map.of("id", id.toString(), "name", request.getOrDefault("name", ""), "active", true);
        return ResponseEntity.ok(ApiResponse.ok(service, "Service updated"));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, "Service deleted"));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listStaff() {
        List<Map<String, Object>> staff = List.of(
            Map.of("id", "50000000-0000-0000-0000-000000000001", "name", "Andi Wijaya", "title", "Senior Barber", "active", true),
            Map.of("id", "50000000-0000-0000-0000-000000000002", "name", "Rudi Pratama", "title", "Barber", "active", true)
        );
        return ResponseEntity.ok(ApiResponse.ok(staff));
    }

    @PostMapping("/staff/invite")
    public ResponseEntity<ApiResponse<Map<String, Object>>> inviteStaff(@RequestBody Map<String, Object> request) {
        Map<String, Object> staff = Map.of(
            "id", UUID.randomUUID().toString(),
            "name", request.getOrDefault("name", ""),
            "email", request.getOrDefault("email", ""),
            "role", request.getOrDefault("role", "STAFF"),
            "active", true
        );
        return ResponseEntity.ok(ApiResponse.ok(staff, "Staff invitation sent"));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listCustomers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search) {
        Map<String, Object> result = Map.of(
            "data", List.of(),
            "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCalendarBookings(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) UUID staffId) {
        Map<String, Object> report = Map.of(
            "totalBookings", 0,
            "totalRevenue", 0,
            "avgRating", 0,
            "currency", "IDR"
        );
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings() {
        Map<String, Object> settings = Map.of(
            "businessName", "Barbershop Central",
            "currency", "IDR",
            "timezone", "Asia/Jakarta",
            "bookingEnabled", true
        );
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ApiResponse.ok(request, "Settings updated"));
    }
}
