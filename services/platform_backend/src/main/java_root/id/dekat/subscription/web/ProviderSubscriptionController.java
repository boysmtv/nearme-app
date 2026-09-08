package id.dekat.subscription.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/provider/subscription")
public class ProviderSubscriptionController {

    // In-memory store (production would use DB)
    private static final Map<UUID, Map<String, Object>> subscriptions = new HashMap<>();

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentPlan(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        Map<String, Object> sub = subscriptions.getOrDefault(tenantId, Map.of(
                "planId", "FREE",
                "planName", "Free",
                "status", "ACTIVE",
                "startDate", OffsetDateTime.now().toString(),
                "price", 0
        ));
        return ResponseEntity.ok(ApiResponse.ok(sub));
    }

    @PostMapping("/upgrade")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> upgradePlan(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        String planId = (String) body.getOrDefault("planId", "PRO");
        int price = switch (planId) {
            case "PRO" -> 199000;
            case "ENTERPRISE" -> 499000;
            default -> 0;
        };

        Map<String, Object> sub = new LinkedHashMap<>();
        sub.put("planId", planId);
        sub.put("planName", planId);
        sub.put("status", "PENDING_PAYMENT");
        sub.put("startDate", OffsetDateTime.now().toString());
        sub.put("price", price);
        sub.put("paymentUrl", "/payment/subscription/" + tenantId);

        subscriptions.put(tenantId, sub);
        return ResponseEntity.ok(ApiResponse.ok(sub));
    }

    @PostMapping("/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelSubscription(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        Map<String, Object> sub = subscriptions.get(tenantId);
        if (sub != null) {
            sub.put("status", "CANCELLED");
            sub.put("cancelledAt", OffsetDateTime.now().toString());
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of("success", true)));
    }
}
