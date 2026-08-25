package id.dekat.review.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PublicReviewRepository extends JpaRepository<PublicReview, UUID> {

    Page<PublicReview> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, PublicReview.ReviewStatus status, Pageable pageable);

    long countByTenantIdAndStatus(UUID tenantId, PublicReview.ReviewStatus status);

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0.0)
        FROM PublicReview r
        WHERE r.tenantId = :tenantId AND r.status = 'PUBLISHED'
    """)
    Double averageRating(@Param("tenantId") UUID tenantId);
}
