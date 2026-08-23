package id.dekat.sharedkernel.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    @Query("""
            SELECT e FROM OutboxEvent e
            WHERE e.status = 'PENDING'
               OR (e.status = 'FAILED' AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= :now))
            ORDER BY e.createdAt ASC
            LIMIT :batchSize
            """)
    List<OutboxEvent> findPendingEvents(Instant now, int batchSize);

    @Modifying
    @Query("UPDATE OutboxEvent e SET e.status = 'PUBLISHING' WHERE e.id = :id AND e.status IN ('PENDING', 'FAILED')")
    int markPublishing(UUID id);

    @Modifying
    @Query("UPDATE OutboxEvent e SET e.status = 'PUBLISHED' WHERE e.id = :id")
    int markPublished(UUID id);

    @Modifying
    @Query("""
            UPDATE OutboxEvent e SET e.status = 'DEAD_LETTER'
            WHERE e.status = 'FAILED' AND e.retryCount >= e.maxRetries
            """)
    int moveToDeadLetter();

    long countByStatus(OutboxEvent.OutboxStatus status);
}
