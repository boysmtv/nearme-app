package id.dekat.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Optional<Tenant> findBySlugAndVerificationStatus(String slug, String verificationStatus);

    long countByCreatedAtAfter(OffsetDateTime date);

    long countByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);
}
