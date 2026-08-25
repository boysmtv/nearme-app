package id.dekat.sharedkernel.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPublisher {

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public void publish(String aggregateType, String aggregateId, String eventType, Object payload) {
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType(aggregateType);
        event.setAggregateId(UUID.fromString(aggregateId));
        event.setEventType(eventType);
        try {
            event.setPayload(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize outbox event payload", e);
        }
        outboxRepository.save(event);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pending = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(event.getEventType(), event.getAggregateId().toString(), event.getPayload()).get();
                outboxRepository.updateStatus(event.getId(), OutboxStatus.PUBLISHED, Instant.now());
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
                outboxRepository.updateStatus(event.getId(), OutboxStatus.FAILED, Instant.now());
            }
        }
    }
}
