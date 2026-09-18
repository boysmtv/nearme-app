class SupportTicket {
  final String id;
  final String category;
  final String subject;
  final String message;
  final String status;
  final DateTime? createdAt;

  const SupportTicket({required this.id, required this.category, required this.subject, required this.message, required this.status, this.createdAt});

  factory SupportTicket.fromJson(Map<String, dynamic> json) => SupportTicket(
        id: json['id'] as String,
        category: (json['category'] ?? '') as String,
        subject: (json['subject'] ?? '') as String,
        message: (json['message'] ?? '') as String,
        status: (json['status'] ?? 'OPEN') as String,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}
