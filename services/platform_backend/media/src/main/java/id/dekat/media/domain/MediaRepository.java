package id.dekat.media.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<MediaAsset, UUID> {

    List<MediaAsset> findByTenantIdAndOwnerTypeAndOwnerIdOrderBySortOrderAscCreatedAtAsc(UUID tenantId, String ownerType, UUID ownerId);

    List<MediaAsset> findByTenantIdOrderBySortOrderAscCreatedAtAsc(UUID tenantId);

    List<MediaAsset> findByOwnerTypeAndOwnerIdOrderBySortOrderAsc(String ownerType, UUID ownerId);

    List<MediaAsset> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    long countByTenantIdAndOwnerType(UUID tenantId, String ownerType);
}
