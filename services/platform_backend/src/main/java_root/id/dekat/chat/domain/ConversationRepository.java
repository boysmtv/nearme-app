package id.dekat.chat.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByCustomerIdOrProviderIdOrderByUpdatedAtDesc(UUID customerId, UUID providerId);

    List<Conversation> findByTenantIdOrderByUpdatedAtDesc(UUID tenantId);

    List<Conversation> findByBookingId(UUID bookingId);

    Optional<Conversation> findByIdAndTenantId(UUID id, UUID tenantId);

    List<Conversation> findByCustomerIdOrderByUpdatedAtDesc(UUID customerId);

    List<Conversation> findByProviderIdOrderByUpdatedAtDesc(UUID providerId);
}
