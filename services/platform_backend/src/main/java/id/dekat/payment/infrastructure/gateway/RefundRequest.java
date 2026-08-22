package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RefundRequest {
    private String referenceId;
    private BigDecimal amount;
    private String reason;
}
