package id.dekat.notification.infrastructure.push;

import java.util.Map;

public interface PushNotificationPort {
    SendResult sendPush(String deviceToken, String title, String body, Map<String, Object> data);
    SendResult sendToTopic(String topic, String title, String body, Map<String, Object> data);
}
