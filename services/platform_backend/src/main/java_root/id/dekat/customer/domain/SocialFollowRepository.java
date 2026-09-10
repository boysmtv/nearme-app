package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocialFollowRepository extends JpaRepository<SocialFollow, UUID> {
    Optional<SocialFollow> findByCustomerIdAndProviderId(UUID customerId, String providerId);
    boolean existsByCustomerIdAndProviderId(UUID customerId, String providerId);
    long countByProviderId(String providerId);
}
