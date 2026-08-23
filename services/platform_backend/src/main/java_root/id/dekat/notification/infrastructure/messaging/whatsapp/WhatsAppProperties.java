package id.dekat.notification.infrastructure.messaging.whatsapp;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dekat.notification.whatsapp")
public record WhatsAppProperties(
        String phoneNumberId,
        String accessToken,
        String apiVersion
) {
    public WhatsAppProperties {
        if (apiVersion == null) apiVersion = "v18.0";
    }
}
