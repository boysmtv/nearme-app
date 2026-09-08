package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, UUID> {
    Optional<LoyaltyAccount> findByCustomerIdAndTenantId(UUID customerId, UUID tenantId);
    Optional<LoyaltyAccount> findByCustomerId(UUID customerId);
}
