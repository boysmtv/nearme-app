package id.dekat.access.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoleAssignmentRepository extends JpaRepository<RoleAssignment, UUID> {

    List<RoleAssignment> findByUserIdAndTenantId(UUID userId, UUID tenantId);

    List<RoleAssignment> findByUserId(UUID userId);

    @Query("SELECT ra FROM RoleAssignment ra WHERE ra.userId = :userId AND ra.tenantId = :tenantId " +
           "AND (ra.expiresAt IS NULL OR ra.expiresAt > :now)")
    List<RoleAssignment> findActiveAssignments(@Param("userId") UUID userId,
                                               @Param("tenantId") UUID tenantId,
                                               @Param("now") LocalDateTime now);

    @Query("SELECT ra FROM RoleAssignment ra WHERE ra.userId = :userId " +
           "AND (ra.expiresAt IS NULL OR ra.expiresAt > :now)")
    List<RoleAssignment> findActiveAssignmentsGlobal(@Param("userId") UUID userId,
                                                     @Param("now") LocalDateTime now);

    void deleteByUserIdAndRoleIdAndTenantId(UUID userId, UUID roleId, UUID tenantId);

    boolean existsByUserIdAndRoleIdAndTenantId(UUID userId, UUID roleId, UUID tenantId);
}
