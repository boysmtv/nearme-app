package id.dekat.api.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = Map.of(
            "totalUsers", 5,
            "totalTenants", 1,
            "totalBookings", 4,
            "totalRevenue", 350000,
            "activeProviders", 1,
            "pendingVerifications", 0
        );
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        Map<String, Object> result = Map.of(
            "data", List.of(
                Map.of("id", "e0000000-0000-0000-0000-000000000001", "email", "admin@dekat.id", "name", "Platform Admin", "status", "ACTIVE"),
                Map.of("id", "e0000000-0000-0000-0000-000000000002", "email", "budi@barbershopcentral.id", "name", "Budi Santoso", "status", "ACTIVE"),
                Map.of("id", "e0000000-0000-0000-0000-000000000003", "email", "andi@barbershopcentral.id", "name", "Andi Wijaya", "status", "ACTIVE"),
                Map.of("id", "e0000000-0000-0000-0000-000000000004", "email", "rudi@barbershopcentral.id", "name", "Rudi Pratama", "status", "ACTIVE"),
                Map.of("id", "e0000000-0000-0000-0000-000000000005", "email", "siti@gmail.com", "name", "Siti Rahayu", "status", "ACTIVE")
            ),
            "pagination", Map.of("page", page, "limit", limit, "total", 5, "totalPages", 1)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Map<String, Object> user = Map.of("id", id.toString(), "status", body.getOrDefault("status", "ACTIVE"));
        return ResponseEntity.ok(ApiResponse.ok(user, "User status updated"));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listTenants(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        Map<String, Object> result = Map.of(
            "data", List.of(
                Map.of("id", "10000000-0000-0000-0000-000000000001", "name", "Barbershop Central", "slug", "barbershop-central", "status", "ACTIVE", "verificationStatus", "VERIFIED")
            ),
            "pagination", Map.of("page", page, "limit", limit, "total", 1, "totalPages", 1)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/tenants/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveTenant(@PathVariable UUID id) {
        Map<String, Object> tenant = Map.of("id", id.toString(), "verificationStatus", "VERIFIED");
        return ResponseEntity.ok(ApiResponse.ok(tenant, "Tenant approved"));
    }

    @PutMapping("/tenants/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectTenant(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Map<String, Object> tenant = Map.of("id", id.toString(), "verificationStatus", "REJECTED");
        return ResponseEntity.ok(ApiResponse.ok(tenant, "Tenant rejected"));
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

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listPayments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        Map<String, Object> result = Map.of(
            "data", List.of(),
            "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listCases(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status) {
        Map<String, Object> result = Map.of(
            "data", List.of(),
            "pagination", Map.of("page", page, "limit", limit, "total", 0, "totalPages", 0)
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/cases/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCaseStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        Map<String, Object> caseObj = Map.of("id", id.toString(), "status", body.getOrDefault("status", "OPEN"));
        return ResponseEntity.ok(ApiResponse.ok(caseObj, "Case status updated"));
    }

    @GetMapping("/config/flags")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getConfigFlags() {
        List<Map<String, Object>> flags = List.of(
            Map.of("id", "1", "name", "maintenance_mode", "enabled", false, "description", "Platform maintenance mode"),
            Map.of("id", "2", "name", "new_registration", "enabled", true, "description", "Allow new user registration"),
            Map.of("id", "3", "name", "payment_enabled", "enabled", true, "description", "Enable payment processing")
        );
        return ResponseEntity.ok(ApiResponse.ok(flags));
    }

    @PutMapping("/config/flags/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFlag(
            @PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Map<String, Object> flag = Map.of("id", id.toString(), "enabled", body.getOrDefault("enabled", true));
        return ResponseEntity.ok(ApiResponse.ok(flag, "Feature flag updated"));
    }
}
