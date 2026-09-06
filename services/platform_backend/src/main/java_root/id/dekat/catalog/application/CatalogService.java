package id.dekat.catalog.application;

import id.dekat.catalog.domain.*;
import id.dekat.catalog.web.dto.ServiceRequest;
import id.dekat.catalog.web.dto.ServiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceVariantRepository variantRepository;
    private final ServiceAddonRepository addonRepository;

    @Transactional
    @CacheEvict(value = "provider-services", key = "#tenantId")
    public ServiceItem createService(UUID tenantId, ServiceRequest request) {
        String slug = generateUniqueSlug(request.getSlug(), tenantId);

        ServiceItem service = ServiceItem.builder()
                .tenantId(tenantId)
                .categoryId(request.getCategoryId())
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .priceType(request.getPriceType())
                .basePriceAmount(request.getBasePriceAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "IDR")
                .depositAmount(request.getDepositAmount())
                .taxRate(request.getTaxRate())
                .bufferBeforeMinutes(request.getBufferBeforeMinutes())
                .bufferAfterMinutes(request.getBufferAfterMinutes())
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE")
                .status("DRAFT")
                .build();

        return serviceRepository.save(service);
    }

    @Transactional
    @CacheEvict(value = "provider-services", key = "#tenantId")
    public ServiceItem updateService(UUID id, ServiceRequest request) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));

        if ("ACTIVE".equals(service.getStatus()) || "PUBLIC".equals(service.getVisibility())) {
            // Service is live - create a new draft version or restrict edits
            // For now, allow edits only to certain fields
        }

        String newSlug = service.getSlug();
        if (request.getSlug() != null && !request.getSlug().equals(service.getSlug())) {
            newSlug = generateUniqueSlug(request.getSlug(), service.getTenantId());
        }

        ServiceItem updated = service.toBuilder()
                .categoryId(request.getCategoryId() != null ? request.getCategoryId() : service.getCategoryId())
                .name(request.getName() != null ? request.getName() : service.getName())
                .slug(newSlug)
                .description(request.getDescription() != null ? request.getDescription() : service.getDescription())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : service.getDurationMinutes())
                .priceType(request.getPriceType() != null ? request.getPriceType() : service.getPriceType())
                .basePriceAmount(request.getBasePriceAmount() != null ? request.getBasePriceAmount() : service.getBasePriceAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : service.getCurrency())
                .depositAmount(request.getDepositAmount() != null ? request.getDepositAmount() : service.getDepositAmount())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : service.getTaxRate())
                .bufferBeforeMinutes(request.getBufferBeforeMinutes() != null ? request.getBufferBeforeMinutes() : service.getBufferBeforeMinutes())
                .bufferAfterMinutes(request.getBufferAfterMinutes() != null ? request.getBufferAfterMinutes() : service.getBufferAfterMinutes())
                .visibility(request.getVisibility() != null ? request.getVisibility() : service.getVisibility())
                .build();

        return serviceRepository.save(updated);
    }

    @Transactional
    public ServiceVariant createVariant(UUID serviceId, String name, BigDecimal priceAmount,
                                         Integer durationMinutes, String description) {
        serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + serviceId));

        ServiceVariant variant = ServiceVariant.builder()
                .serviceId(serviceId)
                .name(name)
                .priceAmount(priceAmount)
                .durationMinutes(durationMinutes)
                .description(description)
                .build();

        return variantRepository.save(variant);
    }

    @Transactional
    public ServiceAddon createAddon(UUID serviceId, String name, BigDecimal priceAmount,
                                     Integer durationMinutes, Integer maxQuantity, Boolean isRequired) {
        serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + serviceId));

        ServiceAddon addon = ServiceAddon.builder()
                .serviceId(serviceId)
                .name(name)
                .priceAmount(priceAmount)
                .durationMinutes(durationMinutes)
                .maxQuantity(maxQuantity)
                .isRequired(isRequired != null ? isRequired : false)
                .build();

        return addonRepository.save(addon);
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceWithPricing(UUID id) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));

        List<ServiceVariant> variants = variantRepository.findByServiceId(id);
        List<ServiceAddon> addons = addonRepository.findByServiceId(id);

        ServiceResponse response = mapToResponse(service);
        response.setVariants(variants);
        response.setAddons(addons);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicesByTenant(UUID tenantId, String status, String visibility) {
        List<ServiceItem> services;
        if (status != null && visibility != null) {
            services = serviceRepository.findByTenantId(tenantId).stream()
                    .filter(s -> s.getStatus().equals(status) && s.getVisibility().equals(visibility))
                    .collect(Collectors.toList());
        } else if (status != null) {
            services = serviceRepository.findByTenantIdAndStatus(tenantId, status);
        } else if (visibility != null) {
            services = serviceRepository.findByTenantIdAndVisibility(tenantId, visibility);
        } else {
            services = serviceRepository.findByTenantId(tenantId);
        }

        return services.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "provider-services", key = "#tenantId")
    public List<ServiceResponse> getPublicServicesByTenant(UUID tenantId) {
        return serviceRepository.findByTenantIdAndVisibility(tenantId, "PUBLIC").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "provider-services", key = "#result.tenantId")
    public ServiceItem publishService(UUID id) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));

        if ("ACTIVE".equals(service.getStatus()) && "PUBLIC".equals(service.getVisibility())) {
            throw new IllegalStateException("Service is already published");
        }

        validateServiceForPublishing(service);

        ServiceItem updated = service.toBuilder()
                .status("ACTIVE")
                .visibility("PUBLIC")
                .build();

        return serviceRepository.save(updated);
    }

    @Transactional
    @CacheEvict(value = "provider-services", key = "#result.tenantId")
    public ServiceItem unpublishService(UUID id) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));

        ServiceItem updated = service.toBuilder()
                .status("DRAFT")
                .visibility("PRIVATE")
                .build();

        return serviceRepository.save(updated);
    }

    private void validateServiceForPublishing(ServiceItem service) {
        if (service.getName() == null || service.getName().isBlank()) {
            throw new IllegalStateException("Service name is required for publishing");
        }
        if (service.getDurationMinutes() == null || service.getDurationMinutes() <= 0) {
            throw new IllegalStateException("Valid duration is required for publishing");
        }
        if (service.getPriceType() == null) {
            throw new IllegalStateException("Price type is required for publishing");
        }
        if (service.getPriceType() != PriceType.FREE && service.getPriceType() != PriceType.QUOTE_REQUIRED) {
            if (service.getBasePriceAmount() == null || service.getBasePriceAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException("Valid price is required for publishing");
            }
        }
    }

    private String generateUniqueSlug(String baseSlug, UUID tenantId) {
        String slug = Normalizer.normalize(baseSlug, Normalizer.Form.NFD)
                .replaceAll("[^\\p{L}\\p{Nd}]+", "-")
                .toLowerCase(Locale.ROOT)
                .replaceAll("^-|-$", "");

        // Ensure slug is unique within tenant context
        int counter = 0;
        String candidateSlug = slug;
        while (serviceRepository.existsBySlug(candidateSlug)) {
            counter++;
            candidateSlug = slug + "-" + counter;
        }
        return candidateSlug;
    }

    private ServiceResponse mapToResponse(ServiceItem service) {
        ServiceResponse response = new ServiceResponse();
        response.setId(service.getId());
        response.setTenantId(service.getTenantId());
        response.setCategoryId(service.getCategoryId());
        response.setName(service.getName());
        response.setSlug(service.getSlug());
        response.setDescription(service.getDescription());
        response.setDurationMinutes(service.getDurationMinutes());
        response.setPriceType(service.getPriceType());
        response.setBasePriceAmount(service.getBasePriceAmount());
        response.setCurrency(service.getCurrency());
        response.setDepositAmount(service.getDepositAmount());
        response.setTaxRate(service.getTaxRate());
        response.setBufferBeforeMinutes(service.getBufferBeforeMinutes());
        response.setBufferAfterMinutes(service.getBufferAfterMinutes());
        response.setVisibility(service.getVisibility());
        response.setStatus(service.getStatus());
        response.setCreatedAt(service.getCreatedAt());
        response.setUpdatedAt(service.getUpdatedAt());
        return response;
    }
}
