package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefundRequest {
    private String referenceId;
    private Integer amount;
    private String reason;
}
