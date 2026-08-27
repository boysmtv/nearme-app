package id.dekat.payment.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class PaymentIntentRequest {

    @NotNull
    private UUID tenantId;

    @NotNull
    private Integer amount;

    @NotNull
    private String currency;

    private String method;

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
