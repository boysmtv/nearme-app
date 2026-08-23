package id.dekat.subscription.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByTenantIdAndStatus(UUID tenantId, Subscription.SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.tenantId = :tenantId AND s.status IN ('ACTIVE', 'TRIALING')")
    Optional<Subscription> findActiveSubscription(@Param("tenantId") UUID tenantId);
}
