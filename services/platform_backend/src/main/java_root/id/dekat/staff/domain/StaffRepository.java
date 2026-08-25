package id.dekat.staff.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {

    List<Staff> findByTenantIdAndIsActiveTrue(UUID tenantId);

    List<Staff> findByTenantId(UUID tenantId);

    @Query("SELECT s FROM Staff s WHERE s.tenantId = :tenantId AND s.isActive = true ORDER BY s.sortOrder ASC")
    List<Staff> findActivePublicStaff(@Param("tenantId") UUID tenantId);

    boolean existsByTenantIdAndDisplayName(UUID tenantId, String displayName);

    boolean existsByUserId(UUID userId);
}
