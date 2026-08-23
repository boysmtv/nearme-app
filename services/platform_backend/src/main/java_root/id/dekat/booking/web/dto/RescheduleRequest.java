package id.dekat.booking.web.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public class RescheduleRequest {

    @NotNull
    private OffsetDateTime newStartsAt;

    @NotNull
    private OffsetDateTime newEndsAt;

    @NotNull
    private Long expectedVersion;

    private String idempotencyKey;

    public OffsetDateTime getNewStartsAt() { return newStartsAt; }
    public void setNewStartsAt(OffsetDateTime newStartsAt) { this.newStartsAt = newStartsAt; }
    public OffsetDateTime getNewEndsAt() { return newEndsAt; }
    public void setNewEndsAt(OffsetDateTime newEndsAt) { this.newEndsAt = newEndsAt; }
    public Long getExpectedVersion() { return expectedVersion; }
    public void setExpectedVersion(Long expectedVersion) { this.expectedVersion = expectedVersion; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
