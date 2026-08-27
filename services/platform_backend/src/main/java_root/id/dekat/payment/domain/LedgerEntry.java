package id.dekat.payment.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ledger_entries")
public class LedgerEntry {

    public enum EntryType {
        REVENUE, REFUND, COMMISSION, FEE, TAX, DEPOSIT, ADJUSTMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private EntryType entryType;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected LedgerEntry() {}

    public LedgerEntry(UUID tenantId, UUID bookingId, EntryType entryType,
                       Integer amount, String currency, String description) {
        this.tenantId = tenantId;
        this.bookingId = bookingId;
        this.entryType = entryType;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getBookingId() { return bookingId; }
    public EntryType getEntryType() { return entryType; }
    public Integer getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDescription() { return description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
