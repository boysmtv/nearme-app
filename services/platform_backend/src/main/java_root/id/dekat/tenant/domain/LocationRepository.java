package id.dekat.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    List<Location> findByTenantId(UUID tenantId);

    List<Location> findByTenantIdAndStatus(UUID tenantId, String status);
}
