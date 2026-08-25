package id.dekat.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, UUID> {

    List<ServiceOffering> findByTenantIdAndIsActiveTrueOrderByNameAsc(UUID tenantId);

    List<ServiceOffering> findByTenantIdOrderByNameAsc(UUID tenantId);

    List<ServiceOffering> findByTenantIdAndIsActiveTrue(UUID tenantId);

    long countByCategoryIdAndIsActiveTrue(UUID categoryId);
}
