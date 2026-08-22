package id.dekat.sharedkernel;

import lombok.Getter;

@Getter
public enum MoneyStatus {
    PENDING,
    AUTHORIZED,
    CAPTURED,
    REFUNDED,
    PARTIALLY_REFUNDED,
    FAILED,
    CANCELLED
}
