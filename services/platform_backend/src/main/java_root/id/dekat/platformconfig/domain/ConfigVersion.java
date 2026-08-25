package id.dekat.platformconfig.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "config_versions")
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
public class ConfigVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "config_key", nullable = false)
    private String configKey;

    @Type(JsonType.class)
    @Column(name = "config_value", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> configValue = new HashMap<>();

    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
