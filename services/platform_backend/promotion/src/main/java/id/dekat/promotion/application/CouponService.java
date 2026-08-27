package id.dekat.promotion.application;

import id.dekat.promotion.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRuleRepository couponRuleRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    @Transactional
    public Coupon createCoupon(UUID tenantId, String code, DiscountType type, Integer value,
                                Integer maxUses, Integer minOrder, OffsetDateTime startsAt,
                                OffsetDateTime expiresAt) {
        if (couponRepository.findByTenantIdAndCode(tenantId, code).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists for this tenant: " + code);
        }

        Coupon coupon = Coupon.builder()
                .tenantId(tenantId)
                .code(code)
                .discountType(type)
                .discountValue(value)
                .maxUses(maxUses)
                .minOrder(minOrder != null ? minOrder : 0)
                .startsAt(startsAt)
                .expiresAt(expiresAt)
                .status(CouponStatus.ACTIVE)
                .build();

        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(UUID couponId, String code, DiscountType type, Integer value,
                                Integer maxUses, Integer minOrder, OffsetDateTime startsAt,
                                OffsetDateTime expiresAt) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + couponId));

        if (code != null) coupon.setCode(code);
        if (type != null) coupon.setDiscountType(type);
        if (value != null) coupon.setDiscountValue(value);
        if (maxUses != null) coupon.setMaxUses(maxUses);
        if (minOrder != null) coupon.setMinOrder(minOrder);
        if (startsAt != null) coupon.setStartsAt(startsAt);
        if (expiresAt != null) coupon.setExpiresAt(expiresAt);

        return couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public Coupon validateCoupon(UUID couponId, UUID bookingId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + couponId));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new IllegalStateException("Coupon is not active");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("Coupon has expired");
        }

        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new IllegalStateException("Coupon usage limit reached");
        }

        couponRedemptionRepository.findByCouponIdAndBookingId(couponId, bookingId)
                .ifPresent(r -> { throw new IllegalStateException("Coupon already applied to this booking"); });

        return coupon;
    }

    @Transactional
    public CouponRedemption applyCoupon(UUID couponId, UUID bookingId, UUID customerId) {
        Coupon coupon = validateCoupon(couponId, bookingId);

        CouponRedemption redemption = CouponRedemption.builder()
                .couponId(couponId)
                .bookingId(bookingId)
                .customerId(customerId)
                .discountApplied(coupon.getDiscountValue())
                .build();

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return couponRedemptionRepository.save(redemption);
    }

    @Transactional(readOnly = true)
    public List<Coupon> getCouponsByTenant(UUID tenantId) {
        return couponRepository.findByTenantIdAndStatus(tenantId, CouponStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<CouponRule> getCouponRules(UUID couponId) {
        return couponRuleRepository.findByCouponId(couponId);
    }

    @Transactional
    public Coupon deactivateCoupon(UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + couponId));
        coupon.setStatus(CouponStatus.INACTIVE);
        return couponRepository.save(coupon);
    }
}
