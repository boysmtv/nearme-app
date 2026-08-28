import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final bookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final bookingsProvider = FutureProvider.autoDispose<List<BookingRow>>((ref) async {
  final filter = ref.watch(bookingFilterProvider);
  final params = <String, dynamic>{'page': 1, 'limit': 50};
  if (filter != BookingFilter.all) params['status'] = filter.name.toUpperCase();
  final response = await ApiService().getBookings(params: params);
  return parsePaginated(response.data['data'], BookingRow.fromJson).items;
});

class BookingHistoryPage extends ConsumerWidget {
  const BookingHistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(bookingFilterProvider);
    final bookingsAsync = ref.watch(bookingsProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 18)),
          const SizedBox(width: 10),
          const Text('My Bookings', style: TextStyle(fontWeight: FontWeight.w800)),
        ]),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(children: BookingFilter.values.map((f) {
                final isSelected = currentFilter == f;
                Color chipColor;
                List<Color> grad;
                IconData icon;
                switch (f) {
                  case BookingFilter.all:
                    grad = DEKATColors.softViolet; chipColor = DEKATColors.primary; icon = Icons.apps_rounded;
                    break;
                  case BookingFilter.pending:
                    grad = DEKATColors.softPeach; chipColor = const Color(0xFFFF9F43); icon = Icons.hourglass_top_rounded;
                    break;
                  case BookingFilter.confirmed:
                    grad = DEKATColors.softSky; chipColor = DEKATColors.info; icon = Icons.verified_rounded;
                    break;
                  case BookingFilter.completed:
                    grad = DEKATColors.softMint; chipColor = DEKATColors.success; icon = Icons.check_circle_rounded;
                    break;
                  case BookingFilter.cancelled:
                    grad = DEKATColors.softPink; chipColor = DEKATColors.error; icon = Icons.cancel_rounded;
                    break;
                }
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 14, color: isSelected ? Colors.white : chipColor), const SizedBox(width: 5), Text(f.name[0].toUpperCase() + f.name.substring(1), style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: isSelected ? Colors.white : chipColor))]),
                    selected: isSelected,
                    onSelected: (_) => ref.read(bookingFilterProvider.notifier).state = f,
                    selectedColor: chipColor,
                    backgroundColor: Colors.white,
                    checkmarkColor: Colors.white,
                    showCheckmark: false,
                    side: BorderSide(color: isSelected ? chipColor : grad.last.withValues(alpha: 0.6)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: isSelected ? 2 : 0,
                    shadowColor: chipColor.withValues(alpha: 0.2),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                );
              }).toList()),
            ),
          ),
          Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [DEKATColors.primary.withValues(alpha: 0.06), DEKATColors.secondary.withValues(alpha: 0.06)]))),
          Expanded(child: bookingsAsync.when(
            data: (bookings) {
              if (bookings.isEmpty) {
                return Center(child: Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.calendar_today_rounded, size: 32, color: Colors.white)),
                    const SizedBox(height: 14),
                    Text('No bookings found', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Bookingmu akan muncul di sini ✨', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                  ]),
                ));
              }
              return ListView.builder(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16),
                itemCount: bookings.length,
                itemBuilder: (context, index) {
                  final b = bookings[index];
                  final grads = [DEKATColors.softViolet, DEKATColors.softPink, DEKATColors.softMint, DEKATColors.softSky, DEKATColors.softLavender, DEKATColors.softPeach];
                  final grad = grads[index % grads.length];
                  return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: Duration(milliseconds: 300+index*35), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: grad.last.withValues(alpha: 0.5)), boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.10), blurRadius: 12, offset: const Offset(0, 4))]),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      leading: Container(width: 48, height: 48, decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.confirmation_number_rounded, color: Colors.white, size: 22)),
                      title: Text(b.bookingCode.isEmpty ? (b.id.length > 10 ? b.id.substring(0, 10) : b.id) : b.bookingCode, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      subtitle: Container(margin: const EdgeInsets.only(top: 4), child: Row(children: [Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(6)), child: Icon(Icons.calendar_today_rounded, size: 10, color: Colors.grey[600])), const SizedBox(width: 4), Text(b.startsAt != null ? '${_fmtDate(b.startsAt!)} • ${_fmtTime(b.startsAt!)}' : '-', style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w500))])),
                      trailing: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.end, children: [
                        _StatusChip(status: b.status),
                        const SizedBox(height: 5),
                        Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: Text(formatRupiah(b.total), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: DEKATColors.primary))),
                      ]),
                      onTap: () => context.push('/booking/${b.id}'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ));
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
            error: (e, _) => Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)),
                    const SizedBox(height: 10),
                    const Text('Failed to load bookings', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    FilledButton.icon(onPressed: () => ref.invalidate(bookingsProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
                  ],
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }

  String _fmtDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
  String _fmtTime(DateTime d) => '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});
  @override
  Widget build(BuildContext context) {
    Color color;
    List<Color> grad;
    IconData icon;
    switch (status.toUpperCase()) {
      case 'PENDING':
        color = const Color(0xFFFF9F43);
        grad = DEKATColors.softPeach;
        icon = Icons.hourglass_top_rounded;
        break;
      case 'HELD':
        color = DEKATColors.primary;
        grad = DEKATColors.softLavender;
        icon = Icons.lock_clock_rounded;
        break;
      case 'CONFIRMED':
        color = DEKATColors.info;
        grad = DEKATColors.softSky;
        icon = Icons.verified_rounded;
        break;
      case 'COMPLETED':
        color = DEKATColors.success;
        grad = DEKATColors.softMint;
        icon = Icons.check_circle_rounded;
        break;
      case 'CANCELLED':
        color = DEKATColors.error;
        grad = DEKATColors.softPink;
        icon = Icons.cancel_rounded;
        break;
      default:
        color = Colors.grey;
        grad = DEKATColors.softViolet;
        icon = Icons.info_rounded;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: color.withValues(alpha: 0.18), blurRadius: 6)]),
      child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 10, color: Colors.white), const SizedBox(width: 4), Text(status.isNotEmpty ? status[0].toUpperCase() + status.substring(1).toLowerCase() : '-', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))]),
    );
  }
}
