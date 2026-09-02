package id.dekat.platformconfig.application;

import id.dekat.platformconfig.domain.FeatureFlag;
import id.dekat.platformconfig.domain.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;

    @Transactional(readOnly = true)
    public List<FeatureFlag> getAllFlags() {
        return featureFlagRepository.findAll();
    }

    @Transactional(readOnly = true)
    public FeatureFlag getFlag(UUID id) {
        return featureFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + id));
    }

    @Transactional(readOnly = true)
    public FeatureFlag getFlagByKey(String key) {
        return featureFlagRepository.findByName(key)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + key));
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(String key) {
        return featureFlagRepository.findByName(key)
                .map(FeatureFlag::getEnabled)
                .orElse(false);
    }

    @Transactional
    public FeatureFlag createFlag(FeatureFlag flag) {
        if (featureFlagRepository.findByName(flag.getName()).isPresent()) {
            throw new IllegalArgumentException("Feature flag name already exists: " + flag.getName());
        }
        return featureFlagRepository.save(flag);
    }

    @Transactional
    public FeatureFlag updateFlag(UUID id, FeatureFlag update) {
        FeatureFlag existing = featureFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + id));
        if (update.getName() != null) existing.setName(update.getName());
        if (update.getDescription() != null) existing.setDescription(update.getDescription());
        if (update.getEnabled() != null) existing.setEnabled(update.getEnabled());
        if (update.getTargetEnvironment() != null) existing.setTargetEnvironment(update.getTargetEnvironment());
        if (update.getPercentage() != null) existing.setPercentage(update.getPercentage());
        if (update.getExpiresAt() != null) existing.setExpiresAt(update.getExpiresAt());
        return featureFlagRepository.save(existing);
    }

    @Transactional
    public FeatureFlag toggleFlag(UUID id, boolean enabled) {
        FeatureFlag existing = featureFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + id));
        existing.setEnabled(enabled);
        return featureFlagRepository.save(existing);
    }

    @Transactional
    public void deleteFlag(UUID id) {
        featureFlagRepository.deleteById(id);
    }
}
