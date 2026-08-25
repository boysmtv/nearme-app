package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_status_history")
public class BookingStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "booking_id", nullable = false, columnDefinition = "uuid")
    private UUID bookingId;

    @Column(name = "old_status")
    @Enumerated(EnumType.STRING)
    private BookingStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private BookingStatus toStatus;

    @Column(name = "changed_by", columnDefinition = "uuid")
    private UUID actorId;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected BookingStatusHistory() {}

    public BookingStatusHistory(UUID bookingId, BookingStatus fromStatus,
                                BookingStatus toStatus, UUID actorId,
                                String reason) {
        this(bookingId, fromStatus, toStatus, actorId, reason, null);
    }

    public BookingStatusHistory(UUID bookingId, BookingStatus fromStatus,
                                BookingStatus toStatus, UUID actorId,
                                String reason, Object ignoredMetadata) {
        this.bookingId = bookingId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.reason = reason;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public BookingStatus getFromStatus() { return fromStatus; }
    public BookingStatus getToStatus() { return toStatus; }
    public UUID getActorId() { return actorId; }
    public String getReason() { return reason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
