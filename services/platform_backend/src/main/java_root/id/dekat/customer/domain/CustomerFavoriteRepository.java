package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerFavoriteRepository extends JpaRepository<CustomerFavorite, UUID> {

    List<CustomerFavorite> findByCustomerId(UUID customerId);

    Optional<CustomerFavorite> findByCustomerIdAndStaffId(UUID customerId, UUID staffId);

    boolean existsByCustomerIdAndStaffId(UUID customerId, UUID staffId);

    void deleteByCustomerIdAndStaffId(UUID customerId, UUID staffId);
}
