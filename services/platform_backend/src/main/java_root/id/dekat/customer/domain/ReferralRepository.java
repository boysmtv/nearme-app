package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {
    Optional<Referral> findByReferrerId(UUID referrerId);
    Optional<Referral> findByCode(String code);
    boolean existsByCode(String code);
}
