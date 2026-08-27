package id.dekat.audit.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import id.dekat.audit.domain.AuditLog;
import id.dekat.audit.domain.AuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final AuditRepository auditRepository;

    @Transactional
    public AuditLog record(UUID actorId, String action, String resourceType,
                            UUID resourceId, String beforeSnapshot, String afterSnapshot,
                            String reason, String requestId, String ipAddress,
                            String userAgent, AuditLog.AuditResult result) {
        if (actorId == null) {
            throw new IllegalArgumentException("Actor ID is required");
        }
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Action is required");
        }
        if (resourceType == null || resourceType.isBlank()) {
            throw new IllegalArgumentException("Resource type is required");
        }
        if (resourceId == null) {
            throw new IllegalArgumentException("Resource ID is required");
        }

        AuditLog auditLog = AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .beforeSnapshot(beforeSnapshot)
                .afterSnapshot(afterSnapshot)
                .reason(reason)
                .requestId(requestId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .result(result != null ? result : AuditLog.AuditResult.OK)
                .build();

        AuditLog saved = auditRepository.save(auditLog);
        log.info("Audit: actor={} action={} resource={}:{} result={}",
                actorId, action, resourceType, resourceId, saved.getResult());
        return saved;
    }

    @Transactional
    public AuditLog recordSuccess(UUID actorId, String action, String resourceType,
                                   UUID resourceId, String afterSnapshot,
                                   String requestId, String ipAddress) {
        return record(actorId, action, resourceType, resourceId, null, afterSnapshot,
                null, requestId, ipAddress, null, AuditLog.AuditResult.OK);
    }

    @Transactional
    public AuditLog recordFailure(UUID actorId, String action, String resourceType,
                                   UUID resourceId, String reason,
                                   String requestId, String ipAddress) {
        return record(actorId, action, resourceType, resourceId, null, null,
                reason, requestId, ipAddress, null, AuditLog.AuditResult.DENIED);
    }

    @Transactional
    public AuditLog recordWithObject(UUID actorId, String action, String resourceType,
                                      UUID resourceId, Object before, Object after,
                                      String reason, String requestId, String ipAddress) {
        String beforeJson = null;
        String afterJson = null;

        try {
            if (before != null) {
                beforeJson = objectMapper.writeValueAsString(before);
            }
            if (after != null) {
                afterJson = objectMapper.writeValueAsString(after);
            }
        } catch (Exception e) {
            log.warn("Failed to serialize audit object", e);
        }

        return record(actorId, action, resourceType, resourceId,
                beforeJson, afterJson, reason, requestId, ipAddress,
                null, AuditLog.AuditResult.OK);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditTrail(UUID resourceId, String resourceType) {
        return auditRepository.findByResourceTypeAndResourceId(resourceType, resourceId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getActorActivity(UUID actorId, Instant from, Instant to) {
        return auditRepository.findByActorIdAndCreatedAtBetween(actorId, from, to);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentByAction(String action, Instant since) {
        return auditRepository.findByActionSince(action, since);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getByRequestId(String requestId) {
        return auditRepository.findByRequestId(requestId);
    }
}
