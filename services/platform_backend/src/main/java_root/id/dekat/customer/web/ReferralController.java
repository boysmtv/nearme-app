package id.dekat.customer.web;

import id.dekat.customer.domain.*;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralRepository referralRepository;
    private final ReferralRedemptionRepository redemptionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReferralInfo(
            @RequestHeader(value = "X-Customer-Id", required = false) UUID customerId) {
        Referral referral = referralRepository.findByReferrerId(customerId)
                .orElseGet(() -> {
                    String code = "REF-" + customerId.toString().substring(0, 8).toUpperCase();
                    Referral newRef = Referral.builder()
                            .referrerId(customerId)
                            .code(code)
                            .build();
                    return referralRepository.save(newRef);
                });

        List<ReferralRedemption> redemptions = redemptionRepository.findByReferrerId(customerId);
        List<Map<String, Object>> friends = redemptions.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("referredId", r.getReferredId().toString());
            m.put("reward", r.getRewardAmount());
            m.put("createdAt", r.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("code", referral.getCode());
        info.put("totalReferred", referral.getTotalReferred());
        info.put("totalEarnings", referral.getTotalEarnings());
        info.put("referredFriends", friends);
        return ResponseEntity.ok(ApiResponse.ok(info));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCode(
            @RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        Optional<Referral> referral = referralRepository.findByCode(code);
        if (referral.isPresent()) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "valid", true,
                    "referrerId", referral.get().getReferrerId().toString()
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
        Referral referral = referralRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid referral code"));

        if (referral.getReferrerId().equals(customerId)) {
            throw new RuntimeException("Cannot refer yourself");
        }

        if (redemptionRepository.existsByReferralIdAndReferredId(referral.getId(), customerId)) {
            throw new RuntimeException("Referral already applied");
        }

        referral.setTotalReferred(referral.getTotalReferred() + 1);
        referral.setTotalEarnings(referral.getTotalEarnings() + 20000);
        referralRepository.save(referral);

        ReferralRedemption redemption = ReferralRedemption.builder()
                .referralId(referral.getId())
                .referrerId(referral.getReferrerId())
                .referredId(customerId)
                .rewardAmount(20000)
                .build();
        redemptionRepository.save(redemption);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "message", "Referral applied! Rp 20,000 credit earned."
        )));
    }
}
