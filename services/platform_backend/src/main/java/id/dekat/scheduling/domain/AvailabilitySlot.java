package id.dekat.scheduling.domain;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlot {

    private Instant startsAt;
    private Instant endsAt;
    private UUID staffId;
    private UUID resourceId;
    private boolean available;
}
