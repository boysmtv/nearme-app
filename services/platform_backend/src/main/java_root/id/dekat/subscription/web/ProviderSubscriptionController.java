package id.dekat.subscription.web;

import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.subscription.application.SubscriptionService;
import id.dekat.subscription.domain.Plan;
import id.dekat.subscription.domain.PlanRepository;
import id.dekat.subscription.domain.Subscription;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/provider/subscription")
@RequiredArgsConstructor
public class ProviderSubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PlanRepository planRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentPlan(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        Subscription sub = subscriptionService.getActiveSubscription(tenantId);
        if (sub == null) {
            Plan freePlan = planRepository.findBySlug("free").orElse(null);
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "planId", "FREE",
                    "planName", "Free",
                    "status", "ACTIVE",
                    "price", 0,
                    "maxStaff", freePlan != null ? freePlan.getMaxStaff() : 1,
                    "maxBookingsPerMonth", freePlan != null ? freePlan.getMaxBookingsPerMonth() : 100
            )));
        }
        Plan plan = planRepository.findById(sub.getPlanId()).orElse(null);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "id", sub.getId().toString(),
                "planId", sub.getPlanId().toString(),
                "planName", plan != null ? plan.getName() : "Unknown",
                "status", sub.getStatus().name(),
                "startDate", sub.getCurrentPeriodStart().toString(),
                "endDate", sub.getCurrentPeriodEnd().toString(),
                "price", plan != null ? plan.getPriceAmount() : 0,
                "maxStaff", plan != null ? plan.getMaxStaff() : 1,
                "maxBookingsPerMonth", plan != null ? plan.getMaxBookingsPerMonth() : 100
        )));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Plan>>> listPlans() {
        List<Plan> plans = planRepository.findAll().stream()
                .filter(p -> p.getStatus() == Plan.PlanStatus.ACTIVE)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }

    @PostMapping("/upgrade")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> upgradePlan(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestBody Map<String, Object> body) {
        UUID planId = UUID.fromString((String) body.get("planId"));
        Subscription sub = subscriptionService.getActiveSubscription(tenantId);
        if (sub != null) {
            sub = subscriptionService.changePlan(tenantId, planId);
        } else {
            sub = subscriptionService.createSubscription(tenantId, planId);
        }
        Plan plan = planRepository.findById(planId).orElse(null);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "id", sub.getId().toString(),
                "planId", sub.getPlanId().toString(),
                "planName", plan != null ? plan.getName() : "Unknown",
                "status", sub.getStatus().name(),
                "startDate", sub.getCurrentPeriodStart().toString(),
                "endDate", sub.getCurrentPeriodEnd().toString(),
                "price", plan != null ? plan.getPriceAmount() : 0
        )));
    }

    @PostMapping("/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelSubscription(
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId) {
        subscriptionService.cancelSubscription(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("success", true)));
    }
}
