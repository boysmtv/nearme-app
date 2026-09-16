class BookingEntity {
  final String id;
  final String bookingCode;
  final String status;
  final String currency;
  final int subtotal;
  final int discount;
  final int tax;
  final int fee;
  final int total;
  final int depositAmount;
  final bool depositRequired;
  final DateTime? cancelDeadline;
  final int rescheduleCount;
  final int maxReschedule;
  final String? cancelPolicy;
  final int version;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? createdAt;
  final String? confirmationPin;
  final bool? pinVerified;

  const BookingEntity({
    required this.id,
    required this.bookingCode,
    required this.status,
    required this.currency,
    required this.subtotal,
    required this.discount,
    required this.tax,
    required this.fee,
    required this.total,
    this.depositAmount = 0,
    this.depositRequired = false,
    this.cancelDeadline,
    this.rescheduleCount = 0,
    this.maxReschedule = 1,
    this.cancelPolicy,
    this.version = 1,
    this.startsAt,
    this.endsAt,
    this.createdAt,
    this.confirmationPin,
    this.pinVerified,
  });

  bool get canCancel => status.toUpperCase() != 'CANCELLED' && status.toUpperCase() != 'COMPLETED';
  bool get canReschedule => rescheduleCount < maxReschedule;
  bool get isConfirmed => status.toUpperCase() == 'CONFIRMED';
  bool get isCompleted => status.toUpperCase() == 'COMPLETED';

  factory BookingEntity.fromJson(Map<String, dynamic> json) => BookingEntity(
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
