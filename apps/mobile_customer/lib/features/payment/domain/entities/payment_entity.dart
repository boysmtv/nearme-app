class PaymentIntent {
  final String id;
  final String status;
  final int amount;
  final String currency;
  final String? paymentUrl;
  final String? vaNumber;

  const PaymentIntent({required this.id, required this.status, required this.amount, required this.currency, this.paymentUrl, this.vaNumber});

  factory PaymentIntent.fromJson(Map<String, dynamic> json) => PaymentIntent(
        id: json['id'] as String,
        status: (json['status'] ?? 'PENDING') as String,
        amount: (json['amount'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] ?? 'IDR') as String,
        paymentUrl: json['paymentUrl'] as String?,
        vaNumber: json['vaNumber'] as String?,
      );
}

class PaymentTransaction {
  final String id;
  final String bookingId;
  final String status;
  final int amount;
  final String? method;
  final DateTime? createdAt;

  const PaymentTransaction({required this.id, required this.bookingId, required this.status, required this.amount, this.method, this.createdAt});

  factory PaymentTransaction.fromJson(Map<String, dynamic> json) => PaymentTransaction(
        id: json['id'] as String,
        bookingId: (json['bookingId'] ?? '') as String,
        status: (json['status'] ?? '') as String,
        amount: (json['amount'] as num?)?.toInt() ?? 0,
        method: json['method'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}
