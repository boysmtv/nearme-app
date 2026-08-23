package id.dekat.notification.infrastructure.messaging;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SendResult {
    private boolean success;
    private String messageId;
    private String status;
    private String error;

    public static SendResult success(String messageId) {
        return SendResult.builder()
                .success(true).messageId(messageId).status("SENT").build();
    }

    public static SendResult failed(String error) {
        return SendResult.builder()
                .success(false).status("FAILED").error(error).build();
    }
}
