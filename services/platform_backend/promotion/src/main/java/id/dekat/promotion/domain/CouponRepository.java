package id.dekat.promotion.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByTenantIdAndCode(UUID tenantId, String code);

    List<Coupon> findByTenantIdAndStatus(UUID tenantId, CouponStatus status);
}
