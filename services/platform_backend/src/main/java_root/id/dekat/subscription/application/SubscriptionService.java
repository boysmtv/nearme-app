package id.dekat.subscription.application;

import id.dekat.subscription.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;

    @Transactional
    public Subscription changePlan(UUID tenantId, UUID newPlanId) {
        Subscription subscription = subscriptionRepository.findActiveSubscription(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("No active subscription found for tenant: " + tenantId));

        Plan newPlan = planRepository.findByIdAndStatus(newPlanId, Plan.PlanStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found or inactive: " + newPlanId));

        Plan currentPlan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Current plan not found"));

        if (newPlan.getMaxStaff() < currentPlan.getMaxStaff()) {
            // Downgrading - check if current staff count exceeds new limit
        }

        subscription.setPlanId(newPlanId);

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription cancelSubscription(UUID tenantId) {
        Subscription subscription = subscriptionRepository.findActiveSubscription(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("No active subscription found for tenant: " + tenantId));

        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELLED) {
            throw new IllegalStateException("Subscription is already cancelled");
        }

        subscription.setCancelAt(subscription.getCurrentPeriodEnd());

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription reactivateSubscription(UUID tenantId) {
        Subscription subscription = subscriptionRepository.findByTenantIdAndStatus(
                tenantId, Subscription.SubscriptionStatus.CANCELLED)
                .orElseThrow(() -> new IllegalArgumentException("No cancelled subscription found"));

        if (subscription.getCancelAt() != null && Instant.now().isBefore(subscription.getCancelAt())) {
            subscription.setCancelAt(null);
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            return subscriptionRepository.save(subscription);
        }

        throw new IllegalStateException("Cannot reactivate subscription after cancellation period has ended");
    }

    @Transactional(readOnly = true)
    public boolean checkEntitlement(UUID tenantId, String feature) {
        Subscription subscription = subscriptionRepository.findActiveSubscription(tenantId)
                .orElse(null);

        if (subscription == null) {
            return false;
        }

        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELLED) {
            if (subscription.getCancelAt() != null && Instant.now().isAfter(subscription.getCancelAt())) {
                return false;
            }
        }

        Plan plan = planRepository.findById(subscription.getPlanId()).orElse(null);
        if (plan == null || plan.getStatus() != Plan.PlanStatus.ACTIVE) {
            return false;
        }

        if ("staff".equals(feature)) {
            return true;
        }

        if (plan.getFeatures() != null) {
            return plan.getFeatures().contains(feature);
        }

        return false;
    }

    @Transactional(readOnly = true)
    public Subscription getActiveSubscription(UUID tenantId) {
        return subscriptionRepository.findActiveSubscription(tenantId)
                .orElse(null);
    }

    @Transactional
    public Subscription createSubscription(UUID tenantId, UUID planId) {
        Plan plan = planRepository.findByIdAndStatus(planId, Plan.PlanStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found or inactive: " + planId));

        Instant now = Instant.now();
        Instant periodEnd;

        if (plan.getBillingCycle() == Plan.BillingCycle.MONTHLY) {
            periodEnd = now.plus(30, ChronoUnit.DAYS);
        } else {
            periodEnd = now.plus(365, ChronoUnit.DAYS);
        }

        Subscription subscription = Subscription.builder()
                .tenantId(tenantId)
                .planId(planId)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .currentPeriodStart(now)
                .currentPeriodEnd(periodEnd)
                .build();

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void checkAndCancelExpiredSubscriptions() {
        List<Subscription> subscriptions = subscriptionRepository.findAll().stream()
                .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE
                        && s.getCancelAt() != null
                        && Instant.now().isAfter(s.getCancelAt()))
                .toList();

        for (Subscription sub : subscriptions) {
            sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(sub);
        }
    }
}
