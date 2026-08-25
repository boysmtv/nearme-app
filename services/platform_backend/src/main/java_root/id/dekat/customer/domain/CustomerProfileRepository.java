package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {

    List<CustomerProfile> findByTenantId(UUID tenantId);
}
