class ConversationEntity {
  final String id;
  final String? bookingId;
  final String tenantId;
  final String customerId;
  final String providerId;
  final String? subject;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? lastMessageBody;
  final int messageCount;

  const ConversationEntity({
    required this.id,
    this.bookingId,
    required this.tenantId,
    required this.customerId,
    required this.providerId,
    this.subject,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.lastMessageBody,
    this.messageCount = 0,
  });
}

class ChatMessageEntity {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderRole;
  final String body;
  final String messageType;
  final String? attachmentUrl;
  final DateTime? createdAt;

  const ChatMessageEntity({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderRole,
    required this.body,
    required this.messageType,
    this.attachmentUrl,
    this.createdAt,
  });
}
