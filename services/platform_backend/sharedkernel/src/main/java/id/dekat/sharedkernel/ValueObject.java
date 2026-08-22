package id.dekat.sharedkernel;

import lombok.Getter;

@Getter
public abstract class ValueObject {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return valueEquals(o);
    }

    protected abstract boolean valueEquals(Object other);

    @Override
    public int hashCode() {
        return valueHashCode();
    }

    protected abstract int valueHashCode();
}
