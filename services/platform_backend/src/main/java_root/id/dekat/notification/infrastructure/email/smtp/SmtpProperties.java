package id.dekat.notification.infrastructure.email.smtp;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dekat.notification.smtp")
public record SmtpProperties(
        String host,
        int port,
        String username,
        String password,
        String from
) {
    public SmtpProperties {
        if (host == null) host = "smtp.gmail.com";
        if (port == 0) port = 587;
    }
}
