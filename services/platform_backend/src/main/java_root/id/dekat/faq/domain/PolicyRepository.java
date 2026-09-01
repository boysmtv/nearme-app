package id.dekat.faq.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {
    List<Policy> findByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(UUID tenantId);
    List<Policy> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Policy> findByTypeAndIsActiveTrueOrderByVersionDesc(String type);
    List<Policy> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
