package id.dekat.customer.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, UUID> {
    List<RecurringBooking> findByCustomerId(UUID customerId);
    List<RecurringBooking> findByCustomerIdAndIsActive(UUID customerId, Boolean isActive);
    List<RecurringBooking> findByTenantId(UUID tenantId);
}
