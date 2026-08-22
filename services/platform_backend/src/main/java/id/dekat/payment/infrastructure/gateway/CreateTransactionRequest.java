package id.dekat.payment.infrastructure.gateway;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class CreateTransactionRequest {
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private List<OrderItem> items;
    private String callbackUrl;
    private OffsetDateTime expiry;

    @Getter
    @Builder
    public static class OrderItem {
        private String id;
        private String name;
        private BigDecimal price;
        private Integer quantity;
    }
}
