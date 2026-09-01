package id.dekat.review.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.booking.domain.BookingStatus;
import id.dekat.media.domain.MediaAsset;
import id.dekat.media.domain.MediaRepository;
import id.dekat.review.domain.Review;
import id.dekat.review.domain.ReviewPhoto;
import id.dekat.review.domain.ReviewPhotoRepository;
import id.dekat.review.domain.ReviewRepository;
import id.dekat.review.domain.ReviewResponse;
import id.dekat.review.domain.ReviewResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int MIN_RATING = 1;
    private static final int MAX_RATING = 5;

    private final ReviewRepository reviewRepository;
    private final ReviewResponseRepository reviewResponseRepository;
    private final ReviewPhotoRepository reviewPhotoRepository;
    private final MediaRepository mediaRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public Review createReview(UUID bookingId, UUID customerId, UUID tenantId,
                                Integer rating, String title, String body) {
        return createReview(bookingId, customerId, tenantId, rating, title, body, null);
    }

    @Transactional
    public Review createReview(UUID bookingId, UUID customerId, UUID tenantId,
                                Integer rating, String title, String body, List<UUID> photoIds) {
        if (reviewRepository.existsByBookingIdAndCustomerId(bookingId, customerId)) {
            throw new IllegalArgumentException("You have already reviewed this booking");
        }

        validateRating(rating, "Rating");

        if (body != null && body.length() > 2000) {
            throw new IllegalArgumentException("Body must be 2000 characters or less");
        }

        Review review = Review.builder()
                .bookingId(bookingId)
                .customerId(customerId)
                .tenantId(tenantId)
                .rating(rating)
                .title(title)
                .body(body)
                .status(Review.ReviewStatus.PUBLISHED)
                .build();

        Review saved = reviewRepository.save(review);
        if (photoIds != null && !photoIds.isEmpty()) {
            if (photoIds.size() > 8) {
                throw new IllegalArgumentException("Maximum 8 photos allowed");
            }
            for (UUID mediaId : photoIds) {
                MediaAsset asset = mediaRepository.findById(mediaId)
                        .orElseThrow(() -> new IllegalArgumentException("Media not found: " + mediaId));
                // reassign owner to this review if needed
                asset.setOwnerType("review");
                asset.setOwnerId(saved.getId());
                mediaRepository.save(asset);
                ReviewPhoto rp = ReviewPhoto.builder()
                        .reviewId(saved.getId())
                        .mediaAssetId(mediaId)
                        .build();
                reviewPhotoRepository.save(rp);
            }
        }
        return saved;
    }

    @Transactional
    public ReviewPhoto addPhotoToReview(UUID reviewId, UUID mediaAssetId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
        List<ReviewPhoto> existing = reviewPhotoRepository.findByReviewId(reviewId);
        if (existing.size() >= 8) {
            throw new IllegalArgumentException("Maximum 8 photos allowed per review");
        }
        MediaAsset asset = mediaRepository.findById(mediaAssetId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found: " + mediaAssetId));
        asset.setOwnerType("review");
        asset.setOwnerId(reviewId);
        mediaRepository.save(asset);
        ReviewPhoto rp = ReviewPhoto.builder().reviewId(reviewId).mediaAssetId(mediaAssetId).build();
        return reviewPhotoRepository.save(rp);
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> getReviewPhotos(UUID reviewId) {
        List<ReviewPhoto> links = reviewPhotoRepository.findByReviewId(reviewId);
        List<UUID> mediaIds = links.stream().map(ReviewPhoto::getMediaAssetId).toList();
        if (mediaIds.isEmpty()) {
            // fallback to media_assets owner_type=review
            return mediaRepository.findByOwnerTypeAndOwnerIdOrderBySortOrderAsc("review", reviewId);
        }
        return mediaRepository.findAllById(mediaIds);
    }

    @Transactional(readOnly = true)
    public boolean isVerifiedBooking(UUID bookingId, UUID customerId, UUID tenantId) {
        if (bookingId == null || customerId == null || tenantId == null) return false;
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) return false;
        Booking b = bookingOpt.get();
        return b.getCustomerId().equals(customerId)
                && b.getTenantId().equals(tenantId)
                && b.getStatus() == BookingStatus.COMPLETED;
    }

    @Transactional
    public ReviewResponse respondToReview(UUID reviewId, String body, UUID authorId) {
        reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Response body is required");
        }

        if (body.length() > 2000) {
            throw new IllegalArgumentException("Response must be 2000 characters or less");
        }

        ReviewResponse response = ReviewResponse.builder()
                .reviewId(reviewId)
                .authorId(authorId)
                .body(body)
                .build();

        return reviewResponseRepository.save(response);
    }

    @Transactional
    public Review reportReview(UUID reviewId, UUID reporterId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (review.getStatus() == Review.ReviewStatus.HIDDEN) {
            throw new IllegalStateException("Review has already been hidden");
        }

        review.setStatus(Review.ReviewStatus.HIDDEN);
        return reviewRepository.save(review);
    }

    @Transactional
    public Review moderateReview(UUID reviewId, Review.ReviewStatus newStatus, UUID moderatorId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }

        review.setStatus(newStatus);
        return reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByTenant(UUID tenantId) {
        return reviewRepository.findPublishedReviews(tenantId);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByBooking(UUID bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }

    @Transactional(readOnly = true)
    public double calculateAverageRating(UUID tenantId) {
        List<Review> reviews = reviewRepository.findPublishedReviews(tenantId);
        if (reviews.isEmpty()) {
            return 0.0;
        }

        double sum = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        return Math.round(sum * 10.0) / 10.0;
    }

    private void validateRating(Integer rating, String fieldName) {
        if (rating == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        if (rating < MIN_RATING || rating > MAX_RATING) {
            throw new IllegalArgumentException(
                fieldName + " must be between " + MIN_RATING + " and " + MAX_RATING
            );
        }
    }
}
