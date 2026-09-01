package id.dekat.media.web;

import id.dekat.media.application.MediaService;
import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.staff.domain.StaffRepository;
import id.dekat.tenant.domain.ProviderListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private final MediaRepository mediaRepository;
    @Autowired(required = false)
    private ProviderListingRepository providerListingRepository;
    @Autowired(required = false)
    private StaffRepository staffRepository;

    // ==================== AUTH REQUIRED: UPLOAD ====================
    @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> upload(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "ownerType", required = false) String ownerType,
            @RequestParam(value = "ownerId", required = false) UUID ownerId,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder) {

        UUID userId = resolveUserId(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID tenantId = resolveTenant(tenantHeader, ownerId);
        if (tenantId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tenantId is required"));
        }
        String type = ownerType != null ? ownerType : "provider";
        UUID oid = ownerId != null ? ownerId : tenantId;
        // normalize
        if (!Set.of("provider", "staff", "review").contains(type)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("ownerType must be provider/staff/review"));
        }
        try {
            MediaAsset asset = mediaService.upload(tenantId, type, oid, file, sortOrder);
            Map<String, Object> row = toRow(asset);
            row.put("signedUrl", mediaService.signedUrl(asset, 3600));
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(row, "Upload successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/media/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMedia(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        try {
            MediaAsset asset = mediaService.getById(id);
            Map<String, Object> row = toRow(asset);
            row.put("signedUrl", mediaService.signedUrl(asset, 3600));
            return ResponseEntity.ok(ApiResponse.ok(row));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/provider/media")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listProviderMedia(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantHeader,
            @RequestParam(value = "ownerType", required = false) String ownerType,
            @RequestParam(value = "ownerId", required = false) UUID ownerId) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID tenantId = resolveTenant(tenantHeader, ownerId);
        if (tenantId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tenantId is required"));
        }
        List<MediaAsset> assets;
        if (ownerType != null && ownerId != null) {
            assets = mediaService.listByOwner(tenantId, ownerType, ownerId);
        } else if (ownerType != null) {
            assets = mediaRepository.findByTenantIdAndOwnerTypeAndOwnerIdOrderBySortOrderAscCreatedAtAsc(tenantId, ownerType, tenantId);
            // fallback to all of type
            if (assets.isEmpty()) {
                assets = mediaRepository.findByTenantIdOrderBySortOrderAscCreatedAtAsc(tenantId).stream()
                        .filter(a -> a.getOwnerType().equals(ownerType))
                        .toList();
            }
        } else {
            assets = mediaService.listByTenant(tenantId);
        }
        List<Map<String, Object>> rows = assets.stream().map(a -> {
            Map<String, Object> r = toRow(a);
            r.put("signedUrl", mediaService.signedUrl(a, 3600));
            return r;
        }).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @DeleteMapping("/provider/media/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantHeader,
            @PathVariable UUID id) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        MediaAsset asset = mediaRepository.findById(id).orElse(null);
        if (asset == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Media not found"));
        }
        UUID tenantId = tenantHeader != null ? tenantHeader : asset.getTenantId();
        // optionally verify tenant belongs to provider
        try {
            mediaService.delete(tenantId, id);
            return ResponseEntity.ok(ApiResponse.ok(null, "Deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/provider/media/reorder")
    public ResponseEntity<ApiResponse<Void>> reorder(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantHeader,
            @RequestBody Map<String, List<UUID>> body) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID tenantId = resolveTenant(tenantHeader, null);
        if (tenantId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tenantId is required"));
        }
        List<UUID> orderedIds = body.get("orderedIds");
        if (orderedIds == null) orderedIds = body.get("ids");
        if (orderedIds == null || orderedIds.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("orderedIds is required"));
        }
        try {
            mediaService.reorder(tenantId, orderedIds);
            return ResponseEntity.ok(ApiResponse.ok(null, "Reordered"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== PUBLIC: provider gallery ====================
    @GetMapping("/public/providers/{providerId}/media")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPublicProviderMedia(@PathVariable UUID providerId) {
        List<MediaAsset> assets = mediaService.listByTenantPublic(providerId);
        // filter to provider owner_type primarily but return all for gallery? Spec says from GET /public/providers/{id}/media
        // We return all media_assets for tenant ordered by sortOrder
        List<Map<String, Object>> rows = assets.stream().map(a -> {
            Map<String, Object> r = toRow(a);
            // public signed stub not needed
            return r;
        }).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @GetMapping("/public/staff/{staffId}/media")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPublicStaffMedia(@PathVariable UUID staffId) {
        List<MediaAsset> assets = mediaService.listByOwnerNoTenant("staff", staffId);
        List<Map<String, Object>> rows = assets.stream().map(this::toRow).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @GetMapping("/public/reviews/{reviewId}/media")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPublicReviewMedia(@PathVariable UUID reviewId) {
        List<MediaAsset> assets = mediaService.listByOwnerNoTenant("review", reviewId);
        List<Map<String, Object>> rows = assets.stream().map(this::toRow).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    private Map<String, Object> toRow(MediaAsset a) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", a.getId().toString());
        row.put("tenantId", a.getTenantId().toString());
        row.put("ownerType", a.getOwnerType());
        row.put("ownerId", a.getOwnerId().toString());
        row.put("fileName", a.getFileName());
        row.put("contentType", a.getContentType());
        row.put("fileSize", a.getFileSize());
        row.put("storagePath", a.getStoragePath());
        row.put("url", a.getUrl());
        row.put("sortOrder", a.getSortOrder());
        row.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
        return row;
    }

    private UUID resolveUserId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) return null;
        try { return UUID.fromString(jwt.getSubject()); } catch (Exception e) { return null; }
    }

    private UUID resolveTenant(UUID header, UUID ownerId) {
        if (header != null) return header;
        if (ownerId != null) {
            // if owner is staff, return its tenant
            if (staffRepository != null) {
                try {
                    var staffOpt = staffRepository.findById(ownerId);
                    if (staffOpt.isPresent()) return staffOpt.get().getTenantId();
                } catch (Exception ignored) {}
            }
            if (providerListingRepository != null) {
                try {
                    if (providerListingRepository.existsById(ownerId)) return ownerId;
                } catch (Exception ignored) {}
            }
            return ownerId;
        }
        if (providerListingRepository != null) {
            try {
                return providerListingRepository.findAll().stream().findFirst().map(p -> p.getId()).orElse(null);
            } catch (Exception ignored) {}
        }
        return null;
    }
}
