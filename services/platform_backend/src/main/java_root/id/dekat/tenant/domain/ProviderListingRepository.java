package id.dekat.tenant.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderListingRepository extends JpaRepository<ProviderListing, UUID> {

    Optional<ProviderListing> findBySlug(String slug);
}
