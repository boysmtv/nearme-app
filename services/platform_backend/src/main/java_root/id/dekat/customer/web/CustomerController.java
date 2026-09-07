package id.dekat.customer.web;

import id.dekat.customer.application.CustomerService;
import id.dekat.customer.domain.CustomerProfile;
import id.dekat.identity.domain.User;
import id.dekat.identity.domain.UserRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.tenant.domain.ProviderListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final ProviderListingRepository providerListingRepository;

    @GetMapping("/customer/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID headerTenantId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(headerUserId, jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID tenantId = resolveTenantId(headerTenantId);
        if (tenantId == null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("exists", false);
            result.put("message", "No tenant available for profile lookup");
            userRepository.findById(userId).ifPresent(u -> {
                result.put("email", u.getEmail());
                result.put("name", u.getName());
                result.put("phone", u.getPhone());
            });
            return ResponseEntity.ok(ApiResponse.ok(result));
        }
        CustomerProfile profile = customerService.getProfile(userId, tenantId);
        Map<String, Object> result = new LinkedHashMap<>();
        if (profile == null) {
            result.put("exists", false);
            userRepository.findById(userId).ifPresent(u -> {
                result.put("email", u.getEmail());
                result.put("name", u.getName());
                result.put("phone", u.getPhone());
            });
            return ResponseEntity.ok(ApiResponse.ok(result));
        }
        result.put("exists", true);
        result.put("id", profile.getId());
        result.put("nickname", profile.getNickname() != null ? profile.getNickname() : "");
        result.put("loyaltyPoints", profile.getLoyaltyPoints());
        result.put("totalBookings", profile.getTotalBookings());
        result.put("totalSpent", profile.getTotalSpent());
        userRepository.findById(userId).ifPresent(u -> {
            result.put("email", u.getEmail());
            result.put("name", u.getName());
            result.put("phone", u.getPhone());
        });
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/customer/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestHeader(value = "X-Tenant-Id", required = false) UUID headerTenantId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        UUID userId = resolveUserId(headerUserId, jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        UUID tenantId = resolveTenantId(headerTenantId);
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("No tenant available"));
        }
        String nicknameRaw = body.get("nickname");
        if (nicknameRaw == null) nicknameRaw = body.get("name");
        final String nickname = nicknameRaw;
        try {
            userRepository.findById(userId).ifPresent(user -> {
                boolean dirty = false;
                String nameVal = body.get("name") != null ? body.get("name") : nickname;
                if (nameVal != null && !nameVal.isBlank() && !nameVal.equals(user.getName())) {
                    user.setName(nameVal.trim());
                    dirty = true;
                }
                String emailVal = body.get("email");
                if (emailVal != null && !emailVal.isBlank() && !emailVal.equals(user.getEmail())) {
                    user.setEmail(emailVal.trim());
                    dirty = true;
                }
                String phoneVal = body.get("phone");
                if (phoneVal != null && !phoneVal.isBlank() && !phoneVal.equals(user.getPhone())) {
                    user.setPhone(phoneVal.trim());
                    dirty = true;
                }
                if (dirty) userRepository.save(user);
            });
        } catch (DataIntegrityViolationException ex) {
            String msg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            if (msg != null && msg.toLowerCase().contains("uq_users_phone")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Nomor telepon sudah terdaftar, gunakan nomor lain"));
            }
            if (msg != null && msg.toLowerCase().contains("uq_users_email")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Email sudah terdaftar"));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Data sudah terdaftar: " + msg));
        }
        CustomerProfile profile;
        try {
            profile = customerService.createOrUpdateProfile(userId, tenantId, nickname);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Gagal menyimpan profil, data mungkin duplikat"));
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", profile.getId());
        result.put("nickname", profile.getNickname() != null ? profile.getNickname() : "");
        result.put("loyaltyPoints", profile.getLoyaltyPoints());
        userRepository.findById(userId).ifPresent(u -> {
            result.put("name", u.getName());
            result.put("email", u.getEmail());
            result.put("phone", u.getPhone());
        });
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private UUID resolveUserId(UUID headerUserId, Jwt jwt) {
        if (headerUserId != null) return headerUserId;
        if (jwt != null && jwt.getSubject() != null) {
            try { return UUID.fromString(jwt.getSubject()); } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }

    private UUID resolveTenantId(UUID headerTenantId) {
        if (headerTenantId != null) return headerTenantId;
        return providerListingRepository.findAll().stream()
                .findFirst()
                .map(p -> p.getId())
                .orElse(null);
    }

}
