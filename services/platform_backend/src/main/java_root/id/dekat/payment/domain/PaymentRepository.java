package id.dekat.payment.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentIntent, UUID> {

    Optional<PaymentIntent> findByBookingIdAndStatus(UUID bookingId, PaymentStatus status);

    List<PaymentIntent> findByBookingId(UUID bookingId);

    Optional<PaymentIntent> findByGatewayReference(String gatewayReference);

    Page<PaymentIntent> findByStatus(PaymentStatus status, Pageable pageable);
}
