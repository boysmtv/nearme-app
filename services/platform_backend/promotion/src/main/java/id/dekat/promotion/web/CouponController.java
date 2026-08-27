package id.dekat.promotion.web;

import id.dekat.promotion.application.CouponService;
import id.dekat.promotion.domain.Coupon;
import id.dekat.promotion.domain.DiscountType;
import id.dekat.promotion.web.dto.CouponRequest;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/provider/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getCoupons(
            @RequestHeader("X-Tenant-Id") UUID tenantId) {
        List<Coupon> coupons = couponService.getCouponsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(coupons));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestBody CouponRequest request) {
        DiscountType type = DiscountType.valueOf(request.discountType());
        OffsetDateTime startsAt = request.startsAt() != null ? OffsetDateTime.parse(request.startsAt()) : null;
        OffsetDateTime expiresAt = request.expiresAt() != null ? OffsetDateTime.parse(request.expiresAt()) : null;

        Coupon coupon = couponService.createCoupon(
                tenantId, request.code(), type, request.discountValue(),
                request.maxUses(), request.minOrder(), startsAt, expiresAt);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(coupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(
            @PathVariable UUID id,
            @RequestBody CouponRequest request) {
        DiscountType type = request.discountType() != null ? DiscountType.valueOf(request.discountType()) : null;
        OffsetDateTime startsAt = request.startsAt() != null ? OffsetDateTime.parse(request.startsAt()) : null;
        OffsetDateTime expiresAt = request.expiresAt() != null ? OffsetDateTime.parse(request.expiresAt()) : null;

        Coupon coupon = couponService.updateCoupon(
                id, request.code(), type, request.discountValue(),
                request.maxUses(), request.minOrder(), startsAt, expiresAt);
        return ResponseEntity.ok(ApiResponse.ok(coupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> deactivateCoupon(@PathVariable UUID id) {
        Coupon coupon = couponService.deactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.ok(coupon));
    }
}
