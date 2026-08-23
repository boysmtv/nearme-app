package id.dekat.subscription.application;

import id.dekat.subscription.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

        // Validate upgrade/downgrade limits
        if (newPlan.getMaxStaff() < currentPlan.getMaxStaff()) {
            // Downgrading - check if current staff count exceeds new limit
            // This would require staff count check against StaffRepository
        }

        // Calculate proration
        long remainingDays = ChronoUnit.DAYS.between(
                Instant.now(), subscription.getCurrentPeriodEnd()
        );
        long totalDays = ChronoUnit.DAYS.between(
                subscription.getCurrentPeriodStart(), subscription.getCurrentPeriodEnd()
        );

        BigDecimal proratedCredit = BigDecimal.ZERO;
        if (totalDays > 0 && remainingDays > 0) {
            BigDecimal dailyCurrentRate = currentPlan.getPriceAmount()
                    .divide(BigDecimal.valueOf(totalDays), 10, RoundingMode.HALF_UP);
            proratedCredit = dailyCurrentRate.multiply(BigDecimal.valueOf(remainingDays));
        }

        subscription.setPlanId(newPlanId);
        subscription.setUsedBookingsThisPeriod(0);

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription cancelSubscription(UUID tenantId) {
        Subscription subscription = subscriptionRepository.findActiveSubscription(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("No active subscription found for tenant: " + tenantId));

        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELED) {
            throw new IllegalStateException("Subscription is already cancelled");
        }

        // Set cancel_at to end of current period - maintain access until then
        subscription.setCancelAt(subscription.getCurrentPeriodEnd());

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription reactivateSubscription(UUID tenantId) {
        Subscription subscription = subscriptionRepository.findByTenantIdAndStatus(
                tenantId, Subscription.SubscriptionStatus.CANCELED)
                .orElseThrow(() -> new IllegalArgumentException("No cancelled subscription found"));

        if (subscription.getCancelAt() != null && Instant.now().isBefore(subscription.getCancelAt())) {
            // Reactivate before cancellation takes effect
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

        // Check if subscription is cancelled but still in access period
        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELED) {
            if (subscription.getCancelAt() != null && Instant.now().isAfter(subscription.getCancelAt())) {
                return false;
            }
        }

        Plan plan = planRepository.findById(subscription.getPlanId()).orElse(null);
        if (plan == null || plan.getStatus() != Plan.PlanStatus.ACTIVE) {
            return false;
        }

        // Check feature-specific entitlements
        if ("bookings".equals(feature)) {
            return subscription.getUsedBookingsThisPeriod() < plan.getMaxBookingsPerMonth();
        }

        if ("staff".equals(feature)) {
            // Would need to check current staff count against plan.getMaxStaff()
            return true;
        }

        // Check if feature string is in plan's features JSON
        if (plan.getFeatures() != null) {
            return plan.getFeatures().contains(feature);
        }

        return false;
    }

    @Transactional
    public Subscription incrementUsage(UUID tenantId) {
        Subscription subscription = subscriptionRepository.findActiveSubscription(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("No active subscription found"));

        Plan plan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        if (subscription.getUsedBookingsThisPeriod() >= plan.getMaxBookingsPerMonth()) {
            throw new IllegalStateException(
                "Booking limit reached for current period. Limit: " + plan.getMaxBookingsPerMonth()
            );
        }

        subscription.setUsedBookingsThisPeriod(subscription.getUsedBookingsThisPeriod() + 1);
        return subscriptionRepository.save(subscription);
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
                .usedBookingsThisPeriod(0)
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
            sub.setStatus(Subscription.SubscriptionStatus.CANCELED);
            subscriptionRepository.save(sub);
        }
    }
}
