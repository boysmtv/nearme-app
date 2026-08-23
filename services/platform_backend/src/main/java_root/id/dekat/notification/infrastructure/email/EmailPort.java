package id.dekat.notification.infrastructure.email;

import java.util.Map;

public interface EmailPort {
    SendResult sendEmail(String to, String subject, String htmlBody);
    SendResult sendTemplateEmail(String to, String templateId, Map<String, Object> variables);
}
