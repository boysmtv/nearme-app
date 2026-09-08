package id.dekat.customer.web;

import id.dekat.customer.application.LoyaltyService;
import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/customer/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLoyaltyInfo(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        Map<String, Object> info = loyaltyService.getAccountInfo(customerId, tenantId);
        return ResponseEntity.ok(ApiResponse.ok(info));
    }

    @PostMapping("/redeem")
    public ResponseEntity<ApiResponse<Map<String, Object>>> redeemPoints(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        int points = (int) body.getOrDefault("points", 0);
        String description = (String) body.getOrDefault("description", "Redeem");
        boolean success = loyaltyService.redeemPoints(customerId, tenantId, points, description);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("success", success, "remaining", loyaltyService.getAccountInfo(customerId, tenantId).get("points"))));
    }

    @PostMapping("/birthday-bonus")
    public ResponseEntity<ApiResponse<Map<String, Object>>> birthdayBonus(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        loyaltyService.birthdayBonus(customerId, tenantId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("success", true, "bonus", 500)));
    }
}
