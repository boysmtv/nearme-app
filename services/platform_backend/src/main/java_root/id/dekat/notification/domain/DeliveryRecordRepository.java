package id.dekat.notification.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRecordRepository extends JpaRepository<DeliveryRecord, UUID> {

    Page<DeliveryRecord> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    Optional<DeliveryRecord> findByIdAndRecipientId(UUID id, UUID recipientId);

    @Modifying
    @Query("""
        UPDATE DeliveryRecord d
        SET d.status = 'DELIVERED', d.deliveredAt = CURRENT_TIMESTAMP
        WHERE d.recipientId = :recipientId AND d.status IN ('PENDING', 'SENT')
    """)
    int markAllRead(@Param("recipientId") UUID recipientId);
}
