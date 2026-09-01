package id.dekat.faq.application;

import id.dekat.faq.domain.Faq;
import id.dekat.faq.domain.FaqRepository;
import id.dekat.faq.domain.Policy;
import id.dekat.faq.domain.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Faq & Policy Service - Bundle B")
class FaqServiceTest {

    @Mock private FaqRepository faqRepository;
    @Mock private PolicyRepository policyRepository;

    private FaqService faqService;
    private PolicyService policyService;

    @BeforeEach
    void setUp() {
        faqService = new FaqService(faqRepository);
        policyService = new PolicyService(policyRepository);
    }

    @Test
    @DisplayName("listPublic faqs without tenant returns global active")
    void faq_listPublic_global() {
        Faq global = new Faq(null, "Q1", "A1", "booking", 1);
        when(faqRepository.findByIsActiveTrueOrderBySortOrderAsc()).thenReturn(List.of(global));
        List<Faq> result = faqService.listPublic(null, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuestion()).isEqualTo("Q1");
    }

    @Test
    @DisplayName("listPublic with tenantId merges tenant + global")
    void faq_listPublic_tenant() {
        UUID tenantId = UUID.randomUUID();
        Faq tenantFaq = new Faq(tenantId, "QT", "AT", "booking", 1);
        Faq global = new Faq(null, "QG", "AG", "booking", 2);
        when(faqRepository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(tenantId)).thenReturn(List.of(tenantFaq));
        when(faqRepository.findByIsActiveTrueOrderBySortOrderAsc()).thenReturn(List.of(global));
        List<Faq> result = faqService.listPublic(tenantId, null);
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("create faq validation")
    void faq_create_validation() {
        assertThatThrownBy(() -> faqService.create(UUID.randomUUID(), "", "ans", "booking", 1))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("question");
        assertThatThrownBy(() -> faqService.create(UUID.randomUUID(), "q", "", "booking", 1))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("answer");
    }

    @Test
    @DisplayName("create and update faq")
    void faq_create_update() {
        UUID tenantId = UUID.randomUUID();
        Faq saved = new Faq(tenantId, "Q", "A", "cat", 1);
        when(faqRepository.save(any(Faq.class))).thenAnswer(i -> i.getArgument(0));
        Faq created = faqService.create(tenantId, "Q", "A", "cat", 1);
        assertThat(created.getQuestion()).isEqualTo("Q");

        UUID id = UUID.randomUUID();
        Faq existing = new Faq(tenantId, "Old", "OldA", "cat", 1);
        when(faqRepository.findById(id)).thenReturn(Optional.of(existing));
        when(faqRepository.save(any(Faq.class))).thenAnswer(i -> i.getArgument(0));
        Faq updated = faqService.update(id, "NewQ", null, null, null, null);
        assertThat(updated.getQuestion()).isEqualTo("NewQ");
    }

    @Test
    @DisplayName("delete faq not found throws")
    void faq_delete_notFound() {
        when(faqRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> faqService.delete(UUID.randomUUID()))
                .isInstanceOf(id.dekat.common.NotFoundException.class);
    }

    @Test
    @DisplayName("policy listPublic with tenant fallback global")
    void policy_listPublic() {
        Policy global = new Policy(null, "Title", "Body", "cancellation", 1);
        when(policyRepository.findByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(any())).thenReturn(List.of());
        when(policyRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(global));
        List<Policy> result = policyService.listPublic(UUID.randomUUID(), null);
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("policy create validation")
    void policy_create_validation() {
        assertThatThrownBy(() -> policyService.create(null, "", "body", "cancellation", 1))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> policyService.create(null, "t", "", "cancellation", 1))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> policyService.create(null, "t", "b", "", 1))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
