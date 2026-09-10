package id.dekat.booking.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {
    List<WaitlistEntry> findByTenantIdAndPreferredDate(UUID tenantId, LocalDate preferredDate);
    List<WaitlistEntry> findByTenantId(UUID tenantId);
    List<WaitlistEntry> findByTenantIdAndStatus(UUID tenantId, String status);
    long countByTenantIdAndPreferredDateAndStatus(UUID tenantId, LocalDate preferredDate, String status);
}
