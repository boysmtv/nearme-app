package id.dekat.notification.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationDelivery, UUID> {

    List<NotificationDelivery> findByRecipientIdAndStatus(UUID recipientId, NotificationDelivery.DeliveryStatus status);

    @Query("SELECT nd FROM NotificationDelivery nd WHERE nd.tenantId = :tenantId AND nd.recipientId = :recipientId")
    List<NotificationDelivery> findByTenantAndRecipient(@Param("tenantId") UUID tenantId,
                                                         @Param("recipientId") UUID recipientId);
}
