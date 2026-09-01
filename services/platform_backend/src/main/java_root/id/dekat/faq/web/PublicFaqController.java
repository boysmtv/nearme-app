package id.dekat.faq.web;

import id.dekat.faq.application.FaqService;
import id.dekat.faq.application.PolicyService;
import id.dekat.faq.domain.Faq;
import id.dekat.faq.domain.Policy;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicFaqController {

    private final FaqService faqService;
    private final PolicyService policyService;

    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listFaqs(
            @RequestParam(value = "tenantId", required = false) UUID tenantId,
            @RequestParam(value = "category", required = false) String category) {
        List<Faq> faqs = faqService.listPublic(tenantId, category);
        List<Map<String, Object>> data = faqs.stream().map(this::toFaqRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listPolicies(
            @RequestParam(value = "tenantId", required = false) UUID tenantId,
            @RequestParam(value = "type", required = false) String type) {
        List<Policy> policies = policyService.listPublic(tenantId, type);
        List<Map<String, Object>> data = policies.stream().map(this::toPolicyRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFaq(@PathVariable UUID id) {
        Faq f = faqService.get(id);
        return ResponseEntity.ok(ApiResponse.ok(toFaqRow(f)));
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPolicy(@PathVariable UUID id) {
        Policy p = policyService.get(id);
        return ResponseEntity.ok(ApiResponse.ok(toPolicyRow(p)));
    }

    private Map<String, Object> toFaqRow(Faq f) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", f.getId().toString());
        row.put("tenantId", f.getTenantId() != null ? f.getTenantId().toString() : null);
        row.put("question", f.getQuestion());
        row.put("answer", f.getAnswer());
        row.put("category", f.getCategory());
        row.put("sortOrder", f.getSortOrder());
        row.put("isActive", f.getIsActive());
        row.put("createdAt", f.getCreatedAt());
        row.put("updatedAt", f.getUpdatedAt());
        return row;
    }

    private Map<String, Object> toPolicyRow(Policy p) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", p.getId().toString());
        row.put("tenantId", p.getTenantId() != null ? p.getTenantId().toString() : null);
        row.put("title", p.getTitle());
        row.put("body", p.getBody());
        row.put("type", p.getType());
        row.put("version", p.getVersion());
        row.put("isActive", p.getIsActive());
        row.put("createdAt", p.getCreatedAt());
        row.put("updatedAt", p.getUpdatedAt());
        return row;
    }
}
