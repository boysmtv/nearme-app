package id.dekat.sharedkernel;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Objects;
import java.util.UUID;

public class EntityId extends ValueObject {

    private final UUID value;

    public EntityId(UUID value) {
        this.value = Objects.requireNonNull(value, "EntityId value must not be null");
    }

    public static EntityId of(UUID value) {
        return new EntityId(value);
    }

    public static EntityId generate() {
        return new EntityId(UUID.randomUUID());
    }

    public UUID value() {
        return value;
    }

    @JsonValue
    @Override
    protected boolean valueEquals(Object other) {
        return value.equals(((EntityId) other).value);
    }

    @Override
    protected int valueHashCode() {
        return value.hashCode();
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
