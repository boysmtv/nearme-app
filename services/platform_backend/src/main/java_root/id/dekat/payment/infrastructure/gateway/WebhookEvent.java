package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WebhookEvent {
    private String eventType;
    private String orderId;
    private String referenceId;
    private String status;
    private Integer amount;
    private String signature;
    private String timestamp;
}
