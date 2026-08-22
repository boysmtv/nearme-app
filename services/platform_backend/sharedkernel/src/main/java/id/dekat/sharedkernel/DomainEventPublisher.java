package id.dekat.sharedkernel;

import org.springframework.data.domain.AfterDomainEventPublication;
import org.springframework.data.domain.DomainEvents;
import org.springframework.data.jpa.domain.JpaAggregateRoot;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public abstract class DomainEventPublisher {

    private final transient List<Object> domainEvents = new CopyOnWriteArrayList<>();

    @DomainEvents
    protected Collection<Object> domainEvents() {
        return List.copyOf(domainEvents);
    }

    @AfterDomainEventPublication
    protected void clearDomainEvents() {
        domainEvents.clear();
    }

    protected void registerEvent(Object event) {
        domainEvents.add(event);
    }
}
