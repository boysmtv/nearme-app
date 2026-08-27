package id.dekat.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BlockedDateRepository extends JpaRepository<BlockedDate, UUID> {
    List<BlockedDate> findByTenantIdAndBlockedDateBetween(UUID tenantId, LocalDate start, LocalDate end);
    List<BlockedDate> findByTenantId(UUID tenantId);
    void deleteByTenantIdAndBlockedDate(UUID tenantId, LocalDate blockedDate);
}
