package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResult {
    private boolean success;
    private String referenceId;
    private String paymentUrl;
    private String qrCode;
    private String vaNumber;
    private String status;
    private String message;

    public static PaymentResult success(String referenceId, String paymentUrl, String status) {
        return PaymentResult.builder()
                .success(true)
                .referenceId(referenceId)
                .paymentUrl(paymentUrl)
                .status(status)
                .build();
    }

    public static PaymentResult failed(String message) {
        return PaymentResult.builder()
                .success(false)
                .status("FAILED")
                .message(message)
                .build();
    }
}
