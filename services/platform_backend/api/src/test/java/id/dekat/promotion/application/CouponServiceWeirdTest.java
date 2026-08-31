package id.dekat.promotion.application;

import id.dekat.promotion.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CouponService Weird P/N/E/A")
class CouponServiceWeirdTest {

    @Mock private CouponRepository couponRepository;
    @Mock private CouponRuleRepository couponRuleRepository;
    @Mock private CouponRedemptionRepository couponRedemptionRepository;
    @InjectMocks private CouponService couponService;

    private UUID tenantId, couponId, bookingId, customerId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        couponId = UUID.randomUUID();
        bookingId = UUID.randomUUID();
        customerId = UUID.randomUUID();
    }

    // P
    @Test @DisplayName("P: createCoupon valid PERCENTAGE")
    void createCoupon_percentage_valid() {
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, "HEMAT20", DiscountType.PERCENTAGE, 20, 100, 50000, OffsetDateTime.now(), OffsetDateTime.now().plusDays(7));
        assertThat(c.getCode()).isEqualTo("HEMAT20");
        assertThat(c.getDiscountType()).isEqualTo(DiscountType.PERCENTAGE);
        assertThat(c.getStatus()).isEqualTo(CouponStatus.ACTIVE);
    }

    @Test @DisplayName("P: createCoupon FIXED valid")
    void createCoupon_fixed_valid() {
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, "POT10K", DiscountType.FIXED, 10000, null, 0, null, null);
        assertThat(c.getDiscountValue()).isEqualTo(10000);
        assertThat(c.getMaxUses()).isNull();
        assertThat(c.getMinOrder()).isZero();
    }

    @Test @DisplayName("P: validateCoupon ACTIVE & not expired & under limit")
    void validateCoupon_active_ok() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("HEMAT20").discountType(DiscountType.PERCENTAGE).discountValue(20).usedCount(0).maxUses(10).status(CouponStatus.ACTIVE).expiresAt(OffsetDateTime.now().plusDays(5)).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRedemptionRepository.findByCouponIdAndBookingId(any(), any())).thenReturn(Optional.empty());
        Coupon res = couponService.validateCoupon(couponId, bookingId);
        assertThat(res).isEqualTo(c);
    }

    @Test @DisplayName("P: applyCoupon increment usedCount")
    void applyCoupon_increment() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("HEMAT20").discountType(DiscountType.FIXED).discountValue(5000).usedCount(0).maxUses(5).status(CouponStatus.ACTIVE).expiresAt(OffsetDateTime.now().plusDays(5)).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRedemptionRepository.findByCouponIdAndBookingId(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(couponRedemptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        var redemption = couponService.applyCoupon(couponId, bookingId, customerId);
        assertThat(c.getUsedCount()).isEqualTo(1);
        assertThat(redemption.getCouponId()).isEqualTo(couponId);
    }

    // N
    @Test @DisplayName("N: createCoupon duplicate code throw")
    void createCoupon_duplicate_throw() {
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.of(mock(Coupon.class)));
        assertThatThrownBy(() -> couponService.createCoupon(tenantId, "HEMAT20", DiscountType.PERCENTAGE, 20, 10, 0, null, null))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("already exists");
    }

    @Test @DisplayName("N: validateCoupon INACTIVE throw")
    void validate_inactive_throw() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(5000).usedCount(0).status(CouponStatus.INACTIVE).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("not active");
    }

    @Test @DisplayName("N: validateCoupon expired throw")
    void validate_expired_throw() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(5000).usedCount(0).status(CouponStatus.ACTIVE).expiresAt(OffsetDateTime.now().minusDays(1)).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("expired");
    }

    @Test @DisplayName("N: validateCoupon usage limit reached throw")
    void validate_limitReached_throw() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(5000).usedCount(10).maxUses(10).status(CouponStatus.ACTIVE).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("limit");
    }

    @Test @DisplayName("N: validateCoupon already applied to same booking throw")
    void validate_alreadyApplied_throw() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(5000).usedCount(0).maxUses(10).status(CouponStatus.ACTIVE).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRedemptionRepository.findByCouponIdAndBookingId(any(), any())).thenReturn(Optional.of(mock(CouponRedemption.class)));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("already applied");
    }

    @Test @DisplayName("N: validateCoupon not found throw")
    void validate_notFound_throw() {
        when(couponRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("not found");
    }

    // E
    @Test @DisplayName("E: maxUses null = unlimited")
    void validate_unlimited_ok() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("FREE").discountType(DiscountType.PERCENTAGE).discountValue(10).usedCount(9999).maxUses(null).status(CouponStatus.ACTIVE).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRedemptionRepository.findByCouponIdAndBookingId(any(), any())).thenReturn(Optional.empty());
        assertThat(couponService.validateCoupon(couponId, bookingId)).isNotNull();
    }

    @Test @DisplayName("E: expiresAt null = never expire")
    void validate_neverExpire_ok() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(1000).usedCount(0).status(CouponStatus.ACTIVE).expiresAt(null).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRedemptionRepository.findByCouponIdAndBookingId(any(), any())).thenReturn(Optional.empty());
        assertThat(couponService.validateCoupon(couponId, bookingId)).isNotNull();
    }

    @Test @DisplayName("E: expiresAt tepat now (1 detik lalu) sudah expired")
    void validate_exactNow_expired() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(1000).usedCount(0).status(CouponStatus.ACTIVE).expiresAt(OffsetDateTime.now().minusSeconds(1)).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test @DisplayName("E: minOrder null default 0")
    void create_minOrderNull_defaultZero() {
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, "C1", DiscountType.FIXED, 1000, null, null, null, null);
        assertThat(c.getMinOrder()).isZero();
    }

    // A
    @Test @DisplayName("A: code case sensitive? HEMAT20 vs hemat20 beda tenant/code check")
    void code_caseSensitive() {
        when(couponRepository.findByTenantIdAndCode(tenantId, "hemat20")).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, "hemat20", DiscountType.PERCENTAGE, 20, 10, 0, null, null);
        assertThat(c.getCode()).isEqualTo("hemat20");
        verify(couponRepository).findByTenantIdAndCode(tenantId, "hemat20");
    }

    @Test @DisplayName("A: code injection 'DROP TABLE' tetap disimpan sebagai string")
    void code_injection_stored() {
        String evil = "'; DROP TABLE coupons; --";
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, evil, DiscountType.FIXED, 1000, 10, 0, null, null);
        assertThat(c.getCode()).isEqualTo(evil);
    }

    @Test @DisplayName("A: discountValue 0 weird - tetap allow")
    void discountZero_allow() {
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, "ZERO", DiscountType.FIXED, 0, 10, 0, null, null);
        assertThat(c.getDiscountValue()).isZero();
    }

    @Test @DisplayName("A: unicode code")
    void unicode_code() {
        String unicode = "HEMAT💈20";
        when(couponRepository.findByTenantIdAndCode(any(), any())).thenReturn(Optional.empty());
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Coupon c = couponService.createCoupon(tenantId, unicode, DiscountType.PERCENTAGE, 20, 10, 0, null, null);
        assertThat(c.getCode()).isEqualTo(unicode);
    }

    @Test @DisplayName("A: deactivate lalu validate throw not active")
    void deactivate_thenValidate_throw() {
        Coupon c = Coupon.builder().id(couponId).tenantId(tenantId).code("X").discountType(DiscountType.FIXED).discountValue(1000).usedCount(0).status(CouponStatus.ACTIVE).build();
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        when(couponRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        couponService.deactivateCoupon(couponId);
        assertThat(c.getStatus()).isEqualTo(CouponStatus.INACTIVE);
        // validate after deactivate
        when(couponRepository.findById(couponId)).thenReturn(Optional.of(c));
        assertThatThrownBy(() -> couponService.validateCoupon(couponId, bookingId))
                .isInstanceOf(IllegalStateException.class);
    }
}
