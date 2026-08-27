package id.dekat.promotion.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {

    Optional<CouponRedemption> findByCouponIdAndBookingId(UUID couponId, UUID bookingId);

    long countByCouponId(UUID couponId);
}
