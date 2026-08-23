package id.dekat.audit.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, UUID resourceId);

    List<AuditLog> findByActorIdAndCreatedAtBetween(UUID actorId, Instant start, Instant end);

    @Query("SELECT a FROM AuditLog a WHERE a.action = :action AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<AuditLog> findByActionSince(@Param("action") String action, @Param("since") Instant since);

    List<AuditLog> findByRequestId(String requestId);
}
