import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

class MyReviewsPage extends ConsumerStatefulWidget {
  const MyReviewsPage({super.key});

  @override
  ConsumerState<MyReviewsPage> createState() => _MyReviewsPageState();
}

class _MyReviewsPageState extends ConsumerState<MyReviewsPage> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final res = await api.dio.get('/bookings?status=COMPLETED');
      if (!mounted) return;
      if (res.data['success'] == true) {
        setState(() {
          _bookings = res.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error loading bookings: $e');
    }
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final reviewedCount = _bookings.where((e) {
      final m = e as Map<String, dynamic>;
      return m['reviewId'] != null || m['hasReview'] == true;
    }).length;
    final pendingCount = _bookings.length - reviewedCount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Ulasan Saya'),
        backgroundColor: Colors.white,
        foregroundColor: DEKATColors.textPrimary,
        elevation: 0,
      ),
      body: _isLoading
          ? const ShimmerCardList()
          : _bookings.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: Colors.grey.shade200),
                          ),
                          child: Icon(Icons.star_border_rounded,
                              size: 56, color: Colors.grey[400]),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Belum ada booking selesai',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Booking yang sudah selesai akan muncul di sini untuk Anda ulas.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.grey[500], fontSize: 13),
                        ),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () => context.push('/search'),
                          child: const Text('Mulai Booking'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBookings,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      RepaintBoundary(
                        child: _SummaryCard(
                          total: _bookings.length,
                          reviewed: reviewedCount,
                          pending: pendingCount,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._bookings.asMap().entries.map((entry) {
                        final b =
                            entry.value as Map<String, dynamic>;
                        final hasReview = b['reviewId'] != null ||
                            b['hasReview'] == true;
                        return RepaintBoundary(
                          child: _ReviewCard(
                            booking: b,
                            hasReview: hasReview,
                            onWriteReview: () =>
                                context.push('/bookings/${b['id']}'),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final int total;
  final int reviewed;
  final int pending;

  const _SummaryCard({
    required this.total,
    required this.reviewed,
    required this.pending,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          _SummaryItem(
            icon: Icons.event_available_outlined,
            iconColor: DEKATColors.primary,
            value: '$total',
            label: 'Selesai',
          ),
          Container(
              width: 1,
              height: 44,
              color: Colors.grey.shade200,
              margin: const EdgeInsets.symmetric(horizontal: 8)),
          _SummaryItem(
            icon: Icons.star_rounded,
            iconColor: Colors.amber[700]!,
            value: '$reviewed',
            label: 'Sudah Diulas',
          ),
          Container(
              width: 1,
              height: 44,
              color: Colors.grey.shade200,
              margin: const EdgeInsets.symmetric(horizontal: 8)),
          _SummaryItem(
            icon: Icons.rate_review_outlined,
            iconColor: Colors.orange,
            value: '$pending',
            label: 'Menunggu',
          ),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String value;
  final String label;

  const _SummaryItem({
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: iconColor, size: 22),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.bold)),
          Text(label,
              style:
                  TextStyle(color: Colors.grey[500], fontSize: 12)),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final Map<String, dynamic> booking;
  final bool hasReview;
  final VoidCallback onWriteReview;

  const _ReviewCard({
    required this.booking,
    required this.hasReview,
    required this.onWriteReview,
  });

  @override
  Widget build(BuildContext context) {
    final serviceName = booking['serviceName'] as String? ?? 'Layanan';
    final providerName = booking['providerName'] as String? ?? 'Provider';
    final dateLabel = _formatBookingDate(booking['startsAt']);
    final bookingCode = booking['bookingCode'] as String?;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor:
                    DEKATColors.primary.withValues(alpha: 0.1),
                child: Text(
                  providerName.isNotEmpty
                      ? providerName[0].toUpperCase()
                      : 'D',
                  style: const TextStyle(
                    color: DEKATColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      serviceName,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.store_outlined,
                            size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            providerName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                    if (dateLabel != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.calendar_today_outlined,
                              size: 14, color: Colors.grey[500]),
                          const SizedBox(width: 4),
                          Text(
                            dateLabel,
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 13),
                          ),
                        ],
                      ),
                    ],
                    if (bookingCode != null) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          bookingCode,
                          style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (hasReview)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('✓ Terulas',
                      style: TextStyle(
                          color: Colors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(height: 1, color: Colors.grey.shade200),
          const SizedBox(height: 12),
          Row(
            children: [
              Row(
                children: List.generate(
                  5,
                  (i) => Icon(
                    hasReview
                        ? Icons.star_rounded
                        : Icons.star_border_rounded,
                    size: 20,
                    color: hasReview
                        ? Colors.amber
                        : Colors.grey[350],
                  ),
                ),
              ),
              const Spacer(),
              if (!hasReview)
                TextButton.icon(
                  onPressed: onWriteReview,
                  icon: const Icon(Icons.edit_outlined, size: 16),
                  label: const Text('Tulis Ulasan'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

String? _formatBookingDate(dynamic raw) {
  if (raw == null) return null;
  final dt = DateTime.tryParse(raw.toString());
  if (dt == null) return null;
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des'
  ];
  final local = dt.toLocal();
  final dayName = days[(local.weekday - 1) % 7];
  return '$dayName, ${local.day} ${months[local.month - 1]} ${local.year}';
}
