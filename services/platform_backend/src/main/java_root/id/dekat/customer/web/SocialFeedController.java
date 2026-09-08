package id.dekat.customer.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/social")
public class SocialFeedController {

    private static final List<Map<String, Object>> feedStore = new ArrayList<>();
    private static final Map<UUID, Set<String>> followingStore = new HashMap<>();
    private static final Map<String, Set<UUID>> likeStore = new HashMap<>();

    static {
        // Seed data
        feedStore.add(createPost("1", "Barbershop Central", "PROMO", "Diskon 20% untuk Potong Rambut!",
                "Hanya minggu ini! Potong rambut jadi Rp 40.000 dari Rp 50.000. Buruan!", 24, 8));
        feedStore.add(createPost("2", "Beauty Salon", "GALLERY", "Hasil Creambath Terbaru",
                "Hasil creambath dari pelanggan kami. Rambut sehat berkilau!", 15, 3));
        feedStore.add(createPost("3", "Spa & Wellness", "REVIEW", "Review dari Siti",
                "Pelayanan sangat memuaskan! Tempatnya bersih dan stafnya ramah. Pasti akan kembali lagi.", 32, 12));
    }

    private static Map<String, Object> createPost(String id, String provider, String type, String title, String body, int likes, int comments) {
        Map<String, Object> post = new LinkedHashMap<>();
        post.put("id", id);
        post.put("providerId", "p" + id);
        post.put("providerName", provider);
        post.put("providerAvatar", "");
        post.put("type", type);
        post.put("title", title);
        post.put("body", body);
        post.put("imageUrl", "");
        post.put("createdAt", OffsetDateTime.now().minusDays(Long.parseLong(id)).toString());
        post.put("likes", likes);
        post.put("comments", comments);
        post.put("isLiked", false);
        post.put("isFollowing", true);
        return post;
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFeed(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        List<Map<String, Object>> result = new ArrayList<>(feedStore);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/feed/{postId}/like")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> likePost(
            @PathVariable String postId,
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        Set<UUID> likers = likeStore.computeIfAbsent(postId, k -> new HashSet<>());
        boolean wasLiked = likers.contains(customerId);
        if (wasLiked) {
            likers.remove(customerId);
        } else {
            likers.add(customerId);
        }

        for (Map<String, Object> post : feedStore) {
            if (postId.equals(post.get("id"))) {
                int currentLikes = (int) post.getOrDefault("likes", 0);
                post.put("likes", wasLiked ? currentLikes - 1 : currentLikes + 1);
                post.put("isLiked", !wasLiked);
                return ResponseEntity.ok(ApiResponse.ok(post));
            }
        }
        throw new RuntimeException("Post not found");
    }

    @PostMapping("/follow/{providerId}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> followProvider(
            @PathVariable String providerId,
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        Set<String> following = followingStore.computeIfAbsent(customerId, k -> new HashSet<>());
        boolean wasFollowing = following.contains(providerId);
        if (wasFollowing) {
            following.remove(providerId);
        } else {
            following.add(providerId);
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "providerId", providerId,
                "isFollowing", !wasFollowing
        )));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrending() {
        List<Map<String, Object>> trending = new ArrayList<>();
        trending.add(Map.of("id", "1", "name", "Barbershop Central", "followers", 450, "bookings", 120));
        trending.add(Map.of("id", "2", "name", "Beauty Salon", "followers", 380, "bookings", 98));
        trending.add(Map.of("id", "3", "name", "Spa & Wellness", "followers", 320, "bookings", 85));
        return ResponseEntity.ok(ApiResponse.ok(trending));
    }
}
