package id.dekat.promotion.web;

import id.dekat.promotion.application.CouponService;
import id.dekat.promotion.domain.Coupon;
import id.dekat.promotion.domain.CouponRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/public/bookings")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;
    private final CouponRepository couponRepository;

    @PostMapping("/validate-coupon")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @RequestBody Map<String, String> request) {
        String code = request.get("code");
        String tenantIdStr = request.get("tenantId");

        if (code == null || tenantIdStr == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("code and tenantId are required"));
        }

        UUID tenantId = UUID.fromString(tenantIdStr);
        Coupon coupon = couponRepository.findByTenantIdAndCode(tenantId, code)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));

        couponService.validateCoupon(coupon.getId(), null);

        Map<String, Object> result = Map.of(
                "valid", true,
                "couponId", coupon.getId().toString(),
                "discountType", coupon.getDiscountType().name(),
                "discountValue", coupon.getDiscountValue()
        );

        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
