package id.dekat.notification.application;

import id.dekat.notification.domain.NotificationPreference;
import id.dekat.notification.domain.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public List<NotificationPreference> getPreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId);
    }

    @Transactional
    public NotificationPreference setPreference(UUID userId, NotificationPreference.NotificationChannel channel, boolean enabled) {
        NotificationPreference pref = preferenceRepository.findByUserIdAndChannel(userId, channel)
                .orElse(NotificationPreference.builder()
                        .userId(userId)
                        .channel(channel)
                        .build());
        pref.setEnabled(enabled);
        return preferenceRepository.save(pref);
    }

    @Transactional
    public List<NotificationPreference> setBulkPreferences(UUID userId, List<NotificationPreference.NotificationChannel> enabledChannels) {
        List<NotificationPreference> existing = preferenceRepository.findByUserId(userId);
        for (NotificationPreference.NotificationChannel ch : NotificationPreference.NotificationChannel.values()) {
            boolean enabled = enabledChannels.contains(ch);
            NotificationPreference pref = existing.stream()
                    .filter(p -> p.getChannel() == ch)
                    .findFirst()
                    .orElse(NotificationPreference.builder()
                            .userId(userId)
                            .channel(ch)
                            .build());
            pref.setEnabled(enabled);
            preferenceRepository.save(pref);
        }
        return preferenceRepository.findByUserId(userId);
    }
}
