package id.dekat.chat.application;

import id.dekat.booking.domain.Booking;
import id.dekat.booking.domain.BookingRepository;
import id.dekat.chat.domain.Conversation;
import id.dekat.chat.domain.ConversationRepository;
import id.dekat.chat.domain.Message;
import id.dekat.chat.domain.MessageRepository;
import id.dekat.common.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatService Unit Tests")
class ChatServiceTest {

    @Mock private ConversationRepository conversationRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;

    private ChatService chatService;

    private UUID tenantId;
    private UUID customerId;
    private UUID providerId;
    private UUID bookingId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        providerId = UUID.randomUUID();
        bookingId = UUID.randomUUID();
        chatService = new ChatService(conversationRepository, messageRepository, bookingRepository, Optional.of(messagingTemplate), Optional.empty());
    }

    @Test
    @DisplayName("createConversation without booking should save conversation")
    void createConversation_noBooking_saves() {
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> {
            Conversation c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        Conversation conv = chatService.createConversation(null, tenantId, customerId, providerId, "Halo", customerId, "ROLE_CUSTOMER");

        assertThat(conv).isNotNull();
        assertThat(conv.getTenantId()).isEqualTo(tenantId);
        assertThat(conv.getCustomerId()).isEqualTo(customerId);
        assertThat(conv.getProviderId()).isEqualTo(providerId);
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    @DisplayName("createConversation with bookingId resolves tenant and customer")
    void createConversation_withBooking_resolves() {
        Booking booking = mock(Booking.class);
        when(booking.getTenantId()).thenReturn(tenantId);
        when(booking.getCustomerId()).thenReturn(customerId);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> {
            Conversation c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        Conversation conv = chatService.createConversation(bookingId, null, null, null, "Booking chat", customerId, "ROLE_CUSTOMER");

        assertThat(conv.getBookingId()).isEqualTo(bookingId);
        assertThat(conv.getTenantId()).isEqualTo(tenantId);
        verify(bookingRepository).findById(bookingId);
    }

    @Test
    @DisplayName("createConversation should throw when booking not found")
    void createConversation_bookingNotFound_throws() {
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatService.createConversation(bookingId, null, null, null, "x", customerId, "ROLE_CUSTOMER"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("createConversation should throw when tenant missing")
    void createConversation_missingTenant_throws() {
        assertThatThrownBy(() -> chatService.createConversation(null, null, customerId, providerId, "x", customerId, "ROLE_CUSTOMER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("tenantId");
    }

    @Test
    @DisplayName("listConversations for customer returns customer conversations")
    void listConversations_customer_returnsCustomerList() {
        UUID userId = customerId;
        Conversation c1 = Conversation.builder().id(UUID.randomUUID()).tenantId(tenantId).customerId(userId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findByCustomerIdOrderByUpdatedAtDesc(userId)).thenReturn(List.of(c1));

        List<Conversation> result = chatService.listConversations(userId, null, "ROLE_CUSTOMER");

        assertThat(result).hasSize(1);
        verify(conversationRepository).findByCustomerIdOrderByUpdatedAtDesc(userId);
    }

    @Test
    @DisplayName("listConversations for provider with tenant returns tenant conversations")
    void listConversations_providerWithTenant_returnsTenantList() {
        Conversation c1 = Conversation.builder().id(UUID.randomUUID()).tenantId(tenantId).customerId(customerId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId)).thenReturn(List.of(c1));

        List<Conversation> result = chatService.listConversations(providerId, tenantId, "ROLE_PROVIDER_OWNER");

        assertThat(result).hasSize(1);
        verify(conversationRepository).findByTenantIdOrderByUpdatedAtDesc(tenantId);
    }

    @Test
    @DisplayName("sendMessage should validate participant and save")
    void sendMessage_valid_savesAndBroadcasts() {
        UUID convId = UUID.randomUUID();
        Conversation conv = Conversation.builder().id(convId).tenantId(tenantId).customerId(customerId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conv));
        when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));

        Message msg = chatService.sendMessage(convId, customerId, "ROLE_CUSTOMER", "Halo provider", "TEXT", null);

        assertThat(msg).isNotNull();
        assertThat(msg.getBody()).isEqualTo("Halo provider");
        verify(messageRepository).save(any(Message.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/chats/" + convId), anyMap());
    }

    @Test
    @DisplayName("sendMessage should throw when body blank")
    void sendMessage_blankBody_throws() {
        UUID convId = UUID.randomUUID();
        Conversation conv = Conversation.builder().id(convId).tenantId(tenantId).customerId(customerId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conv));

        assertThatThrownBy(() -> chatService.sendMessage(convId, customerId, "ROLE_CUSTOMER", "   ", "TEXT", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("sendMessage should throw when not participant")
    void sendMessage_notParticipant_throwsSecurity() {
        UUID convId = UUID.randomUUID();
        UUID stranger = UUID.randomUUID();
        Conversation conv = Conversation.builder().id(convId).tenantId(tenantId).customerId(customerId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conv));

        assertThatThrownBy(() -> chatService.sendMessage(convId, stranger, "ROLE_CUSTOMER", "hi", "TEXT", null))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    @DisplayName("getMessages should check participant")
    void getMessages_notParticipant_throws() {
        UUID convId = UUID.randomUUID();
        Conversation conv = Conversation.builder().id(convId).tenantId(tenantId).customerId(customerId).providerId(providerId).status("OPEN").build();
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conv));

        assertThatThrownBy(() -> chatService.getMessages(convId, UUID.randomUUID(), "ROLE_CUSTOMER"))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    @DisplayName("getConversation should throw when not found")
    void getConversation_notFound_throws() {
        UUID convId = UUID.randomUUID();
        when(conversationRepository.findById(convId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatService.getConversation(convId, customerId, "ROLE_CUSTOMER"))
                .isInstanceOf(NotFoundException.class);
    }
}
