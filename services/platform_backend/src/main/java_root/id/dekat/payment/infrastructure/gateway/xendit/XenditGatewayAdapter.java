package id.dekat.payment.infrastructure.gateway.xendit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import id.dekat.payment.infrastructure.gateway.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
public class XenditGatewayAdapter implements PaymentGatewayPort {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String CREATE_INVOICE_PATH = "/v2/invoices";
    private static final String GET_INVOICE_PATH = "/v2/invoices/{id}";
    private static final String REFUND_PATH = "/v2/refunds";

    private final PaymentGatewayProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public XenditGatewayAdapter(PaymentGatewayProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.apiUrl() != null ? properties.apiUrl() : "https://api.xendit.co")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public PaymentResult createTransaction(CreateTransactionRequest request) {
        log.info("Creating Xendit invoice for order: {}", request.getOrderId());
        Map<String, Object> body = buildInvoiceBody(request);
        HttpHeaders headers = createAuthHeaders();

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(CREATE_INVOICE_PATH)
                    .headers(h -> h.addAll(headers))
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String invoiceId = json.path("id").asText(null);
            String status = json.path("status").asText(null);
            String invoiceUrl = json.path("invoice_url").asText(null);

            if ("PENDING".equals(status) || "PAYMENT_METHOD_SELECTED".equals(status)) {
                log.info("Xendit invoice created: id={}, status={}", invoiceId, status);
                return PaymentResult.builder()
                        .success(true).referenceId(invoiceId)
                        .paymentUrl(invoiceUrl).status(status)
                        .message("Payment URL generated").build();
            }
            if ("PAID".equals(status) || "SETTLED".equals(status)) {
                log.info("Xendit invoice paid immediately: id={}", invoiceId);
                return PaymentResult.builder()
                        .success(true).referenceId(invoiceId)
                        .status(status).message("Payment completed").build();
            }
            log.warn("Xendit unexpected status: {} for invoice {}", status, invoiceId);
            return PaymentResult.failed("Unexpected status: " + status);
        } catch (Exception e) {
            log.error("Failed to create Xendit invoice for order: {}", request.getOrderId(), e);
            return PaymentResult.failed("Gateway error: " + e.getMessage());
        }
    }

    @Override
    public PaymentResult getTransactionStatus(String referenceId) {
        log.info("Getting Xendit invoice status: {}", referenceId);
        HttpHeaders headers = createAuthHeaders();
        try {
            ResponseEntity<String> response = restClient.get()
                    .uri(GET_INVOICE_PATH, referenceId)
                    .headers(h -> h.addAll(headers))
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String status = json.path("status").asText(null);
            String invoiceUrl = json.path("invoice_url").asText(null);
            log.info("Xendit status for {}: status={}", referenceId, status);

            return PaymentResult.builder()
                    .success(true).referenceId(referenceId)
                    .paymentUrl(invoiceUrl).status(status)
                    .message("Status retrieved").build();
        } catch (Exception e) {
            log.error("Failed to get Xendit status for: {}", referenceId, e);
            return PaymentResult.failed("Gateway error: " + e.getMessage());
        }
    }

    @Override
    public RefundResult processRefund(RefundRequest request) {
        log.info("Processing Xendit refund for reference: {}, amount: {}", request.getReferenceId(), request.getAmount());
        HttpHeaders headers = createAuthHeaders();
        Map<String, Object> body = new HashMap<>();
        body.put("invoice_id", request.getReferenceId());
        body.put("amount", request.getAmount().toPlainString());
        body.put("reason", request.getReason() != null ? request.getReason() : "Refund requested");

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(REFUND_PATH)
                    .headers(h -> h.addAll(headers))
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            JsonNode json = objectMapper.readTree(response.getBody());
            String refundId = json.path("id").asText(null);
            String status = json.path("status").asText(null);
            String failureReason = json.path("failure_reason").asText("");
            log.info("Xendit refund result: reference={}, status={}", request.getReferenceId(), status);

            if (refundId != null) {
                return RefundResult.builder()
                        .success("SUCCEEDED".equals(status)).refundId(refundId)
                        .status(status).message(failureReason).build();
            }
            return RefundResult.failed(failureReason.isEmpty() ? "Refund failed" : failureReason);
        } catch (Exception e) {
            log.error("Failed to process Xendit refund for: {}", request.getReferenceId(), e);
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
            String secret = properties.webhookSecret();
            String expected = generateHMACSHA256(payload, secret);
            boolean valid = expected.equals(signature);
            if (!valid) {
                log.warn("Xendit webhook signature mismatch. Expected: {}, Received: {}", expected, signature);
            }
            return valid;
        } catch (Exception e) {
            log.error("Failed to verify Xendit webhook signature", e);
            return false;
        }
    }

    @Override
    public WebhookEvent parseWebhookEvent(String payload) {
        log.debug("Parsing Xendit webhook event");
        try {
            JsonNode json = objectMapper.readTree(payload);
            String eventType = json.path("event").asText(null);
            JsonNode data = json.path("data");
            String externalId = data.path("external_id").asText(null);
            String status = data.path("status").asText(null);
            String amountStr = data.path("amount").asText(null);
            String id = data.path("id").asText(null);
            String createdAt = data.path("created").asText(null);

            java.math.BigDecimal amount = null;
            if (amountStr != null) {
                try { amount = new java.math.BigDecimal(amountStr); }
                catch (NumberFormatException e) { log.warn("Failed to parse amount: {}", amountStr); }
            }

            String mappedStatus = mapXenditStatus(status);
            return WebhookEvent.builder()
                    .eventType(eventType).orderId(externalId).referenceId(id != null ? id : externalId)
                    .status(mappedStatus).amount(amount).signature(payload).timestamp(createdAt).build();
        } catch (Exception e) {
            log.error("Failed to parse Xendit webhook event", e);
            throw new RuntimeException("Invalid Xendit webhook payload", e);
        }
    }

    private Map<String, Object> buildInvoiceBody(CreateTransactionRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("external_id", request.getOrderId());
        body.put("amount", request.getAmount().toPlainString());
        body.put("currency", request.getCurrency() != null ? request.getCurrency() : "IDR");

        if (request.getCustomerName() != null) {
            body.put("payer_email", request.getCustomerEmail());
        }
        if (request.getCallbackUrl() != null) {
            body.put("success_redirect_url", request.getCallbackUrl());
            body.put("failure_redirect_url", request.getCallbackUrl());
        }
        if (request.getExpiry() != null) {
            body.put("expires_on", request.getExpiry().toString());
        }

        List<Map<String, Object>> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (CreateTransactionRequest.OrderItem item : request.getItems()) {
                items.add(Map.of(
                        "id", item.getId(),
                        "name", item.getName(),
                        "price", item.getPrice().toPlainString(),
                        "quantity", item.getQuantity()
                ));
            }
        } else {
            items.add(Map.of(
                    "id", request.getOrderId(),
                    "name", "Booking Payment",
                    "price", request.getAmount().toPlainString(),
                    "quantity", 1
            ));
        }
        body.put("items", items);
        return body;
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String secretKey = properties.serverKey();
        String auth = "Basic " + Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.set(HttpHeaders.AUTHORIZATION, auth);
        return headers;
    }

    private String mapXenditStatus(String status) {
        if (status == null) return "payment.unknown";
        return switch (status.toUpperCase()) {
            case "PAID", "SETTLED" -> "payment.success";
            case "PENDING", "PAYMENT_METHOD_SELECTED", "WAITING_PAYMENT" -> "payment.pending";
            case "EXPIRED" -> "payment.expired";
            case "VOIDED" -> "payment.cancelled";
            default -> "payment.unknown";
        };
    }

    private String generateHMACSHA256(String data, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(key);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
