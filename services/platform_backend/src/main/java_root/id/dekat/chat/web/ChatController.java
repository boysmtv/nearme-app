package id.dekat.chat.web;

import id.dekat.chat.application.ChatService;
import id.dekat.chat.domain.Conversation;
import id.dekat.chat.domain.Message;
import id.dekat.chat.domain.MessageRepository;
import id.dekat.common.NotFoundException;
import id.dekat.sharedkernel.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageRepository messageRepository;

    // SSE emitters per conversation
    private final Map<UUID, List<SseEmitter>> emitters = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/chats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createConversation(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        UUID bookingId = parseUuid(body.get("bookingId"));
        UUID tenantId = parseUuid(body.get("tenantId"));
        UUID customerId = parseUuid(body.get("customerId"));
        UUID providerId = parseUuid(body.get("providerId"));
        String subject = Objects.toString(body.get("subject"), null);

        // if tenant/customer/provider not provided, derive from booking or current user
        if (tenantId == null && bookingId == null) {
            // try to resolve tenant from provider if provider role, else fail - allow creation with user as participant
            // If customer role, providerId may be target provider; tenantId should be provided
            // Fallback: if role is CUSTOMER, customerId = userId, need providerId
            if (isCustomer(role)) {
                customerId = userId;
            } else {
                providerId = userId;
                // try to infer tenant from providerId via providerId == tenant placeholder
                tenantId = providerId; // fallback
            }
        }
        // If still missing providerId for customer creating with providerId provided, keep it
        if (customerId == null && isCustomer(role)) customerId = userId;
        if (providerId == null && !isCustomer(role)) providerId = userId;

        // if tenantId still null but we have providerId that equals tenant id, use it
        if (tenantId == null && providerId != null) tenantId = providerId; // best effort

        try {
            Conversation conv = chatService.createConversation(bookingId, tenantId, customerId, providerId, subject, userId, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toConversationRow(conv), "Conversation created"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/chats")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listConversations(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) UUID tenantId) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        UUID effectiveTenant = tenantId;
        // if not provided, try to infer from jwt claim tenant? For now null
        List<Conversation> convs = chatService.listConversations(userId, effectiveTenant, role);
        List<Map<String, Object>> rows = convs.stream().map(this::toConversationRowWithLast).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @GetMapping("/chats/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConversation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        try {
            Conversation conv = chatService.getConversation(id, userId, role);
            Map<String, Object> row = toConversationRow(conv);
            // include last message preview
            List<Message> msgs = chatService.getMessages(id, userId, role);
            if (!msgs.isEmpty()) {
                Message last = msgs.get(msgs.size() - 1);
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("body", last.getBody());
                lm.put("createdAt", last.getCreatedAt());
                lm.put("senderRole", last.getSenderRole());
                row.put("lastMessage", lm);
                row.put("messageCount", msgs.size());
            }
            return ResponseEntity.ok(ApiResponse.ok(row));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/chats/{id}/messages")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        try {
            List<Message> msgs = chatService.getMessages(id, userId, role);
            // simple pagination
            int from = Math.min((Math.max(1, page) - 1) * Math.max(1, limit), msgs.size());
            int to = Math.min(from + Math.max(1, limit), msgs.size());
            List<Map<String, Object>> rows = msgs.subList(from, to).stream().map(this::toMessageRow).toList();
            return ResponseEntity.ok(ApiResponse.ok(rows));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/chats/{id}/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        String text = Objects.toString(body.get("body"), null);
        String messageType = Objects.toString(body.get("messageType"), "TEXT");
        String attachmentUrl = Objects.toString(body.get("attachmentUrl"), null);
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("body is required"));
        }
        try {
            Message msg = chatService.sendMessage(id, userId, role, text, messageType, attachmentUrl);
            // also push to SSE emitters
            broadcastSse(id, toMessageRow(msg));
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toMessageRow(msg), "Message sent"));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping(value = "/chats/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        // validate participant before allowing SSE
        chatService.getConversation(id, userId, role);
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeEmitter(id, emitter));
        emitter.onTimeout(() -> removeEmitter(id, emitter));
        emitter.onError(e -> removeEmitter(id, emitter));
        // send initial keep-alive
        try {
            emitter.send(SseEmitter.event().name("connected").data(Map.of("conversationId", id.toString())));
        } catch (IOException ignored) {}
        return emitter;
    }

    @GetMapping("/bookings/{bookingId}/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingChat(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID bookingId) {
        UUID userId = jwtUserId(jwt);
        String role = jwtRole(jwt);
        try {
            Conversation conv = chatService.getOrCreateBookingChat(bookingId, userId, role);
            Map<String, Object> row = toConversationRow(conv);
            List<Message> msgs = chatService.getMessages(conv.getId(), userId, role);
            List<Map<String, Object>> msgRows = msgs.stream().map(this::toMessageRow).toList();
            row.put("messages", msgRows);
            return ResponseEntity.ok(ApiResponse.ok(row));
        } catch (Exception e) {
            if (e instanceof NotFoundException) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
            if (e instanceof SecurityException) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // helpers

    private void broadcastSse(UUID conversationId, Map<String, Object> payload) {
        List<SseEmitter> list = emitters.get(conversationId);
        if (list == null) return;
        for (SseEmitter emitter : List.copyOf(list)) {
            try {
                emitter.send(SseEmitter.event().name("message").data(payload));
            } catch (Exception e) {
                emitters.get(conversationId).remove(emitter);
            }
        }
    }

    private void removeEmitter(UUID id, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(id);
        if (list != null) list.remove(emitter);
    }

    private Map<String, Object> toConversationRow(Conversation c) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", c.getId().toString());
        row.put("bookingId", c.getBookingId() != null ? c.getBookingId().toString() : null);
        row.put("tenantId", c.getTenantId().toString());
        row.put("customerId", c.getCustomerId().toString());
        row.put("providerId", c.getProviderId().toString());
        row.put("subject", c.getSubject());
        row.put("status", c.getStatus());
        row.put("createdAt", c.getCreatedAt());
        row.put("updatedAt", c.getUpdatedAt());
        return row;
    }

    private Map<String, Object> toConversationRowWithLast(Conversation c) {
        Map<String, Object> row = toConversationRow(c);
        try {
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtDesc(c.getId());
            if (!msgs.isEmpty()) {
                Message last = msgs.get(0);
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("body", last.getBody());
                lm.put("createdAt", last.getCreatedAt());
                lm.put("senderRole", last.getSenderRole());
                row.put("lastMessage", lm);
            }
            row.put("messageCount", messageRepository.countByConversationId(c.getId()));
        } catch (Exception ignored) {}
        return row;
    }

    private Map<String, Object> toMessageRow(Message m) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", m.getId().toString());
        row.put("conversationId", m.getConversationId().toString());
        row.put("senderId", m.getSenderId().toString());
        row.put("senderRole", m.getSenderRole());
        row.put("body", m.getBody());
        row.put("messageType", m.getMessageType());
        row.put("attachmentUrl", m.getAttachmentUrl());
        row.put("createdAt", m.getCreatedAt());
        return row;
    }

    private UUID jwtUserId(Jwt jwt) {
        if (jwt == null) return null;
        try { return UUID.fromString(jwt.getSubject()); } catch (Exception e) { return null; }
    }

    private String jwtRole(Jwt jwt) {
        if (jwt == null) return null;
        try {
            Object roles = jwt.getClaim("roles");
            if (roles instanceof List<?> list && !list.isEmpty()) return list.get(0).toString();
            Object role = jwt.getClaim("role");
            if (role != null) return role.toString();
            // also check authorities
            Object scope = jwt.getClaim("scope");
            if (scope != null) return scope.toString();
        } catch (Exception ignored) {}
        // spring security turns roles into authorities: check claim is empty, fallback to sub?
        try {
            var auths = jwt.getClaimAsStringList("roles");
            if (auths != null && !auths.isEmpty()) return auths.get(0);
        } catch (Exception ignored) {}
        return "ROLE_CUSTOMER";
    }

    private boolean isCustomer(String role) {
        return role != null && role.contains("CUSTOMER");
    }

    private UUID parseUuid(Object v) {
        if (v == null) return null;
        if (v instanceof UUID u) return u;
        try { return UUID.fromString(v.toString()); } catch (Exception e) { return null; }
    }
}
