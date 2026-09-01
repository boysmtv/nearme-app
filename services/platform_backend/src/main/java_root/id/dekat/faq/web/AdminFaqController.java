package id.dekat.faq.web;

import id.dekat.faq.application.FaqService;
import id.dekat.faq.application.PolicyService;
import id.dekat.faq.domain.Faq;
import id.dekat.faq.domain.Policy;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqService faqService;
    private final PolicyService policyService;

    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listFaqs(
            @RequestParam(value = "tenantId", required = false) UUID tenantId) {
        List<Faq> faqs = faqService.listAllForProvider(tenantId);
        List<Map<String, Object>> data = faqs.stream().map(this::toFaqRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/faqs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createFaq(@RequestBody Map<String, Object> body) {
        UUID tenantId = parseUuid(body.get("tenantId"));
        String question = (String) body.get("question");
        String answer = (String) body.get("answer");
        String category = (String) body.get("category");
        Integer sortOrder = body.get("sortOrder") instanceof Number ? ((Number) body.get("sortOrder")).intValue() : null;
        Faq faq = faqService.create(tenantId, question, answer, category, sortOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toFaqRow(faq), "FAQ created"));
    }

    @PutMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateFaq(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String question = (String) body.get("question");
        String answer = (String) body.get("answer");
        String category = (String) body.get("category");
        Integer sortOrder = body.get("sortOrder") instanceof Number ? ((Number) body.get("sortOrder")).intValue() : null;
        Boolean isActive = body.get("isActive") instanceof Boolean ? (Boolean) body.get("isActive") : null;
        Faq faq = faqService.update(id, question, answer, category, sortOrder, isActive);
        return ResponseEntity.ok(ApiResponse.ok(toFaqRow(faq), "FAQ updated"));
    }

    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable UUID id) {
        faqService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "FAQ deleted"));
    }

    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listPolicies(
            @RequestParam(value = "tenantId", required = false) UUID tenantId) {
        List<Policy> list = policyService.listAllForProvider(tenantId);
        List<Map<String, Object>> data = list.stream().map(this::toPolicyRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/policies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPolicy(@RequestBody Map<String, Object> body) {
        UUID tenantId = parseUuid(body.get("tenantId"));
        String title = (String) body.get("title");
        String content = (String) body.getOrDefault("body", body.get("content"));
        String type = (String) body.get("type");
        Integer version = body.get("version") instanceof Number ? ((Number) body.get("version")).intValue() : null;
        Policy p = policyService.create(tenantId, title, content, type != null ? type : "general", version);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toPolicyRow(p), "Policy created"));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePolicy(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        String content = (String) body.getOrDefault("body", body.get("content"));
        String type = (String) body.get("type");
        Integer version = body.get("version") instanceof Number ? ((Number) body.get("version")).intValue() : null;
        Boolean isActive = body.get("isActive") instanceof Boolean ? (Boolean) body.get("isActive") : null;
        Policy p = policyService.update(id, title, content, type, version, isActive);
        return ResponseEntity.ok(ApiResponse.ok(toPolicyRow(p), "Policy updated"));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable UUID id) {
        policyService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Policy deleted"));
    }

    private UUID parseUuid(Object v) {
        if (v == null) return null;
        try { return UUID.fromString(v.toString()); } catch (Exception e) { return null; }
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
        return row;
    }
}
