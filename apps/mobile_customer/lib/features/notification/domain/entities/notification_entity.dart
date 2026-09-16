class NotificationEntity {
  final String id;
  final String channel;
  final String subject;
  final String body;
  final bool read;
  final DateTime? createdAt;

  const NotificationEntity({
    required this.id,
    required this.channel,
    required this.subject,
    required this.body,
    required this.read,
    this.createdAt,
  });
}
