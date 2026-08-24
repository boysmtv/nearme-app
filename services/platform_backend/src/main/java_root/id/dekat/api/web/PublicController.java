package id.dekat.api.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/public")
public class PublicController {

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategories() {
        List<Map<String, Object>> categories = List.of(
            Map.of("id", "1", "name", "Barbershop", "slug", "barbershop", "icon", "💇", "serviceCount", 0),
            Map.of("id", "2", "name", "Salon", "slug", "salon", "icon", "✂️", "serviceCount", 0),
            Map.of("id", "3", "name", "Spa & Massage", "slug", "spa-massage", "icon", "💆", "serviceCount", 0),
            Map.of("id", "4", "name", "Kecantikan", "slug", "kecantikan", "icon", "✨", "serviceCount", 0),
            Map.of("id", "5", "name", "Kesehatan", "slug", "kesehatan", "icon", "🏥", "serviceCount", 0),
            Map.of("id", "6", "name", "Olahraga", "slug", "olahraga", "icon", "🏋️", "serviceCount", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchProviders(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> providers = List.of(
            Map.of(
                "id", "10000000-0000-0000-0000-000000000001",
                "name", "Barbershop Central",
                "slug", "barbershop-central",
                "category", "Barbershop",
                "city", "Jakarta Pusat",
                "rating", 4.8,
                "reviewCount", 124,
                "address", "Jl. Sudirman No. 123",
                "imageUrl", "/images/barbershop-central.jpg"
            )
        );
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/providers/featured")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFeaturedProviders() {
        List<Map<String, Object>> providers = List.of(
            Map.of(
                "id", "10000000-0000-0000-0000-000000000001",
                "name", "Barbershop Central",
                "slug", "barbershop-central",
                "category", "Barbershop",
                "city", "Jakarta Pusat",
                "rating", 4.8,
                "reviewCount", 124,
                "address", "Jl. Sudirman No. 123",
                "imageUrl", "/images/barbershop-central.jpg"
            )
        );
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/providers/{slug}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProviderBySlug(@PathVariable String slug) {
        Map<String, Object> provider = Map.of(
            "id", "10000000-0000-0000-0000-000000000001",
            "name", "Barbershop Central",
            "slug", "barbershop-central",
            "description", "Barbershop premium untuk pria modern",
            "category", "Barbershop",
            "city", "Jakarta Pusat",
            "rating", 4.8,
            "reviewCount", 124,
            "address", "Jl. Sudirman No. 123",
            "phone", "+6281298765432"
        );
        return ResponseEntity.ok(ApiResponse.ok(provider));
    }

    @GetMapping("/providers/{providerId}/services")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviderServices(@PathVariable UUID providerId) {
        List<Map<String, Object>> services = List.of(
            Map.of("id", UUID.randomUUID().toString(), "name", "Potong Rapi", "price", 50000, "duration", 30, "currency", "IDR"),
            Map.of("id", UUID.randomUUID().toString(), "name", "Fade Master", "price", 65000, "duration", 40, "currency", "IDR")
        );
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @GetMapping("/providers/{providerId}/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviderStaff(@PathVariable UUID providerId) {
        List<Map<String, Object>> staff = List.of(
            Map.of("id", UUID.randomUUID().toString(), "name", "Andi Wijaya", "title", "Senior Barber", "avatar", "/images/andi.jpg")
        );
        return ResponseEntity.ok(ApiResponse.ok(staff));
    }

    @GetMapping("/providers/{providerId}/availability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailability(
            @PathVariable UUID providerId,
            @RequestParam UUID staffId,
            @RequestParam(required = false) UUID serviceId,
            @RequestParam String date) {
        List<Map<String, Object>> slots = List.of(
            Map.of("id", UUID.randomUUID().toString(), "time", "09:00", "available", true),
            Map.of("id", UUID.randomUUID().toString(), "time", "09:30", "available", true),
            Map.of("id", UUID.randomUUID().toString(), "time", "10:00", "available", false),
            Map.of("id", UUID.randomUUID().toString(), "time", "10:30", "available", true),
            Map.of("id", UUID.randomUUID().toString(), "time", "11:00", "available", true)
        );
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/providers/{providerId}/reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProviderReviews(
            @PathVariable UUID providerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = Map.of(
            "data", List.of(),
            "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBooking(@RequestBody Map<String, Object> request) {
        Map<String, Object> booking = Map.of(
            "id", UUID.randomUUID().toString(),
            "status", "CONFIRMED",
            "bookingCode", "DKT-" + System.currentTimeMillis() % 10000
        );
        return ResponseEntity.ok(ApiResponse.ok(booking, "Booking created"));
    }
}
