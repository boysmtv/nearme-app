package id.dekat.subscription.web;

import id.dekat.subscription.application.SubscriptionService;
import id.dekat.subscription.domain.Plan;
import id.dekat.subscription.domain.PlanRepository;
import id.dekat.subscription.domain.Subscription;
import id.dekat.subscription.domain.SubscriptionRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/subscriptions")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Plan>>> listPlans() {
        return ResponseEntity.ok(ApiResponse.ok(planRepository.findAll()));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<Plan>> getPlan(@PathVariable UUID id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        return ResponseEntity.ok(ApiResponse.ok(plan));
    }

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<Plan>> createPlan(@RequestBody Plan plan) {
        Plan saved = planRepository.save(plan);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Plan created"));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<Plan>> updatePlan(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        if (body.containsKey("name")) plan.setName((String) body.get("name"));
        if (body.containsKey("priceAmount")) plan.setPriceAmount((Integer) body.get("priceAmount"));
        if (body.containsKey("currency")) plan.setCurrency((String) body.get("currency"));
        if (body.containsKey("maxStaff")) plan.setMaxStaff((Integer) body.get("maxStaff"));
        if (body.containsKey("maxBookingsPerMonth")) plan.setMaxBookingsPerMonth((Integer) body.get("maxBookingsPerMonth"));
        if (body.containsKey("features")) plan.setFeatures((String) body.get("features"));
        if (body.containsKey("status")) plan.setStatus(Plan.PlanStatus.valueOf((String) body.get("status")));
        Plan saved = planRepository.save(plan);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Plan updated"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subscription>>> listSubscriptions() {
        return ResponseEntity.ok(ApiResponse.ok(subscriptionRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subscription>> getSubscription(@PathVariable UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        return ResponseEntity.ok(ApiResponse.ok(sub));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Subscription>> createSubscription(@RequestBody Map<String, UUID> body) {
        UUID tenantId = body.get("tenantId");
        UUID planId = body.get("planId");
        Subscription sub = subscriptionService.createSubscription(tenantId, planId);
        return ResponseEntity.ok(ApiResponse.ok(sub, "Subscription created"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Subscription>> cancelSubscription(@PathVariable UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        UUID tenantId = sub.getTenantId();
        Subscription cancelled = subscriptionService.cancelSubscription(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(cancelled, "Subscription cancelled"));
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<ApiResponse<Subscription>> reactivateSubscription(@PathVariable UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        UUID tenantId = sub.getTenantId();
        Subscription reactivated = subscriptionService.reactivateSubscription(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(reactivated, "Subscription reactivated"));
    }
}
