package id.dekat.faq.application;

import id.dekat.common.NotFoundException;
import id.dekat.faq.domain.Faq;
import id.dekat.faq.domain.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    @Transactional(readOnly = true)
    public List<Faq> listPublic(UUID tenantId, String category) {
        if (tenantId != null) {
            if (category != null && !category.isBlank()) {
                return faqRepository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(tenantId).stream()
                        .filter(f -> category.equalsIgnoreCase(f.getCategory()))
                        .toList();
            }
            // global + tenant specific: show tenant faqs plus global (null tenant)
            List<Faq> tenantFaqs = faqRepository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(tenantId);
            List<Faq> global = faqRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                    .filter(f -> f.getTenantId() == null).toList();
            // merge, tenant first then global
            java.util.ArrayList<Faq> merged = new java.util.ArrayList<>(tenantFaqs);
            merged.addAll(global);
            // if tenant has no faqs, just return global
            return merged.isEmpty() ? global : merged;
        }
        if (category != null && !category.isBlank()) {
            return faqRepository.findByCategoryAndIsActiveTrueOrderBySortOrderAsc(category);
        }
        return faqRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Faq> listAllForProvider(UUID tenantId) {
        if (tenantId == null) return faqRepository.findAll();
        return faqRepository.findByTenantIdOrderBySortOrderAsc(tenantId);
    }

    @Transactional
    public Faq create(UUID tenantId, String question, String answer, String category, Integer sortOrder) {
        if (question == null || question.isBlank()) throw new IllegalArgumentException("question is required");
        if (answer == null || answer.isBlank()) throw new IllegalArgumentException("answer is required");
        Faq faq = new Faq(tenantId, question, answer, category, sortOrder);
        return faqRepository.save(faq);
    }

    @Transactional
    public Faq update(UUID id, String question, String answer, String category, Integer sortOrder, Boolean isActive) {
        Faq faq = faqRepository.findById(id).orElseThrow(() -> new NotFoundException("Faq not found: " + id));
        if (question != null) faq.setQuestion(question);
        if (answer != null) faq.setAnswer(answer);
        if (category != null) faq.setCategory(category);
        if (sortOrder != null) faq.setSortOrder(sortOrder);
        if (isActive != null) faq.setIsActive(isActive);
        return faqRepository.save(faq);
    }

    @Transactional
    public void delete(UUID id) {
        Faq faq = faqRepository.findById(id).orElseThrow(() -> new NotFoundException("Faq not found: " + id));
        faqRepository.delete(faq);
    }

    @Transactional(readOnly = true)
    public Faq get(UUID id) {
        return faqRepository.findById(id).orElseThrow(() -> new NotFoundException("Faq not found: " + id));
    }
}
