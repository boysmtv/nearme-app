package id.dekat.notification.infrastructure.push.fcm;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dekat.notification.fcm")
public record FirebaseProperties(
        String projectId,
        String serviceAccountPath
) {}
