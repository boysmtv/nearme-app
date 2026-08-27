package id.dekat.review.web;

import id.dekat.review.application.ReviewService;
import id.dekat.review.domain.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/bookings/{id}/review")
    public ResponseEntity<Review> createReview(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CreateReviewRequest request) {
        Review review = reviewService.createReview(
                id, userId, tenantId,
                request.rating(), request.title(), request.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PostMapping("/reviews/{id}/report")
    public ResponseEntity<Review> reportReview(@PathVariable UUID id) {
        Review review = reviewService.reportReview(id, null, null);
        return ResponseEntity.ok(review);
    }

    public record CreateReviewRequest(
            Integer rating,
            String title,
            String body
    ) {}
}
