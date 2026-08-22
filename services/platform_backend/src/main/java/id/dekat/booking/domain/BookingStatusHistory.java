package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "booking_status_history")
public class BookingStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Enumerated(EnumType.STRING)
    private BookingStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus toStatus;

    private UUID actorId;

    private String reason;

    @Column(columnDefinition = "jsonb")
    @Convert(converter = id.dekat.common.JsonbMapConverter.class)
    private Map<String, Object> metadata;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected BookingStatusHistory() {}

    public BookingStatusHistory(UUID bookingId, BookingStatus fromStatus,
                                BookingStatus toStatus, UUID actorId,
                                String reason, Map<String, Object> metadata) {
        this.bookingId = bookingId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.reason = reason;
        this.metadata = metadata;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public BookingStatus getFromStatus() { return fromStatus; }
    public BookingStatus getToStatus() { return toStatus; }
    public UUID getActorId() { return actorId; }
    public String getReason() { return reason; }
    public Map<String, Object> getMetadata() { return metadata; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
