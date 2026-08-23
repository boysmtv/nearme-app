package id.dekat.review.application;

import id.dekat.review.domain.Review;
import id.dekat.review.domain.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int MIN_RATING = 1;
    private static final int MAX_RATING = 5;

    private final ReviewRepository reviewRepository;

    @Transactional
    public Review createReview(UUID bookingId, UUID customerId, UUID tenantId,
                                Integer overallRating, Integer timelinessRating,
                                Integer qualityRating, String comment) {
        if (reviewRepository.existsByBookingIdAndCustomerId(bookingId, customerId)) {
            throw new IllegalArgumentException("You have already reviewed this booking");
        }

        validateRating(overallRating, "Overall rating");
        if (timelinessRating != null) {
            validateRating(timelinessRating, "Timeliness rating");
        }
        if (qualityRating != null) {
            validateRating(qualityRating, "Quality rating");
        }

        if (comment != null && comment.length() > 2000) {
            throw new IllegalArgumentException("Comment must be 2000 characters or less");
        }

        Review review = Review.builder()
                .bookingId(bookingId)
                .customerId(customerId)
                .tenantId(tenantId)
                .overallRating(overallRating)
                .timelinessRating(timelinessRating)
                .qualityRating(qualityRating)
                .comment(comment)
                .status(Review.ReviewStatus.PUBLISHED)
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review respondToReview(UUID reviewId, String response, UUID providerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (review.getStatus() == Review.ReviewStatus.REMOVED) {
            throw new IllegalStateException("Cannot respond to a removed review");
        }

        if (response == null || response.isBlank()) {
            throw new IllegalArgumentException("Response text is required");
        }

        if (response.length() > 2000) {
            throw new IllegalArgumentException("Response must be 2000 characters or less");
        }

        review.setProviderResponse(response);
        return reviewRepository.save(review);
    }

    @Transactional
    public Review reportReview(UUID reviewId, UUID reporterId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (review.getStatus() == Review.ReviewStatus.REMOVED) {
            throw new IllegalStateException("Review has already been removed");
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
                .mapToInt(Review::getOverallRating)
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
