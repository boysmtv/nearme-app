package id.dekat.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProviderLocationRepository extends JpaRepository<ProviderLocation, UUID> {

    List<ProviderLocation> findByTenantIdAndIsActiveTrue(UUID tenantId);

    List<ProviderLocation> findByCityIgnoreCaseAndIsActiveTrue(String city);
}
