package id.dekat.faq.application;

import id.dekat.common.NotFoundException;
import id.dekat.faq.domain.Policy;
import id.dekat.faq.domain.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public List<Policy> listPublic(UUID tenantId, String type) {
        if (tenantId != null) {
            List<Policy> list = policyRepository.findByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId);
            if (!list.isEmpty()) return list;
            // fallback to global
        }
        if (type != null && !type.isBlank()) {
            return policyRepository.findByTypeAndIsActiveTrueOrderByVersionDesc(type);
        }
        return policyRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Policy> listAllForProvider(UUID tenantId) {
        if (tenantId == null) return policyRepository.findAll();
        return policyRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public Policy create(UUID tenantId, String title, String body, String type, Integer version) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("title is required");
        if (body == null || body.isBlank()) throw new IllegalArgumentException("body is required");
        if (type == null || type.isBlank()) throw new IllegalArgumentException("type is required");
        Policy p = new Policy(tenantId, title, body, type, version);
        return policyRepository.save(p);
    }

    @Transactional
    public Policy update(UUID id, String title, String body, String type, Integer version, Boolean isActive) {
        Policy p = policyRepository.findById(id).orElseThrow(() -> new NotFoundException("Policy not found: " + id));
        if (title != null) p.setTitle(title);
        if (body != null) p.setBody(body);
        if (type != null) p.setType(type);
        if (version != null) p.setVersion(version);
        if (isActive != null) p.setIsActive(isActive);
        return policyRepository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        Policy p = policyRepository.findById(id).orElseThrow(() -> new NotFoundException("Policy not found: " + id));
        policyRepository.delete(p);
    }

    @Transactional(readOnly = true)
    public Policy get(UUID id) {
        return policyRepository.findById(id).orElseThrow(() -> new NotFoundException("Policy not found: " + id));
    }
}
