package id.dekat.customer.web;

import id.dekat.customer.domain.*;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class SocialFeedController {

    private final SocialPostRepository postRepository;
    private final SocialLikeRepository likeRepository;
    private final SocialFollowRepository followRepository;

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFeed(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        List<SocialPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (SocialPost post : posts) {
            boolean isLiked = customerId != null && likeRepository.existsByPostIdAndCustomerId(post.getId(), customerId);
            boolean isFollowing = customerId != null && followRepository.existsByCustomerIdAndProviderId(customerId, post.getTenantId() != null ? post.getTenantId().toString() : "");
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", post.getId().toString());
            map.put("customerId", post.getCustomerId().toString());
            map.put("type", post.getType());
            map.put("title", post.getTitle());
            map.put("body", post.getBody());
            map.put("imageUrl", post.getImageUrl());
            map.put("likes", post.getLikesCount());
            map.put("comments", post.getCommentsCount());
            map.put("isLiked", isLiked);
            map.put("isFollowing", isFollowing);
            map.put("createdAt", post.getCreatedAt().toString());
            result.add(map);
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/feed")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPost(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestBody Map<String, Object> body) {
        SocialPost post = SocialPost.builder()
                .customerId(customerId)
                .tenantId(body.get("tenantId") != null ? UUID.fromString((String) body.get("tenantId")) : null)
                .type((String) body.getOrDefault("type", "REVIEW"))
                .title((String) body.get("title"))
                .body((String) body.get("body"))
                .imageUrl((String) body.get("imageUrl"))
                .build();
        SocialPost saved = postRepository.save(post);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId().toString());
        result.put("type", saved.getType());
        result.put("title", saved.getTitle());
        result.put("body", saved.getBody());
        result.put("imageUrl", saved.getImageUrl());
        result.put("likes", 0);
        result.put("comments", 0);
        result.put("isLiked", false);
        result.put("createdAt", saved.getCreatedAt().toString());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/feed/{postId}/like")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> likePost(
            @PathVariable UUID postId,
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        SocialPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        boolean exists = likeRepository.existsByPostIdAndCustomerId(postId, customerId);
        if (exists) {
            likeRepository.findByPostIdAndCustomerId(postId, customerId)
                    .ifPresent(likeRepository::delete);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        } else {
            SocialLike like = SocialLike.builder()
                    .postId(postId)
                    .customerId(customerId)
                    .build();
            likeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
        }
        postRepository.save(post);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", post.getId().toString());
        result.put("likes", post.getLikesCount());
        result.put("isLiked", !exists);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/follow/{providerId}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> followProvider(
            @PathVariable String providerId,
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        boolean exists = followRepository.existsByCustomerIdAndProviderId(customerId, providerId);
        if (exists) {
            followRepository.findByCustomerIdAndProviderId(customerId, providerId)
                    .ifPresent(followRepository::delete);
        } else {
            SocialFollow follow = SocialFollow.builder()
                    .customerId(customerId)
                    .providerId(providerId)
                    .build();
            followRepository.save(follow);
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "providerId", providerId,
                "isFollowing", !exists
        )));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrending() {
        List<SocialPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        Map<String, Map<String, Object>> providerStats = new LinkedHashMap<>();

        for (SocialPost post : posts) {
            if (post.getTenantId() == null) continue;
            String pid = post.getTenantId().toString();
            providerStats.computeIfAbsent(pid, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", pid);
                m.put("name", "Provider " + pid.substring(0, 8));
                m.put("followers", followRepository.countByProviderId(pid));
                m.put("bookings", 0);
                return m;
            });
        }

        List<Map<String, Object>> trending = new ArrayList<>(providerStats.values().stream()
                .sorted((a, b) -> Integer.compare((int) b.get("followers"), (int) a.get("followers")))
                .limit(10)
                .toList());
        return ResponseEntity.ok(ApiResponse.ok(trending));
    }
}
