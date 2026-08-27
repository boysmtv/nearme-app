package id.dekat.payment.infrastructure.gateway.midtrans;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import id.dekat.payment.infrastructure.gateway.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Component
@Primary
public class MidtransGatewayAdapter implements PaymentGatewayPort {

    private static final String SHA512_ALGORITHM = "HmacSHA512";
    private static final String CREATE_TRANSACTION_PATH = "/v2/charge";
    private static final String STATUS_PATH = "/v2/{orderId}/status";
    private static final String REFUND_PATH = "/v2/{orderId}/refund";
    private static final String MAPPER_PATH = "/v2/{orderId}/status/online/direct";

    private final PaymentGatewayProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public MidtransGatewayAdapter(PaymentGatewayProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.apiUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public PaymentResult createTransaction(CreateTransactionRequest request) {
        log.info("Creating Midtrans transaction for order: {}", request.getOrderId());

        Map<String, Object> body = buildTransactionBody(request);
        HttpHeaders headers = createAuthHeaders();

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(CREATE_TRANSACTION_PATH)
                    .headers(h -> h.addAll(headers))
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String transactionStatus = json.path("transaction_status").asText(null);
            String orderId = json.path("order_id").asText(request.getOrderId());
            String statusMessage = json.path("status_message").asText("");

            if ("challenge".equals(transactionStatus) || "pending".equals(transactionStatus)) {
                String paymentUrl = extractPaymentUrl(json);
                String vaNumber = extractVaNumber(json);
                String qrCode = extractQrCode(json);

                log.info("Midtrans transaction created: orderId={}, status={}", orderId, transactionStatus);
                return PaymentResult.builder()
                        .success(true)
                        .referenceId(orderId)
                        .paymentUrl(paymentUrl)
                        .qrCode(qrCode)
                        .vaNumber(vaNumber)
                        .status(transactionStatus)
                        .message(statusMessage)
                        .build();
            }

            if ("settlement".equals(transactionStatus)) {
                log.info("Midtrans transaction settled immediately: orderId={}", orderId);
                return PaymentResult.builder()
                        .success(true)
                        .referenceId(orderId)
                        .status("settlement")
                        .message(statusMessage)
                        .build();
            }

            log.warn("Midtrans transaction returned unexpected status: {} for order {}", transactionStatus, orderId);
            return PaymentResult.failed("Unexpected status: " + transactionStatus);

        } catch (Exception e) {
            log.error("Failed to create Midtrans transaction for order: {}", request.getOrderId(), e);
            return PaymentResult.failed("Gateway error: " + e.getMessage());
        }
    }

    @Override
    public PaymentResult getTransactionStatus(String referenceId) {
        log.info("Getting Midtrans transaction status: {}", referenceId);

        HttpHeaders headers = createAuthHeaders();

        try {
            ResponseEntity<String> response = restClient.get()
                    .uri(STATUS_PATH, referenceId)
                    .headers(h -> h.addAll(headers))
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String transactionStatus = json.path("transaction_status").asText(null);
            String statusMessage = json.path("status_message").asText("");
            String fraudStatus = json.path("fraud_status").asText(null);

            log.info("Midtrans status for {}: status={}, fraud={}", referenceId, transactionStatus, fraudStatus);

            return PaymentResult.builder()
                    .success(true)
                    .referenceId(referenceId)
                    .status(transactionStatus)
                    .message(statusMessage)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get Midtrans status for: {}", referenceId, e);
            return PaymentResult.failed("Gateway error: " + e.getMessage());
        }
    }

    @Override
    public RefundResult processRefund(RefundRequest request) {
        log.info("Processing Midtrans refund for reference: {}, amount: {}", request.getReferenceId(), request.getAmount());

        HttpHeaders headers = createAuthHeaders();

        Map<String, Object> body = new HashMap<>();
        body.put("refund_amount", request.getAmount().toString());
        body.put("reason", request.getReason() != null ? request.getReason() : "Refund requested");

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(REFUND_PATH, request.getReferenceId())
                    .headers(h -> h.addAll(headers))
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String status = json.path("status").asText(null);
            String refundId = json.path("refund_id").asText(null);
            String statusMessage = json.path("status_message").asText("");

            log.info("Midtrans refund result: reference={}, status={}", request.getReferenceId(), status);

            if (refundId != null) {
                return RefundResult.success(refundId, status);
            }

            return RefundResult.failed(statusMessage.isEmpty() ? "Refund failed" : statusMessage);

        } catch (Exception e) {
            log.error("Failed to process Midtrans refund for: {}", request.getReferenceId(), e);
            return RefundResult.failed("Gateway error: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (payload == null || signature == null) {
            log.warn("Null payload or signature for webhook verification");
            return false;
        }

        try {
            String serverKey = properties.webhookSecret();
            String expectedSignature = generateSHA512Signature(payload + serverKey);
            boolean valid = expectedSignature.equals(signature);

            if (!valid) {
                log.warn("Webhook signature mismatch. Expected: {}, Received: {}", expectedSignature, signature);
            }
            return valid;

        } catch (Exception e) {
            log.error("Failed to verify webhook signature", e);
            return false;
        }
    }

    @Override
    public WebhookEvent parseWebhookEvent(String payload) {
        log.debug("Parsing Midtrans webhook event");

        try {
            JsonNode json = objectMapper.readTree(payload);
            String orderId = json.path("order_id").asText(null);
            String statusCode = json.path("status_code").asText(null);
            String transactionStatus = json.path("transaction_status").asText(null);
            String grossAmount = json.path("gross_amount").asText(null);
            String signatureKey = json.path("signature_key").asText(null);
            String transactionTime = json.path("transaction_time").asText(null);

            String eventType = mapMidtransStatus(transactionStatus, statusCode);
            String status = transactionStatus != null ? transactionStatus.toUpperCase() : "UNKNOWN";

            java.math.BigDecimal amount = null;
            if (grossAmount != null) {
                try {
                    amount = new java.math.BigDecimal(grossAmount);
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse gross_amount: {}", grossAmount);
                }
            }

            return WebhookEvent.builder()
                    .eventType(eventType)
                    .orderId(orderId)
                    .referenceId(orderId)
                    .status(status)
                    .amount(amount != null ? amount.intValue() : null)
                    .signature(signatureKey)
                    .timestamp(transactionTime)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Midtrans webhook event", e);
            throw new RuntimeException("Invalid Midtrans webhook payload", e);
        }
    }

    private Map<String, Object> buildTransactionBody(CreateTransactionRequest request) {
        Map<String, Object> transaction = new HashMap<>();
        Map<String, Object> paymentType = new HashMap<>();

        transaction.put("transaction_details", Map.of(
                "order_id", request.getOrderId(),
                "gross_amount", request.getAmount().toString()
        ));

        if (request.getCustomerName() != null || request.getCustomerEmail() != null || request.getCustomerPhone() != null) {
            Map<String, String> customer = new HashMap<>();
            if (request.getCustomerName() != null) customer.put("first_name", request.getCustomerName());
            if (request.getCustomerEmail() != null) customer.put("email", request.getCustomerEmail());
            if (request.getCustomerPhone() != null) customer.put("phone", request.getCustomerPhone());
            transaction.put("customer_details", customer);
        }

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<Map<String, Object>> items = request.getItems().stream()
                    .map(item -> Map.<String, Object>of(
                            "id", item.getId(),
                            "name", item.getName(),
                            "price", item.getPrice().toString(),
                            "quantity", item.getQuantity()
                    ))
                    .toList();
            transaction.put("item_details", items);
        }

        if (request.getCallbackUrl() != null) {
            transaction.put("callbacks", Map.of("finish", request.getCallbackUrl()));
        }

        if (request.getExpiry() != null) {
            String expiryStr = request.getExpiry()
                    .atZoneSameInstant(ZoneId.of("Asia/Jakarta"))
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z"));
            transaction.put("expiry", Map.of("unit", "minutes", "duration", 30));
        }

        return transaction;
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String serverKey = properties.serverKey();
        String authValue = "Basic " + Base64.getEncoder().encodeToString(
                (serverKey + ":").getBytes(StandardCharsets.UTF_8)
        );
        headers.set(HttpHeaders.AUTHORIZATION, authValue);
        return headers;
    }

    private String extractPaymentUrl(JsonNode json) {
        JsonNode redirects = json.path("redirect_url");
        if (!redirects.isMissingNode()) {
            return redirects.asText(null);
        }

        JsonNode actions = json.path("actions");
        if (actions.isArray()) {
            for (JsonNode action : actions) {
                if ("payment_url".equals(action.path("name").asText())) {
                    return action.path("url").asText(null);
                }
            }
        }

        return null;
    }

    private String extractVaNumber(JsonNode json) {
        JsonNode vaNumbers = json.path("va_numbers");
        if (vaNumbers.isArray() && !vaNumbers.isEmpty()) {
            return vaNumbers.get(0).path("va_number").asText(null);
        }

        JsonNode permataVa = json.path("permata_va_number");
        if (!permataVa.isMissingNode()) {
            return permataVa.asText(null);
        }

        return null;
    }

    private String extractQrCode(JsonNode json) {
        JsonNode qrCode = json.path("qr_code");
        if (!qrCode.isMissingNode()) {
            return qrCode.asText(null);
        }

        JsonNode actions = json.path("actions");
        if (actions.isArray()) {
            for (JsonNode action : actions) {
                if ("generate-qr-code".equals(action.path("name").asText())) {
                    return action.path("url").asText(null);
                }
            }
        }

        return null;
    }

    private String mapMidtransStatus(String transactionStatus, String statusCode) {
        if (transactionStatus == null) return "payment.unknown";

        return switch (transactionStatus.toLowerCase()) {
            case "capture", "settlement" -> "payment.success";
            case "pending" -> "payment.pending";
            case "deny", "cancel", "failure" -> "payment.failed";
            case "expire" -> "payment.expired";
            case "refund" -> "refund.success";
            case "partial_refund" -> "refund.partial";
            default -> "payment.unknown";
        };
    }

    private String generateSHA512Signature(String input) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(SHA512_ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(
                properties.webhookSecret().getBytes(StandardCharsets.UTF_8), SHA512_ALGORITHM
        );
        mac.init(secretKey);
        byte[] hash = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
