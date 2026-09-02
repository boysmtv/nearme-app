package id.dekat.notification.web;

import id.dekat.notification.application.NotificationPreferenceService;
import id.dekat.notification.domain.NotificationPreference;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalArgumentException("Not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof id.dekat.identity.domain.User user) {
            return user.getId();
        }
        return UUID.fromString(auth.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationPreference>>> getPreferences() {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(preferenceService.getPreferences(userId)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<List<NotificationPreference>>> setPreferences(@RequestBody Map<String, List<String>> body) {
        UUID userId = getCurrentUserId();
        List<String> channels = body.getOrDefault("enabledChannels", List.of());
        List<NotificationPreference.NotificationChannel> enabledChannels = channels.stream()
                .map(c -> {
                    try { return NotificationPreference.NotificationChannel.valueOf(c.toUpperCase()); }
                    catch (Exception e) { return null; }
                })
                .filter(c -> c != null)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(preferenceService.setBulkPreferences(userId, enabledChannels), "Preferences updated"));
    }

    @PutMapping("/{channel}")
    public ResponseEntity<ApiResponse<NotificationPreference>> toggleChannel(
            @PathVariable String channel, @RequestBody Map<String, Boolean> body) {
        UUID userId = getCurrentUserId();
        NotificationPreference.NotificationChannel ch = NotificationPreference.NotificationChannel.valueOf(channel.toUpperCase());
        boolean enabled = body.getOrDefault("enabled", true);
        return ResponseEntity.ok(ApiResponse.ok(preferenceService.setPreference(userId, ch, enabled), "Channel updated"));
    }
}
