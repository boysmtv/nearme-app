package id.dekat.payment.infrastructure.gateway;

public interface PaymentGatewayPort {
    PaymentResult createTransaction(CreateTransactionRequest request);
    PaymentResult getTransactionStatus(String referenceId);
    RefundResult processRefund(RefundRequest request);
    boolean verifyWebhookSignature(String payload, String signature);
    WebhookEvent parseWebhookEvent(String payload);
}
