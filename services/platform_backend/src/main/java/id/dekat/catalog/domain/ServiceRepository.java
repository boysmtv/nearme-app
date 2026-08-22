package id.dekat.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceItem, UUID> {

    List<ServiceItem> findByTenantId(UUID tenantId);

    List<ServiceItem> findByTenantIdAndStatus(UUID tenantId, String status);

    Optional<ServiceItem> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<ServiceItem> findByCategoryId(UUID categoryId);

    List<ServiceItem> findByTenantIdAndVisibility(UUID tenantId, String visibility);
}
