package id.dekat.tenant.application;

import id.dekat.tenant.domain.*;
import id.dekat.tenant.web.dto.CreateTenantRequest;
import id.dekat.tenant.web.dto.LocationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    @Transactional
    public Tenant createTenant(CreateTenantRequest request) {
        String slug = generateUniqueSlug(request.getName());

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .slug(slug)
                .category(request.getCategory())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .status(VerificationStatus.DRAFT)
                .build();

        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenant(UUID id, CreateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.DRAFT && tenant.getStatus() != VerificationStatus.REJECTED) {
            throw new IllegalStateException("Tenant can only be updated in DRAFT or REJECTED status");
        }

        String newSlug = tenant.getSlug();
        if (!request.getName().equals(tenant.getName())) {
            newSlug = generateUniqueSlug(request.getName());
            if (tenantRepository.existsBySlug(newSlug) && !newSlug.equals(tenant.getSlug())) {
                throw new IllegalArgumentException("Slug already exists: " + newSlug);
            }
        }

        Tenant updated = tenant.toBuilder()
                .name(request.getName())
                .slug(newSlug)
                .category(request.getCategory())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant submitForReview(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT tenants can be submitted for review. Current status: " + tenant.getStatus());
        }

        validateTenantForSubmission(tenant);

        Tenant updated = tenant.toBuilder()
                .status(VerificationStatus.SUBMITTED)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant approveTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.SUBMITTED && tenant.getStatus() != VerificationStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only SUBMITTED or UNDER_REVIEW tenants can be approved. Current status: " + tenant.getStatus());
        }

        Tenant updated = tenant.toBuilder()
                .status(VerificationStatus.APPROVED)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant rejectTenant(UUID id, String reason) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.SUBMITTED && tenant.getStatus() != VerificationStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only SUBMITTED or UNDER_REVIEW tenants can be rejected. Current status: " + tenant.getStatus());
        }

        Tenant updated = tenant.toBuilder()
                .status(VerificationStatus.REJECTED)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant suspendTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED tenants can be suspended. Current status: " + tenant.getStatus());
        }

        Tenant updated = tenant.toBuilder()
                .status(VerificationStatus.SUSPENDED)
                .build();

        Tenant saved = tenantRepository.save(updated);

        // TODO: Notify provider about suspension via NotificationService
        return saved;
    }

    @Transactional
    public Tenant reactivateTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != VerificationStatus.SUSPENDED) {
            throw new IllegalStateException("Only SUSPENDED tenants can be reactivated. Current status: " + tenant.getStatus());
        }

        Tenant updated = tenant.toBuilder()
                .status(VerificationStatus.APPROVED)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Location createLocation(UUID tenantId, LocationRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        if (tenant.getStatus() != VerificationStatus.APPROVED && tenant.getStatus() != VerificationStatus.DRAFT) {
            throw new IllegalStateException("Cannot add location to tenant in status: " + tenant.getStatus());
        }

        Location location = Location.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Jakarta")
                .phone(request.getPhone())
                .serviceModes(request.getServiceModes())
                .operatingHours(request.getOperatingHours())
                .status("ACTIVE")
                .build();

        return locationRepository.save(location);
    }

    @Transactional
    public Location updateLocation(UUID locationId, LocationRequest request) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found: " + locationId));

        Location updated = location.toBuilder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timezone(request.getTimezone())
                .phone(request.getPhone())
                .serviceModes(request.getServiceModes())
                .operatingHours(request.getOperatingHours())
                .build();

        return locationRepository.save(updated);
    }

    @Transactional(readOnly = true)
    public Tenant getTenantBySlug(String slug) {
        return tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Location> getLocationsByTenantId(UUID tenantId) {
        return locationRepository.findByTenantId(tenantId);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{L}\\p{Nd}]+", "-")
                .toLowerCase(Locale.ROOT)
                .replaceAll("^-|-$", "");

        if (tenantRepository.existsBySlug(baseSlug)) {
            String slug = baseSlug;
            int counter = 1;
            while (tenantRepository.existsBySlug(slug)) {
                slug = baseSlug + "-" + counter;
                counter++;
            }
            return slug;
        }

        return baseSlug;
    }

    private void validateTenantForSubmission(Tenant tenant) {
        if (tenant.getName() == null || tenant.getName().isBlank()) {
            throw new IllegalStateException("Tenant name is required for submission");
        }
        if (tenant.getCategory() == null || tenant.getCategory().isBlank()) {
            throw new IllegalStateException("Tenant category is required for submission");
        }
        if (tenant.getContactEmail() == null || tenant.getContactEmail().isBlank()) {
            throw new IllegalStateException("Contact email is required for submission");
        }

        List<Location> locations = locationRepository.findByTenantId(tenant.getId());
        if (locations.isEmpty()) {
            throw new IllegalStateException("At least one location is required for submission");
        }
    }
}
