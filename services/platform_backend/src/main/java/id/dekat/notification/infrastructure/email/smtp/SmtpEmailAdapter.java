package id.dekat.notification.infrastructure.email.smtp;

import id.dekat.notification.infrastructure.email.EmailPort;
import id.dekat.notification.infrastructure.email.SendResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class SmtpEmailAdapter implements EmailPort {

    private static final Pattern TEMPLATE_VAR_PATTERN = Pattern.compile("\\{\\{(\\w+)}}");

    private final JavaMailSender mailSender;
    private final SmtpProperties properties;

    public SmtpEmailAdapter(JavaMailSender mailSender, SmtpProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    public SendResult sendEmail(String to, String subject, String htmlBody) {
        log.info("Sending email to={}, subject={}", to, subject);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(properties.from());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            String messageId = UUID.randomUUID().toString();
            log.info("Email sent successfully to={}, messageId={}", to, messageId);
            return SendResult.success(messageId);

        } catch (MessagingException e) {
            log.error("Failed to send email to={}: {}", to, e.getMessage(), e);
            return SendResult.failed(e.getMessage());
        }
    }

    @Override
    public SendResult sendTemplateEmail(String to, String templateId, Map<String, Object> variables) {
        log.info("Sending template email to={}, templateId={}", to, templateId);
        try {
            String htmlBody = loadAndRenderTemplate(templateId, variables);
            String subject = extractSubject(templateId, variables);
            return sendEmail(to, subject, htmlBody);

        } catch (IOException e) {
            log.error("Failed to load template {}: {}", templateId, e.getMessage(), e);
            return SendResult.failed("Template load error: " + e.getMessage());
        }
    }

    private String loadAndRenderTemplate(String templateId, Map<String, Object> variables) throws IOException {
        String templatePath = "email-templates/" + templateId + ".html";
        ClassPathResource resource = new ClassPathResource(templatePath);

        String content;
        try (InputStream is = resource.getInputStream()) {
            content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        return renderTemplate(content, variables);
    }

    private String renderTemplate(String template, Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) {
            return template;
        }

        Matcher matcher = TEMPLATE_VAR_PATTERN.matcher(template);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String varName = matcher.group(1);
            Object value = variables.getOrDefault(varName, "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(String.valueOf(value)));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String extractSubject(String templateId, Map<String, Object> variables) {
        if (variables.containsKey("subject")) {
            return String.valueOf(variables.get("subject"));
        }
        return switch (templateId) {
            case "booking_confirmation" -> "Booking Confirmed";
            case "booking_reminder" -> "Booking Reminder";
            case "payment_receipt" -> "Payment Receipt";
            case "cancellation" -> "Booking Cancelled";
            default -> "DEKAT Notification";
        };
    }
}
