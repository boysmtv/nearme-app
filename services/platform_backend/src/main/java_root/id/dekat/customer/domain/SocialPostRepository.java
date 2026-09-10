package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SocialPostRepository extends JpaRepository<SocialPost, UUID> {
    List<SocialPost> findAllByOrderByCreatedAtDesc();
    List<SocialPost> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<SocialPost> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
