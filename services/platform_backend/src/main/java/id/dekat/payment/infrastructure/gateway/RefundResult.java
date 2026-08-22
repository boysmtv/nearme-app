package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefundResult {
    private boolean success;
    private String refundId;
    private String status;
    private String message;

    public static RefundResult success(String refundId, String status) {
        return RefundResult.builder()
                .success(true)
                .refundId(refundId)
                .status(status)
                .build();
    }

    public static RefundResult failed(String message) {
        return RefundResult.builder()
                .success(false)
                .status("FAILED")
                .message(message)
                .build();
    }
}
