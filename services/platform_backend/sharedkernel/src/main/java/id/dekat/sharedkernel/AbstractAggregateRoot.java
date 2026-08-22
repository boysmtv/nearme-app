package id.dekat.sharedkernel;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@MappedSuperclass
@Getter
@Setter
public abstract class AbstractAggregateRoot extends BaseEntity {

    @Id
    @jakarta.persistence.Column(columnDefinition = "uuid")
    private UUID id;

    protected AbstractAggregateRoot() {
        this.id = UUID.randomUUID();
    }
}
