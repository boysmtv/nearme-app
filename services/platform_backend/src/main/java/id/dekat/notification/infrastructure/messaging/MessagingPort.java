package id.dekat.notification.infrastructure.messaging;

public interface MessagingPort {
    SendResult sendWhatsApp(String phone, String message);
    SendResult sendSms(String phone, String message);
}
