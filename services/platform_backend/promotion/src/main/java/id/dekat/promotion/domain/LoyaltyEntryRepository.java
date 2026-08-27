package id.dekat.promotion.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyEntryRepository extends JpaRepository<LoyaltyEntry, UUID> {

    List<LoyaltyEntry> findByTenantIdAndCustomerIdOrderByCreatedAtDesc(UUID tenantId, UUID customerId);

    @Query("SELECT COALESCE(SUM(le.points), 0) FROM LoyaltyEntry le WHERE le.tenantId = :tenantId AND le.customerId = :customerId")
    int sumPoints(@Param("tenantId") UUID tenantId, @Param("customerId") UUID customerId);
}
