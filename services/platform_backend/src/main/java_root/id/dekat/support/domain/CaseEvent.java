package id.dekat.support.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "case_event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEvent {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID caseId;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID actorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventAction action;

    @Column(columnDefinition = "jsonb")
    private String details;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public enum EventAction {
        CREATED, COMMENT, STATUS_CHANGE, ASSIGN, ESCALATE, RESOLVE, CLOSE
    }
}
