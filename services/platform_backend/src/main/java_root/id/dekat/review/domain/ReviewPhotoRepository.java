package id.dekat.review.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewPhotoRepository extends JpaRepository<ReviewPhoto, UUID> {

    List<ReviewPhoto> findByReviewId(UUID reviewId);

    List<ReviewPhoto> findByReviewIdIn(List<UUID> reviewIds);
}
