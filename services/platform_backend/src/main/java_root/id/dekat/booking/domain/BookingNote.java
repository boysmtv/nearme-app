package id.dekat.booking.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "booking_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingNote {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "booking_id", nullable = false, columnDefinition = "uuid")
    private UUID bookingId;

    @Column(name = "author_id", nullable = false, columnDefinition = "uuid")
    private UUID authorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 16)
    @Builder.Default
    private NoteVisibility visibility = NoteVisibility.INTERNAL;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum NoteVisibility {
        INTERNAL, PUBLIC
    }
}
