package id.dekat.payment.domain;

public enum PaymentStatus {
    CREATED,
    PENDING,
    PAID,
    FAILED,
    EXPIRED,
    CANCELLED,
    REFUNDED,
    PARTIAL_REFUND
}
