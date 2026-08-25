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

    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status);

    @Modifying
    @Query("UPDATE OutboxEvent o SET o.status = :status, o.processedAt = :processedAt WHERE o.id = :id")
    void updateStatus(UUID id, OutboxStatus status, Instant processedAt);

    long countByStatus(OutboxStatus status);
}
