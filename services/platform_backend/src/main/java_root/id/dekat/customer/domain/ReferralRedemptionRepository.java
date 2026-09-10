package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRedemptionRepository extends JpaRepository<ReferralRedemption, UUID> {
    List<ReferralRedemption> findByReferrerId(UUID referrerId);
    boolean existsByReferralIdAndReferredId(UUID referralId, UUID referredId);
}
