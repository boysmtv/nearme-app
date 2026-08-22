package id.dekat.sharedkernel.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPublisher {

    private static final int BATCH_SIZE = 50;
    private static final int MAX_RETRIES = 5;

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(String aggregateType, String aggregateId,
                        String eventType, String payload, String topic) {
        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(payload)
                .topic(topic)
                .maxRetries(MAX_RETRIES)
                .build();

        outboxRepository.save(event);
        log.info("Outbox event created: type={}, eventType={}, aggregateId={}",
                aggregateType, eventType, aggregateId);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void pollAndPublish() {
        List<OutboxEvent> pendingEvents = outboxRepository
                .findPendingEvents(Instant.now(), BATCH_SIZE);

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Processing {} outbox events", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            processEvent(event);
        }
    }

    @Transactional
    public void processEvent(OutboxEvent event) {
        int updated = outboxRepository.markPublishing(event.getId());
        if (updated == 0) {
            log.debug("Event already being processed: {}", event.getId());
            return;
        }

        try {
            String key = event.getAggregateId() != null ? event.getAggregateId() : UUID.randomUUID().toString();
            String payload = event.getPayload();

            CompletableFuture<SendResult<String, String>> future =
                    kafkaTemplate.send(event.getTopic(), key, payload);

            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    handleFailure(event, ex);
                } else {
                    handleSuccess(event);
                }
            });

        } catch (Exception e) {
            log.error("Failed to publish outbox event: {}", event.getId(), e);
            outboxRepository.markFailed(event.getId());
            event.markFailed(e.getMessage(), event.getMaxRetries());
            outboxRepository.save(event);
        }
    }

    private void handleSuccess(OutboxEvent event) {
        try {
            outboxRepository.markPublished(event.getId());
            log.info("Outbox event published: id={}, eventType={}", event.getId(), event.getEventType());
        } catch (Exception e) {
            log.error("Failed to mark event as published: {}", event.getId(), e);
        }
    }

    private void handleFailure(OutboxEvent event, Throwable ex) {
        log.error("Failed to publish outbox event: id={}, eventType={}", event.getId(), event.getEventType(), ex);
        try {
            event.markFailed(ex.getMessage(), event.getMaxRetries());
            outboxRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to save event failure state: {}", event.getId(), e);
        }
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanupDeadLetters() {
        int moved = outboxRepository.moveToDeadLetter();
        if (moved > 0) {
            log.warn("Moved {} events to dead letter queue", moved);
        }
    }

    public long getPendingCount() {
        return outboxRepository.countByStatus(OutboxEvent.OutboxStatus.PENDING);
    }

    public long getDeadLetterCount() {
        return outboxRepository.countByStatus(OutboxEvent.OutboxStatus.DEAD_LETTER);
    }

    public void retryDeadLetters() {
        List<OutboxEvent> deadLetters = outboxRepository
                .findPendingEvents(Instant.now(), BATCH_SIZE);
        log.info("Retrying {} dead letter events", deadLetters.size());
        for (OutboxEvent event : deadLetters) {
            processEvent(event);
        }
    }
}
