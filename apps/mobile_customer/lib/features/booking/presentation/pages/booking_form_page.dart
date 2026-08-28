import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

class BookingSummary {
  final ServiceRow service;
  final String providerName;
  const BookingSummary({required this.service, required this.providerName});
}

final bookingSummaryProvider =
    FutureProvider.autoDispose.family<BookingSummary, Map<String, String>>((ref, params) async {
  final servicesRes = await ApiService().getProviderServices(params['providerId']!);
  final services = ((servicesRes.data['data'] ?? []) as List)
      .map((e) => ServiceRow.fromJson(e as Map<String, dynamic>))
      .toList();
  final service = services.firstWhere(
    (s) => s.id == params['serviceId'],
    orElse: () => throw Exception('Selected service not found'),
  );
  final providersRes = await ApiService().getProviders();
  final providers = ((providersRes.data['data'] ?? []) as List)
      .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
      .toList();
  String providerName = 'Provider';
  for (final p in providers) {
    if (p.id == params['providerId']) {
      providerName = p.name;
      break;
    }
  }
  return BookingSummary(service: service, providerName: providerName);
});

class BookingFormPage extends ConsumerStatefulWidget {
  final String providerId;
  final String? serviceId;
  final String? date;
  final String? time;
  final String? locationId;
  const BookingFormPage({
    super.key,
    required this.providerId,
    this.serviceId,
    this.date,
    this.time,
    this.locationId,
  });

  @override
  ConsumerState<BookingFormPage> createState() => _BookingFormPageState();
}

class _BookingFormPageState extends ConsumerState<BookingFormPage> {
  final _notesController = TextEditingController();
  String _selectedPaymentMethod = 'cash';
  bool _isLoading = false;

  @override
  void dispose() { _notesController.dispose(); super.dispose(); }

  bool get _hasMissingParams =>
      widget.serviceId == null || widget.date == null || widget.time == null || widget.locationId == null;

  @override
  Widget build(BuildContext context) {
    if (_hasMissingParams) {
      return Scaffold(
        backgroundColor: DEKATColors.backgroundLight,
        appBar: AppBar(backgroundColor: Colors.white, title: const Text('Book Service', style: TextStyle(fontWeight: FontWeight.w800))),
        body: Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.warning.withValues(alpha: 0.2))),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: DEKATColors.warningLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.info_rounded, color: Color(0xFFFF9F43))),
                const SizedBox(height: 12),
                const Text('Please pick a service, date and time first.', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                FilledButton.icon(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back_rounded, size: 16), label: const Text('Go Back')),
              ],
            ),
          ),
        ),
      );
    }
    final summaryAsync = ref.watch(bookingSummaryProvider({'providerId': widget.providerId, 'serviceId': widget.serviceId!}));
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.edit_calendar_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Book Service', style: TextStyle(fontWeight: FontWeight.w800))]), centerTitle: true),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          summaryAsync.when(
            data: (summary) => TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12*(1-v)), child: ch)), child: Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.softViolet.last.withValues(alpha: 0.5)), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 6))]),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Column(children: [
                  Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight)), child: Row(children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.receipt_long_rounded, color: DEKATColors.primary, size: 16)), const SizedBox(width: 10), const Text('Ringkasan Booking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)), const Spacer(), const Icon(Icons.auto_awesome_rounded, color: Colors.white70, size: 16)])),
                  Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                    _SummaryRow(label: 'Provider', value: summary.providerName, icon: Icons.storefront_rounded, bg: DEKATColors.softViolet.last, fg: DEKATColors.primary),
                    _SummaryRow(label: 'Service', value: summary.service.name, icon: Icons.spa_rounded, bg: DEKATColors.softMint.last, fg: DEKATColors.success),
                    _SummaryRow(label: 'Duration', value: '${summary.service.durationMinutes} min', icon: Icons.schedule_rounded, bg: DEKATColors.softSky.last, fg: DEKATColors.info),
                    _SummaryRow(label: 'Date', value: widget.date!, icon: Icons.calendar_today_rounded, bg: DEKATColors.softPeach.last, fg: const Color(0xFFFF9F43)),
                    _SummaryRow(label: 'Time', value: widget.time!, icon: Icons.access_time_rounded, bg: DEKATColors.softPink.last, fg: DEKATColors.secondary),
                    const SizedBox(height: 8),
                    Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [DEKATColors.primary.withValues(alpha: 0.14), DEKATColors.secondary.withValues(alpha: 0.14)]))),
                    const SizedBox(height: 10),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primaryLight, Color(0xFFF0E8FF)]), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Row(children: [Container(padding: const EdgeInsets.all(6), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle), child: const Icon(Icons.payments_rounded, color: Colors.white, size: 14)), const SizedBox(width: 8), const Text('Price', style: TextStyle(fontWeight: FontWeight.w700))]), Text(formatRupiah(summary.service.price), style: const TextStyle(fontWeight: FontWeight.w800, color: DEKATColors.primary, fontSize: 15))])),
                  ])),
                ]),
              ),
            )),
            loading: () => Container(padding: const EdgeInsets.all(32), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)), child: const Center(child: CircularProgressIndicator(color: DEKATColors.primary))),
            error: (e, _) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.2))), child: Column(children: [
              Row(children: [const Icon(Icons.error_outline_rounded, color: DEKATColors.error, size: 18), const SizedBox(width: 8), Expanded(child: Text('Failed to load service: $e', style: const TextStyle(fontSize: 13)))]),
              const SizedBox(height: 8),
              FilledButton.icon(onPressed: () => ref.invalidate(bookingSummaryProvider({'providerId': widget.providerId, 'serviceId': widget.serviceId!})), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
            ])),
          ),
          const SizedBox(height: 18),
          Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text('Catatan Khusus', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800))]),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]),
            child: TextFormField(controller: _notesController, maxLines: 3, decoration: InputDecoration(hintText: 'Any special requests... ✨', hintStyle: TextStyle(color: Colors.grey[400]), prefixIcon: Container(margin: const EdgeInsets.all(10), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softLavender.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.edit_note_rounded, color: Color(0xFF9B7CFF), size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: Colors.white)),
          ),
          const SizedBox(height: 18),
          Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text('Metode Pembayaran', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800))]),
          const SizedBox(height: 10),
          _PaymentOption(title: 'Cash', subtitle: 'Pay at the venue • Tunai', icon: Icons.payments_rounded, gradient: DEKATColors.softMint, value: 'cash', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
          _PaymentOption(title: 'E-Wallet', subtitle: 'GoPay, OVO, Dana', icon: Icons.account_balance_wallet_rounded, gradient: DEKATColors.softViolet, value: 'ewallet', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
          _PaymentOption(title: 'Bank Transfer', subtitle: 'BCA, Mandiri, BRI', icon: Icons.account_balance_rounded, gradient: DEKATColors.softSky, value: 'bank', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
          const SizedBox(height: 80),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: const BorderRadius.vertical(top: Radius.circular(20)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.07), blurRadius: 16, offset: const Offset(0, -4))]),
        child: SafeArea(child: Container(
          decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 4))]),
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleBooking,
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.check_circle_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Konfirmasi Booking ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]),
          ),
        )),
      ),
    );
  }

  String _wibDateTime(String date, String time) => '$date T$time:00+07:00'.replaceAll(' ', '');

  Future<void> _handleBooking() async {
    final summary = ref.read(bookingSummaryProvider({'providerId': widget.providerId, 'serviceId': widget.serviceId!})).valueOrNull;
    setState(() => _isLoading = true);
    try {
      final customerId = await SecureStorageService.read(StorageKeys.userId);
      final api = ApiService();
      final startsAt = _wibDateTime(widget.date!, widget.time!);
      final endDateTime = DateTime.parse('${widget.date}T${widget.time}:00')
          .add(Duration(minutes: summary?.service.durationMinutes ?? 60));
      final endsAt = '${endDateTime.year.toString().padLeft(4, '0')}-'
          '${endDateTime.month.toString().padLeft(2, '0')}-${endDateTime.day.toString().padLeft(2, '0')}T'
          '${endDateTime.hour.toString().padLeft(2, '0')}:${endDateTime.minute.toString().padLeft(2, '0')}:00+07:00';
      final holdRes = await api.createHold({
        'tenantId': widget.providerId,
        'locationId': widget.locationId,
        'serviceId': widget.serviceId,
        'customerId': customerId,
        'startsAt': startsAt,
        'endsAt': endsAt,
      });
      final holdId = holdRes.data['data']['id'] as String;
      final bookingRes = await api.createBooking({
        'holdId': holdId,
        'tenantId': widget.providerId,
        'locationId': widget.locationId,
        'customerId': customerId,
        'currency': summary?.service.currency ?? 'IDR',
        'notes': _notesController.text,
        'paymentMethod': _selectedPaymentMethod,
        'items': [
          {
            'serviceId': summary!.service.id,
            'nameSnapshot': summary.service.name,
            'priceSnapshot': summary.service.price,
            'durationSnapshot': summary.service.durationMinutes,
            'quantity': 1,
          }
        ],
      });
      final bookingId = bookingRes.data['data']['id'] as String;
      if (mounted) {
        context.push('/payment/$bookingId'
            '?tenantId=${widget.providerId}'
            '&amount=${summary.service.price}'
            '&currency=${summary.service.currency}');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Booking failed: ${e.error ?? e.message}'),
          backgroundColor: DEKATColors.error,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Booking failed: $e'),
          backgroundColor: DEKATColors.error,
        ));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _SummaryRow({required this.label, required this.value, required this.icon, required this.bg, required this.fg});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 12, color: fg)), const SizedBox(width: 8), Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))]),
      Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
    ]));
  }
}

class _PaymentOption extends StatelessWidget {
  final String title, subtitle, value, groupValue;
  final IconData icon;
  final List<Color> gradient;
  final ValueChanged<String?> onChanged;
  const _PaymentOption({required this.title, required this.subtitle, required this.icon, required this.gradient, required this.value, required this.groupValue, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isSelected ? gradient.first.withValues(alpha: 0.5) : Colors.grey[200]!, width: isSelected ? 1.6 : 1),
        boxShadow: isSelected ? [BoxShadow(color: gradient.first.withValues(alpha: 0.16), blurRadius: 12, offset: const Offset(0, 4))] : [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)],
      ),
      child: RadioListTile<String>(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: isSelected ? gradient.first : DEKATColors.textPrimary)),
        subtitle: Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
        secondary: Container(padding: const EdgeInsets.all(9), decoration: BoxDecoration(gradient: LinearGradient(colors: isSelected ? gradient : [Colors.grey[100]!, Colors.grey[50]!]), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: isSelected ? Colors.white : Colors.grey[600], size: 18)),
        value: value, groupValue: groupValue, onChanged: onChanged, activeColor: gradient.first,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
