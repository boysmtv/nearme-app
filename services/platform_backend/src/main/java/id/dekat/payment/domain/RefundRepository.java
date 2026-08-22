package id.dekat.payment.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {

    List<Refund> findByBookingId(UUID bookingId);

    List<Refund> findByPaymentIntentId(UUID paymentIntentId);

    List<Refund> findByStatus(Refund.RefundStatus status);
}
