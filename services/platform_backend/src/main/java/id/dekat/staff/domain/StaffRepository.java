package id.dekat.staff.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {

    List<Staff> findByTenantIdAndStatus(UUID tenantId, Staff.StaffStatus status);

    List<Staff> findByTenantIdAndVisibility(UUID tenantId, Staff.StaffVisibility visibility);

    @Query("SELECT s FROM Staff s WHERE s.tenantId = :tenantId AND s.status = 'ACTIVE' AND s.visibility = 'PUBLIC'")
    List<Staff> findActivePublicStaff(@Param("tenantId") UUID tenantId);

    boolean existsByTenantIdAndEmail(UUID tenantId, String email);

    boolean existsByUserId(UUID userId);
}
