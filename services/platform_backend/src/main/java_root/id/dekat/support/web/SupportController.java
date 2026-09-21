package id.dekat.support.web;

import id.dekat.support.application.SupportService;
import id.dekat.support.domain.CaseEvent;
import id.dekat.support.domain.SupportCase;
import id.dekat.support.domain.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/support/cases")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final SupportRepository supportRepository;

    @PostMapping
    public ResponseEntity<SupportCase> createCase(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateCaseRequest request) {
        SupportCase supportCase = supportService.createCase(
                tenantId, userId, request.subject(), request.priority());
        return ResponseEntity.status(HttpStatus.CREATED).body(supportCase);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportCase> getCase(@PathVariable UUID id) {
        return supportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<CaseEvent>> getCaseEvents(@PathVariable UUID id) {
        List<CaseEvent> events = supportService.getCaseEvents(id);
        return ResponseEntity.ok(events);
    }

    public record CreateCaseRequest(
            String subject,
            SupportCase.CasePriority priority
    ) {}
}
