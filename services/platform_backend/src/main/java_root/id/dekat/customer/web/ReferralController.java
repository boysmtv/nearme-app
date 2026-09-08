package id.dekat.customer.web;

import id.dekat.sharedkernel.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/customer/referrals")
public class ReferralController {

    // In-memory store (production would use DB table)
    private static final Map<UUID, Map<String, Object>> referralStore = new HashMap<>();
    private static final Map<String, UUID> codeToCustomer = new HashMap<>();

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReferralInfo(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        Map<String, Object> info = referralStore.get(customerId);
        if (info == null) {
            String code = "REF-" + customerId.toString().substring(0, 8).toUpperCase();
            info = new LinkedHashMap<>();
            info.put("code", code);
            info.put("totalReferred", 0);
            info.put("totalEarnings", 0);
            info.put("referredFriends", new ArrayList<>());
            referralStore.put(customerId, info);
            codeToCustomer.put(code, customerId);
        }
        return ResponseEntity.ok(ApiResponse.ok(info));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCode(
            @RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        UUID referrerId = codeToCustomer.get(code);
        if (referrerId != null) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "valid", true,
                    "referrerId", referrerId.toString()
            )));
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of("valid", false)));
    }

    @PostMapping("/apply")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyReferral(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId,
            @RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        UUID referrerId = codeToCustomer.get(code);
        if (referrerId == null || referrerId.equals(customerId)) {
            throw new RuntimeException("Invalid referral code");
        }

        Map<String, Object> referrerInfo = referralStore.computeIfAbsent(referrerId, k -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("code", code);
            m.put("totalReferred", 0);
            m.put("totalEarnings", 0);
            m.put("referredFriends", new ArrayList<>());
            return m;
        });

        int currentReferred = (int) referrerInfo.getOrDefault("totalReferred", 0);
        referrerInfo.put("totalReferred", currentReferred + 1);
        int currentEarnings = (int) referrerInfo.getOrDefault("totalEarnings", 0);
        referrerInfo.put("totalEarnings", currentEarnings + 20000);

        List<Map<String, Object>> friends = (List<Map<String, Object>>) referrerInfo.getOrDefault("referredFriends", new ArrayList<>());
        friends.add(Map.of(
                "customerId", customerId.toString(),
                "reward", 20000,
                "createdAt", OffsetDateTime.now().toString()
        ));
        referrerInfo.put("referredFriends", friends);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "message", "Referral applied! Rp 20,000 credit earned."
        )));
    }
}
