package id.dekat.notification.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    Optional<NotificationTemplate> findByEventTypeAndChannelAndLocale(String eventType, String channel, String locale);

    Optional<NotificationTemplate> findByEventType(String eventType);
}
