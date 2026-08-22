package id.dekat.sharedkernel.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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
        event.setAggregateId(aggregateId);
        event.setEventType(eventType);
        try {
            event.setPayload(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize outbox event payload", e);
        }
        event.setStatus(OutboxStatus.PENDING);
        outboxRepository.save(event);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pending = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        for (OutboxEvent event : pending) {
            try {
                outboxRepository.updateStatus(event.getId(), OutboxStatus.PROCESSING, Instant.now());
                kafkaTemplate.send(event.getEventType(), event.getAggregateId(), event.getPayload()).get();
                outboxRepository.updateStatus(event.getId(), OutboxStatus.PUBLISHED, Instant.now());
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
                if (event.canRetry()) {
                    outboxRepository.incrementRetryAndMarkFailed(event.getId());
                } else {
                    outboxRepository.updateStatus(event.getId(), OutboxStatus.FAILED, Instant.now());
                }
            }
        }
    }
}
