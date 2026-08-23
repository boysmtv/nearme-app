package id.dekat.support.application;

import id.dekat.support.domain.CaseEvent;
import id.dekat.support.domain.CaseEventRepository;
import id.dekat.support.domain.SupportCase;
import id.dekat.support.domain.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private static final int SLA_LOW_HOURS = 72;
    private static final int SLA_MEDIUM_HOURS = 48;
    private static final int SLA_HIGH_HOURS = 24;
    private static final int SLA_URGENT_HOURS = 8;

    private final SupportRepository supportRepository;
    private final CaseEventRepository caseEventRepository;

    @Transactional
    public SupportCase createCase(UUID tenantId, UUID bookingId, UUID reporterId,
                                   SupportCase.CaseType caseType, SupportCase.CaseSeverity severity) {
        if (caseType == null) {
            throw new IllegalArgumentException("Case type is required");
        }
        if (severity == null) {
            severity = SupportCase.CaseSeverity.MEDIUM;
        }

        int slaHours = getSlaHours(severity);

        SupportCase supportCase = SupportCase.builder()
                .tenantId(tenantId)
                .bookingId(bookingId)
                .reporterId(reporterId)
                .caseType(caseType)
                .severity(severity)
                .status(SupportCase.CaseStatus.OPEN)
                .slaDeadline(Instant.now().plus(slaHours, ChronoUnit.HOURS))
                .build();

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(saved.getId(), reporterId, CaseEvent.EventAction.CREATED,
                "Case created with severity: " + severity + ", SLA: " + slaHours + "h");

        return saved;
    }

    @Transactional
    public CaseEvent addEvent(UUID caseId, UUID actorId, CaseEvent.EventAction action, String details) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        if (supportCase.getStatus() == SupportCase.CaseStatus.CLOSED) {
            throw new IllegalStateException("Cannot add events to a closed case");
        }

        CaseEvent event = CaseEvent.builder()
                .caseId(caseId)
                .actorId(actorId)
                .action(action)
                .details(details)
                .build();

        return caseEventRepository.save(event);
    }

    @Transactional
    public SupportCase resolveCase(UUID caseId, UUID resolverId) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        if (supportCase.getStatus() == SupportCase.CaseStatus.CLOSED) {
            throw new IllegalStateException("Cannot resolve a closed case");
        }
        if (supportCase.getStatus() == SupportCase.CaseStatus.RESOLVED) {
            throw new IllegalStateException("Case is already resolved");
        }

        supportCase.setStatus(SupportCase.CaseStatus.RESOLVED);
        supportCase.setResolvedAt(Instant.now());

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, resolverId, CaseEvent.EventAction.RESOLVE, "Case resolved");

        return saved;
    }

    @Transactional
    public SupportCase escalateCase(UUID caseId, UUID escalatorId, String reason) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        if (supportCase.getStatus() == SupportCase.CaseStatus.RESOLVED
                || supportCase.getStatus() == SupportCase.CaseStatus.CLOSED) {
            throw new IllegalStateException("Cannot escalate a resolved or closed case");
        }

        SupportCase.CaseSeverity newSeverity = escalateSeverity(supportCase.getSeverity());
        int newSlaHours = getSlaHours(newSeverity);

        supportCase.setStatus(SupportCase.CaseStatus.ESCALATED);
        supportCase.setSeverity(newSeverity);
        supportCase.setSlaDeadline(Instant.now().plus(newSlaHours, ChronoUnit.HOURS));

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, escalatorId, CaseEvent.EventAction.ESCALATE,
                "Escalated to severity: " + newSeverity + ". Reason: " + reason);

        return saved;
    }

    @Transactional
    public SupportCase assignCase(UUID caseId, UUID ownerId, UUID assignerId) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        supportCase.setOwnerId(ownerId);
        supportCase.setStatus(SupportCase.CaseStatus.IN_PROGRESS);

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, assignerId, CaseEvent.EventAction.ASSIGN,
                "Case assigned to owner: " + ownerId);

        return saved;
    }

    @Transactional
    public SupportCase closeCase(UUID caseId, UUID closerId) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        if (supportCase.getStatus() != SupportCase.CaseStatus.RESOLVED) {
            throw new IllegalStateException("Only resolved cases can be closed");
        }

        supportCase.setStatus(SupportCase.CaseStatus.CLOSED);

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, closerId, CaseEvent.EventAction.CLOSE, "Case closed");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CaseEvent> getCaseEvents(UUID caseId) {
        return caseEventRepository.findByCaseIdOrderByCreatedAtAsc(caseId);
    }

    @Transactional(readOnly = true)
    public List<SupportCase> getOpenCasesByTenant(UUID tenantId) {
        return supportRepository.findByTenantIdAndStatus(tenantId, SupportCase.CaseStatus.OPEN);
    }

    @Transactional(readOnly = true)
    public List<SupportCase> getCasesByOwner(UUID ownerId) {
        return supportRepository.findByOwnerIdAndStatus(ownerId, SupportCase.CaseStatus.IN_PROGRESS);
    }

    private int getSlaHours(SupportCase.CaseSeverity severity) {
        return switch (severity) {
            case LOW -> SLA_LOW_HOURS;
            case MEDIUM -> SLA_MEDIUM_HOURS;
            case HIGH -> SLA_HIGH_HOURS;
            case URGENT -> SLA_URGENT_HOURS;
        };
    }

    private SupportCase.CaseSeverity escalateSeverity(SupportCase.CaseSeverity current) {
        return switch (current) {
            case LOW -> SupportCase.CaseSeverity.MEDIUM;
            case MEDIUM -> SupportCase.CaseSeverity.HIGH;
            case HIGH, URGENT -> SupportCase.CaseSeverity.URGENT;
        };
    }
}
