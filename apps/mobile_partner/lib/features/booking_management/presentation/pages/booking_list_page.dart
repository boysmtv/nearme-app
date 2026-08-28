import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/models/rows.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final partnerBookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final partnerBookingsProvider = FutureProvider.autoDispose<List<PartnerBookingRow>>((ref) async {
  final filter = ref.watch(partnerBookingFilterProvider);
  final params = <String, dynamic>{'page': 1, 'limit': 50};
  if (filter != BookingFilter.all) params['status'] = filter.name.toUpperCase();
  final response = await ApiService().getPartnerBookings(params: params);
  return parsePaginated(response.data['data'], PartnerBookingRow.fromJson).items;
});

class BookingListPage extends ConsumerWidget {
  const BookingListPage({super.key});

  // palette per filter
  List<Color> _filterGradient(BookingFilter f) {
    return switch (f) {
      BookingFilter.all => DEKATColors.softViolet,
      BookingFilter.pending => DEKATColors.softPeach,
      BookingFilter.confirmed => DEKATColors.softSky,
      BookingFilter.completed => DEKATColors.softMint,
      BookingFilter.cancelled => DEKATColors.softPink,
    };
  }

  Color _filterColor(BookingFilter f) {
    return switch (f) {
      BookingFilter.all => DEKATColors.primary,
      BookingFilter.pending => const Color(0xFFE6A532),
      BookingFilter.confirmed => const Color(0xFF5AA9E6),
      BookingFilter.completed => const Color(0xFF4CAF7D),
      BookingFilter.cancelled => DEKATColors.secondary,
    };
  }

  IconData _filterIcon(BookingFilter f) {
    return switch (f) {
      BookingFilter.all => Icons.apps_rounded,
      BookingFilter.pending => Icons.hourglass_top_rounded,
      BookingFilter.confirmed => Icons.verified_rounded,
      BookingFilter.completed => Icons.check_circle_rounded,
      BookingFilter.cancelled => Icons.cancel_rounded,
    };
  }

  Color _statusColor(String status) {
    return switch (status) {
      'PENDING' || 'HELD' || 'PENDING_APPROVAL' => const Color(0xFFE6A532),
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => const Color(0xFF5AA9E6),
      'COMPLETED' => const Color(0xFF4CAF7D),
      _ => DEKATColors.secondary,
    };
  }

  List<Color> _statusGradient(String status) {
    return switch (status) {
      'PENDING' || 'HELD' || 'PENDING_APPROVAL' => DEKATColors.softPeach,
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => DEKATColors.softSky,
      'COMPLETED' => DEKATColors.softMint,
      _ => DEKATColors.softPink,
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(partnerBookingFilterProvider);
    final bookingsAsync = ref.watch(partnerBookingsProvider);

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: const Color(0xFF5AA9E6).withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]),
                child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF5AA9E6), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Bookings', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                Text('Kelola pesanan pelangganmu', style: TextStyle(fontSize: 12, color: DEKATColors.textSecondary, fontWeight: FontWeight.w500)),
              ])),
              bookingsAsync.maybeWhen(
                data: (list) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)),
                  child: Text('${list.length} total', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: DEKATColors.primary)),
                ),
                orElse: () => const SizedBox(),
              ),
            ]),
          ),
          SizedBox(
            height: 46,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemCount: BookingFilter.values.length,
              itemBuilder: (context, idx) {
                final f = BookingFilter.values[idx];
                final selected = currentFilter == f;
                final grad = _filterGradient(f);
                final col = _filterColor(f);
                return GestureDetector(
                  onTap: () => ref.read(partnerBookingFilterProvider.notifier).state = f,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: selected ? LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
                      color: selected ? null : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? grad[0].withValues(alpha: 0.35) : Colors.grey[200]!),
                      boxShadow: selected ? [BoxShadow(color: grad[0].withValues(alpha: 0.24), blurRadius: 10, offset: const Offset(0, 3))] : [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(color: selected ? Colors.white.withValues(alpha: 0.9) : grad[1], shape: BoxShape.circle),
                        child: Icon(_filterIcon(f), size: 13, color: selected ? col : col),
                      ),
                      const SizedBox(width: 7),
                      Text(f.name[0].toUpperCase() + f.name.substring(1), style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: selected ? Colors.white : DEKATColors.textPrimary)),
                    ]),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 6),
          Expanded(
            child: bookingsAsync.when(
              data: (bookings) {
                if (bookings.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Container(
                          width: 84, height: 84,
                          decoration: BoxDecoration(color: DEKATColors.softSky[1], shape: BoxShape.circle, border: Border.all(color: DEKATColors.softSky[0].withValues(alpha: 0.3))),
                          child: Icon(Icons.inbox_rounded, size: 38, color: const Color(0xFF5AA9E6).withValues(alpha: 0.8)),
                        ),
                        const SizedBox(height: 16),
                        const Text('Belum ada booking', style: TextStyle(fontWeight: FontWeight.w700, color: DEKATColors.textPrimary)),
                        const SizedBox(height: 6),
                        Text(currentFilter == BookingFilter.all ? 'Booking baru akan muncul di sini ✨' : 'Tidak ada booking ${currentFilter.name}', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                        const SizedBox(height: 16),
                        if (currentFilter != BookingFilter.all)
                          OutlinedButton.icon(onPressed: () => ref.read(partnerBookingFilterProvider.notifier).state = BookingFilter.all, icon: const Icon(Icons.clear_all_rounded, size: 16), label: const Text('Lihat Semua')),
                      ]),
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(partnerBookingsProvider),
                  color: DEKATColors.primary,
                  child: ListView.builder(
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    itemCount: bookings.length,
                    itemBuilder: (context, index) {
                      final b = bookings[index];
                      final status = b.status.toUpperCase();
                      final statusGrad = _statusGradient(status);
                      final statusCol = _statusColor(status);
                      return TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: 1),
                        duration: Duration(milliseconds: 260 + (index % 6) * 50),
                        curve: Curves.easeOutCubic,
                        builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10 * (1 - v)), child: child)),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey[100]!),
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => context.push('/booking/${b.id}'),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(children: [
                                  Hero(
                                    tag: 'booking-${b.id}',
                                    child: Container(
                                      width: 44, height: 44,
                                      decoration: BoxDecoration(gradient: LinearGradient(colors: statusGrad), borderRadius: BorderRadius.circular(12)),
                                      child: Icon(Icons.receipt_long_rounded, size: 20, color: statusCol),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                      Row(children: [
                                        Expanded(child: Text(b.bookingCode.isEmpty ? '#${b.id.substring(0, 8)}' : b.bookingCode, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: -0.2), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                        if (b.amount > 0)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)),
                                            child: Text(formatRupiah(b.amount), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: DEKATColors.primary)),
                                          ),
                                      ]),
                                      const SizedBox(height: 4),
                                      Text('${b.serviceName.isEmpty ? "Layanan" : b.serviceName} • ${b.customerName}', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      const SizedBox(height: 6),
                                      Row(children: [
                                        Icon(Icons.access_time_rounded, size: 11, color: Colors.grey[400]),
                                        const SizedBox(width: 4),
                                        Text(b.time.isEmpty ? '-' : b.time, style: TextStyle(fontSize: 11, color: Colors.grey[500], fontWeight: FontWeight.w600)),
                                        const SizedBox(width: 10),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(color: statusGrad[1], borderRadius: BorderRadius.circular(20), border: Border.all(color: statusGrad[0].withValues(alpha: 0.20))),
                                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                                            Container(width: 6, height: 6, decoration: BoxDecoration(color: statusCol, shape: BoxShape.circle)),
                                            const SizedBox(width: 5),
                                            Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-', style: TextStyle(color: statusCol, fontSize: 11, fontWeight: FontWeight.w700)),
                                          ]),
                                        ),
                                      ]),
                                    ]),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.chevron_right_rounded, size: 16, color: Colors.grey[500])),
                                ]),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 5,
                itemBuilder: (_, __) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 86, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                ),
              ),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.cloud_off_rounded, color: DEKATColors.error)),
                      const SizedBox(height: 12),
                      const Text('Gagal memuat booking', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 14),
                      FilledButton.icon(onPressed: () => ref.invalidate(partnerBookingsProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
                    ]),
                  ),
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}
