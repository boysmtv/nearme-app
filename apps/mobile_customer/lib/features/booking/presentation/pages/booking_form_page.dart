import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../viewmodel/booking_viewmodel.dart' show bookingSummaryProvider;
import '../../../../shared/utils/format_rupiah.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

class BookingFormPage extends ConsumerStatefulWidget {
  final String providerId;
  final String? serviceId;
  final String? date;
  final String? time;
  final String? locationId;
  final String? staffId;
  const BookingFormPage({
    super.key,
    required this.providerId,
    this.serviceId,
    this.date,
    this.time,
    this.locationId,
    this.staffId,
  });

  @override
  ConsumerState<BookingFormPage> createState() => _BookingFormPageState();
}

class _BookingFormPageState extends ConsumerState<BookingFormPage> {
  final _notesController = TextEditingController();
  // Nilai kanonis sesuai CHECK backend (CASH/CARD/BANK_TRANSFER/...).
  // Jangan lowercase: backend melempar 400 untuk nilai tak dikenal.
  String _selectedPaymentMethod = 'CASH';
  bool _isLoading = false;

  @override
  void dispose() { _notesController.dispose(); super.dispose(); }

  bool get _hasMissingParams =>
      widget.serviceId == null || widget.date == null || widget.time == null || widget.locationId == null;

  @override
  Widget build(BuildContext context) {
    if (_hasMissingParams) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8F9FF),
        appBar: AppBar(
          title: const Text('Konfirmasi Booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          centerTitle: true,
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 0,
          leading: IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: () => context.pop()),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                  child: Icon(Icons.calendar_month_rounded, size: 36, color: Colors.grey.shade400),
                ),
                const SizedBox(height: 16),
                const Text('Belum Lengkap', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                const SizedBox(height: 6),
                Text('Silakan pilih layanan, tanggal, dan jam terlebih dahulu.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back_rounded, size: 16),
                  label: const Text('Kembali'),
                  style: FilledButton.styleFrom(backgroundColor: DEKATColors.primary),
                ),
              ],
            ),
          ),
        ),
      );
    }
    final summaryAsync = ref.watch(bookingSummaryProvider('${widget.providerId}|${widget.serviceId!}|${widget.staffId ?? ''}'));
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Konfirmasi Booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: () => context.pop()),
      ),
      body: CustomScrollView(
        key: const PageStorageKey<String>('booking_form_scroll'),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                child: Row(children: [
                  _StepDot(number: '1', label: 'Jadwal', done: true),
                  Expanded(child: Container(height: 2, margin: const EdgeInsets.symmetric(horizontal: 6), decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.3), borderRadius: BorderRadius.circular(2)))),
                  _StepDot(number: '2', label: 'Konfirmasi', done: true),
                  Expanded(child: Container(height: 2, margin: const EdgeInsets.symmetric(horizontal: 6), decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(2)))),
                  _StepDot(number: '3', label: 'Bayar', done: false),
                ]),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: summaryAsync.when(
                data: (summary) => RepaintBoundary(
                  child: Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                    child: Column(children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.06), borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
                        child: Row(children: [
                          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.receipt_long_rounded, color: Colors.white, size: 20)),
                          const SizedBox(width: 12),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('Ringkasan Booking', style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.6)),
                            const SizedBox(height: 2),
                            Text(summary.providerName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ])),
                          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.shade100)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.verified_rounded, size: 14, color: Colors.green.shade600), const SizedBox(width: 4), Text(formatRupiah(summary.service.price), style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w800, fontSize: 12))])),
                        ]),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(children: [
                          _SummaryRow(label: 'Layanan', value: summary.service.name),
                          if (summary.staffName != null) ...[
                            const SizedBox(height: 6),
                            _SummaryRow(label: 'Staf', value: summary.staffName!),
                          ],
                          const SizedBox(height: 6),
                          _SummaryRow(label: 'Lokasi', value: summary.providerName),
                          const SizedBox(height: 12),
                          Row(children: [
                            Expanded(child: _InfoChip(icon: Icons.schedule_rounded, label: '${summary.service.durationMinutes} mnt', color: Colors.grey.shade700)),
                            const SizedBox(width: 8),
                            Expanded(child: _InfoChip(icon: Icons.calendar_today_rounded, label: widget.date!, color: DEKATColors.primary)),
                            const SizedBox(width: 8),
                            Expanded(child: _InfoChip(icon: Icons.access_time_rounded, label: widget.time!, color: Colors.orange.shade700)),
                          ]),
                          const SizedBox(height: 12),
                          // Bundle B: Deposit badge & policy
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.shade100)),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: summary.service.depositAmount > 0 ? Colors.amber.shade700 : Colors.grey.shade300, borderRadius: BorderRadius.circular(20)),
                                  child: Text(summary.service.depositAmount > 0 ? 'Deposit ${formatRupiah(summary.service.depositAmount)} Wajib' : 'Tanpa Deposit', style: TextStyle(color: summary.service.depositAmount > 0 ? Colors.white : Colors.grey.shade700, fontWeight: FontWeight.w800, fontSize: 11)),
                                ),
                                const Spacer(),
                                Icon(Icons.verified_user_rounded, size: 14, color: Colors.amber.shade700),
                                const SizedBox(width: 4),
                                Text('Via Midtrans/Xendit', style: TextStyle(color: Colors.amber.shade800, fontSize: 11, fontWeight: FontWeight.w600)),
                              ]),
                              const SizedBox(height: 8),
                              Text('Kebijakan: Pembatalan sebelum 24 jam = refund penuh. Setelah itu no refund. Reschedule gratis 1x, lebih = 409.', style: TextStyle(color: Colors.amber.shade900, fontSize: 11)),
                              const SizedBox(height: 6),
                              Divider(color: Colors.amber.shade100, height: 1),
                              const SizedBox(height: 6),
                              Row(children: [
                                Icon(Icons.info_outline_rounded, size: 12, color: Colors.amber.shade700),
                                const SizedBox(width: 4),
                                Text('Batas cancel: H-24 • Reschedule: 0/1', style: TextStyle(color: Colors.grey.shade700, fontSize: 11)),
                              ]),
                            ]),
                          ),
                        ]),
                      ),
                    ]),
                  ),
                ),
                loading: () => const ShimmerBox(height: 120),
                error: (e, _) => Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.shade100)),
                  child: Column(children: [
                    Row(children: [
                      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle), child: Icon(Icons.error_outline_rounded, color: Colors.red.shade400, size: 20)),
                      const SizedBox(width: 12),
                      Expanded(child: Text('Gagal memuat layanan', style: TextStyle(color: Colors.grey.shade800, fontWeight: FontWeight.w700))),
                    ]),
                    const SizedBox(height: 8),
                    Text(e.toString().replaceAll('Exception: ', ''), style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                    const SizedBox(height: 12),
                    SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: () => ref.invalidate(bookingSummaryProvider('${widget.providerId}|${widget.serviceId!}')), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba Lagi'))),
                  ]),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 8),
                  const Text('Catatan Khusus', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                  const SizedBox(width: 8),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(20)), child: Text('Opsional', style: TextStyle(color: Colors.grey.shade600, fontSize: 10, fontWeight: FontWeight.w700))),
                ]),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: TextFormField(
                    controller: _notesController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Contoh: Potongan pendek, jangan terlalu tipis...',
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.all(14),
                      prefixIcon: Padding(padding: const EdgeInsets.all(12), child: Icon(Icons.edit_note_rounded, color: Colors.grey.shade500, size: 20)),
                    ),
                  ),
                ),
              ]),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
              child: Row(children: [
                Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                const SizedBox(width: 8),
                const Text('Metode Pembayaran', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                const Spacer(),
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.shade100)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.lock_rounded, size: 11, color: Colors.green.shade700), const SizedBox(width: 4), Text('Aman', style: TextStyle(color: Colors.green.shade700, fontSize: 10, fontWeight: FontWeight.w800))])),
              ]),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                RepaintBoundary(child: _PaymentCard(title: 'Tunai', subtitle: 'Bayar di tempat', icon: Icons.money_rounded, iconBg: Colors.green.shade50, iconColor: Colors.green.shade600, value: 'CASH', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!))),
                const SizedBox(height: 10),
                RepaintBoundary(child: _PaymentCard(title: 'E-Wallet', subtitle: 'GoPay • OVO • Dana • LinkAja', icon: Icons.account_balance_wallet_rounded, iconBg: Colors.blue.shade50, iconColor: Colors.blue.shade600, value: 'E_WALLET', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!))),
                const SizedBox(height: 10),
                RepaintBoundary(child: _PaymentCard(title: 'Transfer Bank', subtitle: 'BCA • Mandiri • BRI • BNI', icon: Icons.account_balance_rounded, iconBg: Colors.orange.shade50, iconColor: Colors.orange.shade700, value: 'BANK_TRANSFER', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!))),
              ]),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.06), blurRadius: 16, offset: const Offset(0, -4))], border: Border(top: BorderSide(color: Colors.grey.shade100))),
        child: SafeArea(
          child: SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleBooking,
              style: ElevatedButton.styleFrom(backgroundColor: DEKATColors.primary, disabledBackgroundColor: Colors.grey.shade200, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: _isLoading ? 0 : 6, shadowColor: DEKATColors.primary.withValues(alpha:0.4)),
              child: _isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text('Konfirmasi Booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)), SizedBox(width: 8), Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white)]),
            ),
          ),
        ),
      ),
    );
  }

  String _wibDateTime(String date, String time) => '$date T$time:00+07:00'.replaceAll(' ', '');

  Future<void> _handleBooking() async {
    final summary = ref.read(bookingSummaryProvider('${widget.providerId}|${widget.serviceId!}|${widget.staffId ?? ''}')).valueOrNull;
    // Guard: jangan kirim hold yang pasti ditolak backend (400
    // "Start time must be before end time"). Dulu durasi 0 lolos karena
    // parser salah key → user bingung. Gagal cepat dengan pesan jelas.
    final durationMinutes = summary?.service.durationMinutes ?? 0;
    if (summary == null || durationMinutes <= 0) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Booking failed: durasi layanan tidak valid, coba lagi'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 4),
        ));
      }
      return;
    }
    setState(() => _isLoading = true);
    try {
      final customerId = await SecureStorageService.read(StorageKeys.userId);
      final api = ApiService();
      final startsAt = _wibDateTime(widget.date!, widget.time!);
      final endDateTime = DateTime.parse('${widget.date}T${widget.time}:00')
          .add(Duration(minutes: durationMinutes));
      final endsAt = '${endDateTime.year.toString().padLeft(4, '0')}-'
          '${endDateTime.month.toString().padLeft(2, '0')}-${endDateTime.day.toString().padLeft(2, '0')}T'
          '${endDateTime.hour.toString().padLeft(2, '0')}:${endDateTime.minute.toString().padLeft(2, '0')}:00+07:00';
      final holdRes = await api.createHold({
        'tenantId': widget.providerId,
        'locationId': widget.locationId,
        'serviceId': widget.serviceId,
        'staffId': widget.staffId,
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
        'currency': summary.service.currency,
        'notes': _notesController.text,
        'paymentMethod': _selectedPaymentMethod,
        'items': [
          {
            'serviceId': summary.service.id,
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
      final serverMsg = e.response?.data is Map<String, dynamic>
          ? (e.response?.data['message'] as String? ?? e.response?.data['error'] as String?)
          : null;
      final detail = serverMsg ?? e.error?.toString() ?? e.message ?? 'Unknown error';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Booking failed: $detail'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Booking failed: $e'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _StepDot extends StatelessWidget {
  final String number;
  final String label;
  final bool done;
  const _StepDot({required this.number, required this.label, required this.done});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(color: done ? DEKATColors.primary : Colors.white, shape: BoxShape.circle, border: Border.all(color: done ? DEKATColors.primary : Colors.grey.shade300)),
        child: Center(child: Text(number, style: TextStyle(color: done ? Colors.white : Colors.grey.shade500, fontWeight: FontWeight.w800, fontSize: 11))),
      ),
      const SizedBox(width: 6),
      Text(label, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: done ? DEKATColors.primary : Colors.grey.shade500)),
    ]);
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
      const SizedBox(width: 12),
      Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
    ]));
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoChip({required this.icon, required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color.withValues(alpha:0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withValues(alpha:0.15))),
      child: Row(mainAxisSize: MainAxisSize.min, mainAxisAlignment: MainAxisAlignment.center, children: [Icon(icon, size: 12, color: color), const SizedBox(width: 4), Flexible(child: Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 11)))]),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final String title, subtitle, value, groupValue;
  final IconData icon;
  final Color iconBg, iconColor;
  final ValueChanged<String?> onChanged;
  const _PaymentCard({required this.title, required this.subtitle, required this.icon, required this.iconBg, required this.iconColor, required this.value, required this.groupValue, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? DEKATColors.primary.withValues(alpha:0.06) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
        ),
        child: Row(children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: isSelected ? DEKATColors.primary : iconBg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: isSelected ? Colors.white : iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isSelected ? DEKATColors.primary : Colors.black87)),
              if (value == 'E_WALLET') ...[
                const SizedBox(width: 8),
                Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.shade100)), child: Text('Populer', style: TextStyle(color: Colors.green.shade700, fontSize: 10, fontWeight: FontWeight.w800))),
              ],
            ]),
            const SizedBox(height: 2),
            Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
          ])),
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: isSelected ? DEKATColors.primary : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: isSelected ? DEKATColors.primary : Colors.grey.shade300),
            ),
            child: Icon(isSelected ? Icons.check_rounded : Icons.circle_outlined, size: 14, color: isSelected ? Colors.white : Colors.grey.shade400),
          ),
        ]),
      ),
    );
  }
}
