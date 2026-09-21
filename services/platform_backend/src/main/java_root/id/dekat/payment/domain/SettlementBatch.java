package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "settlement_batches")
public class SettlementBatch {

    public enum SettlementStatus {
        PENDING, PROCESSING, PAID, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_revenue", nullable = false)
    private Long totalRevenue;

    @Column(name = "commission", nullable = false)
    private Long commission;

    @Column(name = "net_payout", nullable = false)
    private Long netPayout;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SettlementStatus status;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "bank_account_name")
    private String bankAccountName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected SettlementBatch() {}

    public SettlementBatch(UUID tenantId, LocalDate periodStart, LocalDate periodEnd,
                           Long totalRevenue, Long commission, Long netPayout) {
        this.tenantId = tenantId;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.totalRevenue = totalRevenue;
        this.commission = commission;
        this.netPayout = netPayout;
        this.status = SettlementStatus.PENDING;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public Long getTotalRevenue() { return totalRevenue; }
    public Long getCommission() { return commission; }
    public Long getNetPayout() { return netPayout; }
    public SettlementStatus getStatus() { return status; }
    public void setStatus(SettlementStatus status) { this.status = status; }
    public OffsetDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }
    public String getBankAccountName() { return bankAccountName; }
    public void setBankAccountName(String bankAccountName) { this.bankAccountName = bankAccountName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
