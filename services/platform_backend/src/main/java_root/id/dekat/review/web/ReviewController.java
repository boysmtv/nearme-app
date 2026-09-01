package id.dekat.review.web;

import id.dekat.media.domain.MediaAsset;
import id.dekat.review.application.ReviewService;
import id.dekat.review.domain.Review;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/bookings/{id}/review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReview(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateReviewRequest request) {
        UUID userId = resolveUserId(headerUserId, jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID effectiveTenant = tenantId != null ? tenantId : request.tenantId();
        if (effectiveTenant == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tenantId is required"));
        }
        try {
            Review review = reviewService.createReview(
                    id, userId, effectiveTenant,
                    request.rating(), request.title(), request.body(), request.photoIds());
            Map<String, Object> row = toRow(review);
            // photos already linked via service
            List<MediaAsset> photos = reviewService.getReviewPhotos(review.getId());
            row.put("photos", photos.stream().map(this::toMediaRow).collect(Collectors.toList()));
            row.put("verifiedBooking", reviewService.isVerifiedBooking(id, userId, effectiveTenant));
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(row, "Review created"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reviews/{id}/report")
    public ResponseEntity<ApiResponse<Review>> reportReview(@PathVariable UUID id) {
        Review review = reviewService.reportReview(id, null, null);
        return ResponseEntity.ok(ApiResponse.ok(review));
    }

    @PostMapping("/reviews/{id}/photos/{mediaId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addPhoto(
            @PathVariable UUID id,
            @PathVariable UUID mediaId,
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        try {
            var rp = reviewService.addPhotoToReview(id, mediaId);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", rp.getId().toString());
            row.put("reviewId", rp.getReviewId().toString());
            row.put("mediaAssetId", rp.getMediaAssetId().toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(row, "Photo added"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/reviews/{id}/photos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPhotos(@PathVariable UUID id) {
        List<MediaAsset> assets = reviewService.getReviewPhotos(id);
        List<Map<String, Object>> rows = assets.stream().map(this::toMediaRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    private Map<String, Object> toRow(Review r) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", r.getId().toString());
        row.put("bookingId", r.getBookingId().toString());
        row.put("tenantId", r.getTenantId().toString());
        row.put("customerId", r.getCustomerId().toString());
        row.put("rating", r.getRating());
        row.put("title", r.getTitle());
        row.put("body", r.getBody());
        row.put("status", r.getStatus().name());
        row.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        return row;
    }

    private Map<String, Object> toMediaRow(MediaAsset a) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", a.getId().toString());
        row.put("url", a.getUrl());
        row.put("fileName", a.getFileName());
        row.put("contentType", a.getContentType());
        row.put("sortOrder", a.getSortOrder());
        return row;
    }

    private UUID resolveUserId(UUID header, Jwt jwt) {
        if (header != null) return header;
        if (jwt != null && jwt.getSubject() != null) {
            try { return UUID.fromString(jwt.getSubject()); } catch (Exception ignored) {}
        }
        return null;
    }

    public record CreateReviewRequest(
            Integer rating,
            String title,
            String body,
            UUID tenantId,
            List<UUID> photoIds
    ) {}
}
