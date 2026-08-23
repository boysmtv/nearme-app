package id.dekat.payment.infrastructure.gateway;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dekat.payment.gateway")
public record PaymentGatewayProperties(
        String provider,
        String serverKey,
        String clientId,
        String webhookSecret,
        String apiUrl
) {
    public PaymentGatewayProperties {
        if (provider == null) provider = "midtrans";
        if (apiUrl == null) apiUrl = "https://api.midtrans.com";
    }
}
