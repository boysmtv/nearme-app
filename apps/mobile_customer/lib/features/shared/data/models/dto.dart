import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../../../booking/domain/entities/booking_entity.dart';
import '../../../availability/domain/entities/slot_entity.dart';
import '../../../discovery/domain/entities/category_entity.dart';
import '../../../notification/domain/entities/notification_entity.dart';
import '../../../chat/domain/entities/chat_entity.dart';

class ProviderDto {
  static ProviderEntity fromJson(Map<String, dynamic> json) {
    return ProviderEntity(
      id: json['id'] as String,
      slug: (json['slug'] ?? json['id']) as String,
      name: json['name'] as String,
      category: json['category'] as String?,
      imageUrl: json['imageUrl'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      city: json['city'] as String?,
      address: json['address'] as String?,
      description: json['description'] as String?,
      minPrice: json['minPrice'] as num?,
      locations: ((json['locations'] ?? []) as List)
          .map((e) => LocationEntity(
                id: e['id'] as String,
                name: e['name'] as String?,
                address: e['address'] as String?,
              ))
          .toList(),
    );
  }
}

class ServiceDto {
  static ServiceEntity fromJson(Map<String, dynamic> json) {
    return ServiceEntity(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toInt() ?? 0,
      durationMinutes: (json['duration'] as num?)?.toInt() ?? 0,
      currency: (json['currency'] ?? 'IDR') as String,
      imageUrl: json['imageUrl'] as String?,
      depositAmount: _toInt(json['depositAmount'] ?? json['deposit_amount']),
    );
  }
}

class StaffDto {
  static StaffEntity fromJson(Map<String, dynamic> json) {
    return StaffEntity(
      id: json['id'] as String,
      name: json['name'] as String,
      displayName: json['displayName'] as String?,
      title: json['title'] as String?,
      bio: json['bio'] as String?,
      avatar: json['avatar'] as String?,
      specialties: (json['specialties'] as List?)?.cast<String>() ?? [],
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class BookingDto {
  static BookingEntity fromJson(Map<String, dynamic> json) {
    return BookingEntity(
      id: json['id'] as String,
      bookingCode: (json['bookingCode'] ?? '') as String,
      status: (json['status'] ?? '') as String,
      currency: (json['currency'] ?? 'IDR') as String,
      subtotal: _toInt(json['subtotal']),
      discount: _toInt(json['discount']),
      tax: _toInt(json['tax']),
      fee: _toInt(json['fee']),
      total: _toInt(json['total']),
      depositAmount: _toInt(json['depositAmount'] ?? json['deposit_amount']),
      depositRequired: json['depositRequired'] == true || json['deposit_required'] == true,
      cancelDeadline: _parseDate(json['cancelDeadline'] ?? json['cancel_deadline']),
      rescheduleCount: _toInt(json['rescheduleCount'] ?? json['reschedule_count']),
      maxReschedule: _toInt(json['maxReschedule'] ?? json['max_reschedule'] ?? 1),
      cancelPolicy: json['cancelPolicy'] as String? ?? json['cancel_policy'] as String?,
      version: _toInt(json['version'] ?? 1),
      startsAt: _parseDate(json['startsAt']),
      endsAt: _parseDate(json['endsAt']),
      createdAt: _parseDate(json['createdAt']),
      confirmationPin: json['confirmationPin'] as String?,
      pinVerified: json['pinVerified'] as bool?,
    );
  }
}

class SlotDto {
  static SlotEntity fromJson(Map<String, dynamic> json) {
    return SlotEntity(
      time: json['time'] as String,
      available: json['available'] == true,
    );
  }
}

class CategoryDto {
  static CategoryEntity fromJson(Map<String, dynamic> json) {
    return CategoryEntity(
      id: json['id'] as String,
      name: json['name'] as String,
      icon: json['icon'] as String?,
    );
  }
}

class FaqDto {
  static FaqEntity fromJson(Map<String, dynamic> json) {
    return FaqEntity(
      id: json['id'] as String,
      question: json['question'] as String,
      answer: json['answer'] as String,
      category: json['category'] as String?,
      sortOrder: _toInt(json['sortOrder'] ?? json['sort_order']),
      isActive: json['isActive'] == true || json['is_active'] == true,
    );
  }
}

class PolicyDto {
  static PolicyEntity fromJson(Map<String, dynamic> json) {
    return PolicyEntity(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      version: _toInt(json['version'] ?? 1),
      isActive: json['isActive'] == true || json['is_active'] == true,
    );
  }
}

class NotificationDto {
  static NotificationEntity fromJson(Map<String, dynamic> json) {
    return NotificationEntity(
      id: json['id'] as String,
      channel: (json['channel'] ?? '') as String,
      subject: (json['subject'] ?? '') as String,
      body: (json['body'] ?? '') as String,
      read: json['read'] == true,
      createdAt: _parseDate(json['createdAt']),
    );
  }
}

class ConversationDto {
  static ConversationEntity fromJson(Map<String, dynamic> json) {
    return ConversationEntity(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String?,
      tenantId: (json['tenantId'] ?? '') as String,
      customerId: (json['customerId'] ?? '') as String,
      providerId: (json['providerId'] ?? '') as String,
      subject: json['subject'] as String?,
      status: (json['status'] ?? 'OPEN') as String,
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      lastMessageBody: json['lastMessage'] is Map ? (json['lastMessage']['body'] as String?) : null,
      messageCount: _toInt(json['messageCount']),
    );
  }
}

class ChatMessageDto {
  static ChatMessageEntity fromJson(Map<String, dynamic> json) {
    return ChatMessageEntity(
      id: json['id'] as String,
      conversationId: (json['conversationId'] ?? '') as String,
      senderId: (json['senderId'] ?? '') as String,
      senderRole: (json['senderRole'] ?? 'CUSTOMER') as String,
      body: (json['body'] ?? '') as String,
      messageType: (json['messageType'] ?? 'TEXT') as String,
      attachmentUrl: json['attachmentUrl'] as String?,
      createdAt: _parseDate(json['createdAt']),
    );
  }
}

DateTime? _parseDate(dynamic v) {
  if (v == null) return null;
  final parsed = DateTime.tryParse(v.toString());
  if (parsed == null) return null;
  if (v.toString().contains('+') || v.toString().contains('Z')) {
    return parsed.toLocal();
  }
  return parsed;
}

int _toInt(dynamic v) => (v as num?)?.toInt() ?? 0;
