package id.dekat.customer.web;

import id.dekat.customer.domain.CustomerFavorite;
import id.dekat.customer.domain.CustomerFavoriteRepository;
import id.dekat.sharedkernel.web.ApiResponse;
import id.dekat.staff.domain.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final CustomerFavoriteRepository favoriteRepository;
    private final StaffRepository staffRepository;

    @PostMapping("/{staffId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID staffId) {
        UUID customerId = resolveUserId(jwt);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        if (staffRepository.findById(staffId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Staff not found"));
        }
        if (favoriteRepository.existsByCustomerIdAndStaffId(customerId, staffId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Already favorited"));
        }
        CustomerFavorite fav = CustomerFavorite.builder()
                .customerId(customerId)
                .staffId(staffId)
                .build();
        CustomerFavorite saved = favoriteRepository.save(fav);
        Map<String, Object> row = toRow(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(row, "Favorited"));
    }

    @DeleteMapping("/{staffId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID staffId) {
        UUID customerId = resolveUserId(jwt);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        Optional<CustomerFavorite> existing = favoriteRepository.findByCustomerIdAndStaffId(customerId, staffId);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Favorite not found"));
        }
        favoriteRepository.delete(existing.get());
        return ResponseEntity.ok(ApiResponse.ok(null, "Removed"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listFavorites(
            @AuthenticationPrincipal Jwt jwt) {
        UUID customerId = resolveUserId(jwt);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        List<CustomerFavorite> favs = favoriteRepository.findByCustomerId(customerId);
        List<Map<String, Object>> rows = favs.stream().map(this::toEnrichedRow).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    private Map<String, Object> toRow(CustomerFavorite f) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", f.getId().toString());
        row.put("customerId", f.getCustomerId().toString());
        row.put("staffId", f.getStaffId().toString());
        row.put("createdAt", f.getCreatedAt() != null ? f.getCreatedAt().toString() : null);
        return row;
    }

    private Map<String, Object> toEnrichedRow(CustomerFavorite f) {
        Map<String, Object> row = toRow(f);
        staffRepository.findById(f.getStaffId()).ifPresent(s -> {
            row.put("staffName", s.getDisplayName());
            row.put("title", s.getTitle());
            row.put("avatarUrl", s.getAvatarUrl());
            row.put("tenantId", s.getTenantId().toString());
            row.put("specialties", s.getSpecialties());
        });
        return row;
    }

    private UUID resolveUserId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) return null;
        try { return UUID.fromString(jwt.getSubject()); } catch (Exception e) { return null; }
    }
}
