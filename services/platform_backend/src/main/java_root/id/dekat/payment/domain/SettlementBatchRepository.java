package id.dekat.payment.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SettlementBatchRepository extends JpaRepository<SettlementBatch, UUID> {
    List<SettlementBatch> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<SettlementBatch> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, SettlementBatch.SettlementStatus status);
}
