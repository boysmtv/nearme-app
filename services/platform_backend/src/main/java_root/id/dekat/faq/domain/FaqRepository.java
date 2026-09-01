package id.dekat.faq.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FaqRepository extends JpaRepository<Faq, UUID> {
    List<Faq> findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(UUID tenantId);
    List<Faq> findByIsActiveTrueOrderBySortOrderAsc();
    List<Faq> findByTenantIdOrderBySortOrderAsc(UUID tenantId);
    List<Faq> findByCategoryAndIsActiveTrueOrderBySortOrderAsc(String category);
}
