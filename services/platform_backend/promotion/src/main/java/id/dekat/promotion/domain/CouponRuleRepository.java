package id.dekat.promotion.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CouponRuleRepository extends JpaRepository<CouponRule, UUID> {

    List<CouponRule> findByCouponId(UUID couponId);
}
