package id.dekat.customer.web;

import id.dekat.customer.application.CustomerService;
import id.dekat.customer.domain.CustomerProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/customer/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        CustomerProfile profile = customerService.getProfile(userId, tenantId);
        if (profile == null) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
        return ResponseEntity.ok(Map.of(
                "exists", true,
                "id", profile.getId(),
                "nickname", profile.getNickname() != null ? profile.getNickname() : "",
                "loyaltyPoints", profile.getLoyaltyPoints(),
                "totalBookings", profile.getTotalBookings(),
                "totalSpent", profile.getTotalSpent()
        ));
    }

    @PutMapping("/customer/profile")
    public ResponseEntity<Map<String, Object>> updateMyProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody Map<String, String> body) {
        CustomerProfile profile = customerService.createOrUpdateProfile(
                userId, tenantId, body.get("nickname"));
        return ResponseEntity.ok(Map.of(
                "id", profile.getId(),
                "nickname", profile.getNickname() != null ? profile.getNickname() : ""
        ));
    }

}
