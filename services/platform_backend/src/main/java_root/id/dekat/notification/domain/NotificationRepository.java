package id.dekat.notification.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationDelivery, UUID> {

    List<NotificationDelivery> findByRecipientIdAndStatus(UUID recipientId, NotificationDelivery.DeliveryStatus status);

    @Query("SELECT nd FROM NotificationDelivery nd WHERE nd.recipientId = :recipientId ORDER BY nd.createdAt DESC")
    List<NotificationDelivery> findByRecipientId(@Param("recipientId") UUID recipientId);

    Page<NotificationDelivery> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    @Query("UPDATE NotificationDelivery nd SET nd.status = 'DELIVERED' WHERE nd.recipientId = :recipientId AND nd.status = 'PENDING'")
    @Modifying
    int markAllRead(@Param("recipientId") UUID recipientId);
}
