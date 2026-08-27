package id.dekat.support.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportRepository extends JpaRepository<SupportCase, UUID> {

    List<SupportCase> findByTenantIdAndStatus(UUID tenantId, SupportCase.CaseStatus status);

    List<SupportCase> findByAssignedTo(UUID assignedTo);
}
