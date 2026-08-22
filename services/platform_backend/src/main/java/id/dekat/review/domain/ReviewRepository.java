package id.dekat.review.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByBookingId(UUID bookingId);

    List<Review> findByTenantIdAndStatus(UUID tenantId, Review.ReviewStatus status);

    @Query("SELECT r FROM Review r WHERE r.tenantId = :tenantId AND r.status = 'PUBLISHED' ORDER BY r.createdAt DESC")
    List<Review> findPublishedReviews(@Param("tenantId") UUID tenantId);

    boolean existsByBookingIdAndCustomerId(UUID bookingId, UUID customerId);
}
