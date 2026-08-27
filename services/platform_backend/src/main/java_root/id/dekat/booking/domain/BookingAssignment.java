package id.dekat.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_assignments")
public class BookingAssignment {

    public enum AssignmentStatus {
        ASSIGNED, ACCEPTED, DECLINED, COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "booking_item_id")
    private UUID bookingItemId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AssignmentStatus status;

    @Column(name = "starts_at")
    private OffsetDateTime startsAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    protected BookingAssignment() {}

    public BookingAssignment(UUID bookingId, UUID staffId,
                             OffsetDateTime startsAt, OffsetDateTime endsAt) {
        this.bookingId = bookingId;
        this.staffId = staffId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = AssignmentStatus.ASSIGNED;
    }

    public void accept() { this.status = AssignmentStatus.ACCEPTED; }
    public void decline() { this.status = AssignmentStatus.DECLINED; }
    public void complete() { this.status = AssignmentStatus.COMPLETED; }

    public UUID getId() { return id; }
    public UUID getBookingId() { return bookingId; }
    public UUID getBookingItemId() { return bookingItemId; }
    public UUID getStaffId() { return staffId; }
    public AssignmentStatus getStatus() { return status; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
}
