package id.dekat.notification.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@dekat.id}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4100}")
    private String frontendUrl;

    @Async
    public void sendTemplateEmail(String to, String templateId, String subject, Map<String, String> variables) {
        try {
            String htmlBody = loadTemplate(templateId);
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                htmlBody = htmlBody.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            // Remove unrendered {{#if}} blocks
            htmlBody = htmlBody.replaceAll("\\{\\{#if[^}]*\\}\\}[\\s\\S]*?\\{\\{/if\\}\\}", "");

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent to {} with template {}", to, templateId);
        } catch (Exception e) {
            log.error("Failed to send email to {} with template {}: {}", to, templateId, e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmation(String to, String customerName, String bookingCode,
                                         String serviceName, String bookingDate, String bookingTime,
                                         String providerName, String totalAmount) {
        Map<String, String> vars = Map.of(
            "customerName", customerName,
            "bookingCode", bookingCode,
            "serviceName", serviceName,
            "bookingDate", bookingDate,
            "bookingTime", bookingTime,
            "providerName", providerName,
            "totalAmount", totalAmount,
            "bookingUrl", frontendUrl + "/bookings/" + bookingCode
        );
        sendTemplateEmail(to, "booking-confirmation", "Booking Confirmed - " + bookingCode, vars);
    }

    @Async
    public void sendBookingReminder(String to, String customerName, String bookingCode,
                                     String serviceName, String bookingDate, String bookingTime,
                                     String providerName, String providerAddress, String timeUntil) {
        Map<String, String> vars = Map.of(
            "customerName", customerName,
            "bookingCode", bookingCode,
            "serviceName", serviceName,
            "bookingDate", bookingDate,
            "bookingTime", bookingTime,
            "providerName", providerName,
            "providerAddress", providerAddress,
            "timeUntil", timeUntil,
            "directionsUrl", "https://maps.google.com/?q=" + providerAddress
        );
        sendTemplateEmail(to, "booking-reminder", "Reminder: " + serviceName + " - " + bookingDate, vars);
    }

    @Async
    public void sendBookingCancellation(String to, String customerName, String bookingCode,
                                         String serviceName, String bookingDate, String cancelReason,
                                         String refundAmount) {
        Map<String, String> vars = new java.util.HashMap<>(Map.of(
            "customerName", customerName,
            "bookingCode", bookingCode,
            "serviceName", serviceName,
            "bookingDate", bookingDate,
            "cancelReason", cancelReason
        ));
        if (refundAmount != null) {
            vars.put("refundAmount", refundAmount);
        }
        sendTemplateEmail(to, "booking-cancellation", "Booking Dibatalkan - " + bookingCode, vars);
    }

    @Async
    public void sendPaymentReceipt(String to, String customerName, String bookingCode,
                                    String amount, String paymentMethod, String paymentDate,
                                    String referenceId) {
        Map<String, String> vars = Map.of(
            "customerName", customerName,
            "bookingCode", bookingCode,
            "amount", amount,
            "paymentMethod", paymentMethod,
            "paymentDate", paymentDate,
            "referenceId", referenceId
        );
        sendTemplateEmail(to, "payment-receipt", "Payment Receipt - " + bookingCode, vars);
    }

    @Async
    public void sendWelcomeEmail(String to, String userName) {
        Map<String, String> vars = Map.of(
            "userName", userName,
            "searchUrl", frontendUrl + "/search"
        );
        sendTemplateEmail(to, "welcome", "Selamat Datang di DEKAT!", vars);
    }

    @Async
    public void sendReviewPrompt(String to, String customerName, String providerName, String bookingCode) {
        Map<String, String> vars = Map.of(
            "customerName", customerName,
            "providerName", providerName,
            "reviewUrl", frontendUrl + "/bookings/" + bookingCode + "/review"
        );
        sendTemplateEmail(to, "review-prompt", "Bagaimana Pengalamanmu di " + providerName + "?", vars);
    }

    @Async
    public void sendOtpEmail(String to, String code, String purpose) {
        String subject = purpose.equals("REGISTER") ? "Kode Verifikasi Registrasi" : "Kode Verifikasi Login";
        Map<String, String> vars = Map.of(
            "otpCode", code,
            "purpose", purpose,
            "expiryMinutes", "5"
        );
        sendTemplateEmail(to, "otp", subject, vars);
    }

    private String loadTemplate(String templateId) {
        try {
            ClassPathResource resource = new ClassPathResource("email-templates/" + templateId + ".html");
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load email template: {}", templateId, e);
            return "<p>Email template not available.</p>";
        }
    }
}
