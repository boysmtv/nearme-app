package id.dekat.support.application;

import id.dekat.support.domain.CaseEvent;
import id.dekat.support.domain.CaseEventRepository;
import id.dekat.support.domain.SupportCase;
import id.dekat.support.domain.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportRepository supportRepository;
    private final CaseEventRepository caseEventRepository;

    @Transactional
    public SupportCase createCase(UUID tenantId, UUID customerId, String subject,
                                   SupportCase.CasePriority priority) {
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Subject is required");
        }
        if (priority == null) {
            priority = SupportCase.CasePriority.MEDIUM;
        }

        SupportCase supportCase = SupportCase.builder()
                .tenantId(tenantId)
                .customerId(customerId)
                .subject(subject)
                .priority(priority)
                .status(SupportCase.CaseStatus.OPEN)
                .build();

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(saved.getId(), customerId, "CREATED",
                "Case created with priority: " + priority);

        return saved;
    }

    @Transactional
    public CaseEvent addEvent(UUID caseId, UUID actorId, String eventType, String body) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        if (supportCase.getStatus() == SupportCase.CaseStatus.CLOSED) {
            throw new IllegalStateException("Cannot add events to a closed case");
        }

        CaseEvent event = CaseEvent.builder()
                .caseId(caseId)
                .actorId(actorId)
                .eventType(eventType)
                .body(body)
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

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, resolverId, "RESOLVE", "Case resolved");

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

        SupportCase.CasePriority newPriority = escalatePriority(supportCase.getPriority());

        supportCase.setStatus(SupportCase.CaseStatus.IN_PROGRESS);
        supportCase.setPriority(newPriority);

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, escalatorId, "ESCALATE",
                "Escalated to priority: " + newPriority + ". Reason: " + reason);

        return saved;
    }

    @Transactional
    public SupportCase assignCase(UUID caseId, UUID assignedTo, UUID assignerId) {
        SupportCase supportCase = supportRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        supportCase.setAssignedTo(assignedTo);
        supportCase.setStatus(SupportCase.CaseStatus.IN_PROGRESS);

        SupportCase saved = supportRepository.save(supportCase);

        addEvent(caseId, assignerId, "ASSIGN",
                "Case assigned to: " + assignedTo);

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

        addEvent(caseId, closerId, "CLOSE", "Case closed");

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
    public List<SupportCase> getCasesByAssignee(UUID assignedTo) {
        return supportRepository.findByAssignedTo(assignedTo);
    }

    private SupportCase.CasePriority escalatePriority(SupportCase.CasePriority current) {
        return switch (current) {
            case LOW -> SupportCase.CasePriority.MEDIUM;
            case MEDIUM -> SupportCase.CasePriority.HIGH;
            case HIGH, URGENT -> SupportCase.CasePriority.URGENT;
        };
    }
}
