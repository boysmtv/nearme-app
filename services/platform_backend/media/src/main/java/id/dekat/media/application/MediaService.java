package id.dekat.media.application;

import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;

    @Value("${dekat.storage.base-path:./uploads}")
    private String basePath;

    @Value("${dekat.storage.allowed-types:image/jpeg,image/png,image/webp}")
    private String allowedTypesConfig;

    @Value("${dekat.storage.max-size:10MB}")
    private String maxSizeConfig;

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;

    @Transactional
    public MediaAsset upload(UUID tenantId, String ownerType, UUID ownerId, MultipartFile file, Integer sortOrder) throws IOException {
        validate(file);

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported content type: " + contentType + ". Allowed: image/jpeg,image/png,image/webp");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File too large. Max 10MB");
        }
        if (!Set.of("provider", "staff", "review").contains(ownerType)) {
            throw new IllegalArgumentException("Invalid owner_type. Must be provider/staff/review");
        }

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            ext = original.substring(dot);
            // sanitize ext to lowercase and limit
            ext = ext.toLowerCase().replaceAll("[^a-z0-9.]", "");
            if (ext.length() > 10) ext = ext.substring(0, 10);
        }
        // fallback from content type
        if (ext.isEmpty() || ext.equals(".")) {
            if ("image/jpeg".equals(contentType)) ext = ".jpg";
            else if ("image/png".equals(contentType)) ext = ".png";
            else if ("image/webp".equals(contentType)) ext = ".webp";
            else ext = ".bin";
        }

        String uuidFilename = UUID.randomUUID().toString() + ext;
        Path base = Paths.get(basePath).toAbsolutePath().normalize();
        Files.createDirectories(base);
        Path target = base.resolve(uuidFilename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String url = "/uploads/" + uuidFilename;
        String storagePath = target.toString();

        int order = sortOrder != null ? sortOrder : 0;

        MediaAsset asset = MediaAsset.builder()
                .tenantId(tenantId)
                .ownerType(ownerType)
                .ownerId(ownerId)
                .fileName(original)
                .contentType(contentType)
                .fileSize(file.getSize())
                .storagePath(storagePath)
                .url(url)
                .sortOrder(order)
                .build();

        return mediaRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public MediaAsset getById(UUID id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> listByTenant(UUID tenantId) {
        return mediaRepository.findByTenantIdOrderBySortOrderAscCreatedAtAsc(tenantId);
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> listByOwner(UUID tenantId, String ownerType, UUID ownerId) {
        if (ownerId != null) {
            return mediaRepository.findByTenantIdAndOwnerTypeAndOwnerIdOrderBySortOrderAscCreatedAtAsc(tenantId, ownerType, ownerId);
        }
        return mediaRepository.findByTenantIdAndOwnerTypeAndOwnerIdOrderBySortOrderAscCreatedAtAsc(tenantId, ownerType, tenantId);
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> listByOwnerNoTenant(String ownerType, UUID ownerId) {
        return mediaRepository.findByOwnerTypeAndOwnerIdOrderBySortOrderAsc(ownerType, ownerId);
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> listByTenantPublic(UUID tenantId) {
        return mediaRepository.findByTenantIdOrderBySortOrderAscCreatedAtAsc(tenantId);
    }

    @Transactional
    public void delete(UUID tenantId, UUID mediaId) {
        MediaAsset asset = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found: " + mediaId));
        if (!asset.getTenantId().equals(tenantId)) {
            throw new IllegalArgumentException("Media does not belong to tenant");
        }
        // delete file best-effort
        try {
            Path p = Paths.get(asset.getStoragePath());
            Files.deleteIfExists(p);
        } catch (IOException ignored) {}
        mediaRepository.delete(asset);
    }

    @Transactional
    public void reorder(UUID tenantId, List<UUID> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID id = orderedIds.get(i);
            MediaAsset asset = mediaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Media not found: " + id));
            if (!asset.getTenantId().equals(tenantId)) {
                throw new IllegalArgumentException("Media does not belong to tenant: " + id);
            }
            asset.setSortOrder(i);
            mediaRepository.save(asset);
        }
    }

    public String signedUrl(MediaAsset asset, long expirySeconds) {
        long expiry = Instant.now().getEpochSecond() + expirySeconds;
        return asset.getUrl() + "?expiry=" + expiry;
    }

    public String signedUrl(UUID mediaId, long expirySeconds) {
        MediaAsset asset = getById(mediaId);
        return signedUrl(asset, expirySeconds);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getOriginalFilename() != null && file.getOriginalFilename().length() > 255) {
            throw new IllegalArgumentException("File name too long");
        }
    }
}
