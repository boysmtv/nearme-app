package id.dekat.tenant.application;

import id.dekat.tenant.domain.*;
import id.dekat.tenant.web.dto.CreateTenantRequest;
import id.dekat.tenant.web.dto.LocationRequest;
import id.dekat.access.application.AuthorizationService;
import id.dekat.access.domain.RoleRepository;
import id.dekat.access.domain.RoleAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final AuthorizationService authorizationService;
    private final RoleRepository roleRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;

    @Transactional
    public Tenant createTenant(CreateTenantRequest request, UUID ownerId) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? normalizeSlug(request.getSlug())
                : generateUniqueSlug(request.getName());

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .slug(slug)
                .legalName(request.getLegalName())
                .taxId(request.getTaxId())
                .phone(request.getPhone())
                .email(request.getEmail())
                .ownerId(ownerId)
                .status(TenantStatus.ACTIVE)
                .verificationStatus("UNVERIFIED")
                .build();

        Tenant saved = tenantRepository.save(tenant);

        // Assign ROLE_PROVIDER_OWNER to the creating user
        if (ownerId != null) {
            try {
                roleRepository.findByName("ROLE_PROVIDER_OWNER").ifPresent(role -> {
                    if (!roleAssignmentRepository.existsByUserIdAndRoleIdAndTenantId(ownerId, role.getId(), saved.getId())) {
                        authorizationService.assignRole(ownerId, role.getId(), saved.getId(), null, ownerId);
                    }
                });
            } catch (Exception e) {
                // Log but don't fail tenant creation if role assignment fails
            }
        }

        return saved;
    }

    @Transactional
    public Tenant updateTenant(UUID id, CreateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (!"UNVERIFIED".equals(tenant.getVerificationStatus()) && !"REJECTED".equals(tenant.getVerificationStatus())) {
            throw new IllegalStateException("Tenant can only be updated when UNVERIFIED or REJECTED");
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
                .legalName(request.getLegalName())
                .taxId(request.getTaxId())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant submitForReview(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (!"UNVERIFIED".equals(tenant.getVerificationStatus())) {
            throw new IllegalStateException("Only UNVERIFIED tenants can be submitted for review. Current status: " + tenant.getVerificationStatus());
        }

        validateTenantForSubmission(tenant);

        Tenant updated = tenant.toBuilder()
                .verificationStatus("PENDING_REVIEW")
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant approveTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (!"PENDING_REVIEW".equals(tenant.getVerificationStatus()) && !"UNDER_REVIEW".equals(tenant.getVerificationStatus())) {
            throw new IllegalStateException("Only PENDING_REVIEW or UNDER_REVIEW tenants can be approved.");
        }

        Tenant updated = tenant.toBuilder()
                .verificationStatus("VERIFIED")
                .verifiedAt(LocalDateTime.now())
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant rejectTenant(UUID id, String reason) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (!"PENDING_REVIEW".equals(tenant.getVerificationStatus()) && !"UNDER_REVIEW".equals(tenant.getVerificationStatus())) {
            throw new IllegalStateException("Only PENDING_REVIEW or UNDER_REVIEW tenants can be rejected.");
        }

        Tenant updated = tenant.toBuilder()
                .verificationStatus("REJECTED")
                .rejectedAt(LocalDateTime.now())
                .rejectionReason(reason)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant suspendTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != TenantStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE tenants can be suspended.");
        }

        Tenant updated = tenant.toBuilder()
                .status(TenantStatus.SUSPENDED)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Tenant reactivateTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (tenant.getStatus() != TenantStatus.SUSPENDED) {
            throw new IllegalStateException("Only SUSPENDED tenants can be reactivated.");
        }

        Tenant updated = tenant.toBuilder()
                .status(TenantStatus.ACTIVE)
                .build();

        return tenantRepository.save(updated);
    }

    @Transactional
    public Location createLocation(UUID tenantId, LocationRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        if (tenant.getStatus() != TenantStatus.ACTIVE) {
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

    private String normalizeSlug(String slug) {
        String normalized = slug.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (tenantRepository.existsBySlug(normalized)) {
            return generateUniqueSlug(normalized);
        }
        return normalized;
    }

    private void validateTenantForSubmission(Tenant tenant) {
        if (tenant.getName() == null || tenant.getName().isBlank()) {
            throw new IllegalStateException("Tenant name is required for submission");
        }
        if (tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            throw new IllegalStateException("Contact email is required for submission");
        }

        List<Location> locations = locationRepository.findByTenantId(tenant.getId());
        if (locations.isEmpty()) {
            throw new IllegalStateException("At least one location is required for submission");
        }
    }
}
