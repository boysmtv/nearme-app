import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/utils/format_rupiah.dart';

/// Desain modern: hero total + stepper + kartu metode + rincian + jaminan aman.
/// Tanpa animasi entry (pelajaran Mi A1) dan tanpa Radio deprecated.
class PaymentPage extends ConsumerStatefulWidget {
  final String bookingId;
  final String? tenantId;
  final num amount;
  final String currency;
  const PaymentPage({
    super.key,
    required this.bookingId,
    this.tenantId,
    required this.amount,
    required this.currency,
  });

  @override
  ConsumerState<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentMethod {
  final String id;
  final String title;
  final String desc;
  final IconData icon;
  final Color softBg;
  final Color iconColor;
  const _PaymentMethod({
    required this.id,
    required this.title,
    required this.desc,
    required this.icon,
    required this.softBg,
    required this.iconColor,
  });
}

const _methods = [
  _PaymentMethod(
    id: 'ewallet',
    title: 'E-Wallet',
    desc: 'GoPay • OVO • DANA • ShopeePay',
    icon: Icons.account_balance_wallet_rounded,
    softBg: Color(0xFFEFEDFF),
    iconColor: Color(0xFF6C63FF),
  ),
  _PaymentMethod(
    id: 'bank',
    title: 'Transfer Bank',
    desc: 'BCA • Mandiri • BRI • BNI',
    icon: Icons.account_balance_rounded,
    softBg: Color(0xFFE8F4FF),
    iconColor: Color(0xFF2196F3),
  ),
  _PaymentMethod(
    id: 'card',
    title: 'Kartu Kredit / Debit',
    desc: 'Visa • Mastercard • JCB',
    icon: Icons.credit_card_rounded,
    softBg: Color(0xFFFFF0E0),
    iconColor: Color(0xFFFF9800),
  ),
  _PaymentMethod(
    id: 'cash',
    title: 'Tunai di Tempat',
    desc: 'Bayar langsung ke provider',
    icon: Icons.money_rounded,
    softBg: Color(0xFFE6F7EE),
    iconColor: Color(0xFF4CAF50),
  ),
];

class _PaymentPageState extends ConsumerState<PaymentPage> {
  String _selectedMethod = 'ewallet';
  bool _isProcessing = false;

  _PaymentMethod get _selected =>
      _methods.firstWhere((m) => m.id == _selectedMethod);

  String get _shortCode {
    final id = widget.bookingId.replaceAll('-', '');
    return id.length <= 8 ? id.toUpperCase() : id.substring(0, 8).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final primary = DEKATColors.primary;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Pembayaran',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _StepIndicator(),
            const SizedBox(height: 16),
            // Hero: total tagihan
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primary, primary.withValues(alpha: 0.75)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: primary.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Pembayaran',
                          style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('Kode: $_shortCode',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    formatRupiah(widget.amount),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_selected.icon, size: 16, color: primary),
                        const SizedBox(width: 6),
                        Text(_selected.title,
                            style: TextStyle(
                                color: primary,
                                fontSize: 12,
                                fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text('Metode Pembayaran',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Pilih salah satu metode di bawah ini',
                style: TextStyle(color: Colors.grey[600], fontSize: 12)),
            const SizedBox(height: 12),
            ..._methods.map((m) {
              final selected = m.id == _selectedMethod;
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => setState(() => _selectedMethod = m.id),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selected
                              ? primary.withValues(alpha: 0.06)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color:
                                selected ? primary : Colors.grey.shade200,
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: m.softBg,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(m.icon,
                                  color: m.iconColor, size: 24),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(m.title,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 14)),
                                  const SizedBox(height: 2),
                                  Text(m.desc,
                                      style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 12)),
                                ],
                              ),
                            ),
                            Icon(
                              selected
                                  ? Icons.check_circle_rounded
                                  : Icons.circle_outlined,
                              color: selected
                                  ? primary
                                  : Colors.grey[300],
                              size: 24,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
            const SizedBox(height: 8),
            // Rincian pesanan
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Rincian Pesanan',
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  _SummaryRow(
                      label: 'Kode Booking', value: _shortCode, mono: true),
                  _SummaryRow(
                      label: 'Metode', value: _selected.title),
                  _SummaryRow(
                      label: 'Status', value: 'Menunggu pembayaran'),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Tagihan',
                          style: TextStyle(fontWeight: FontWeight.w800)),
                      Text(formatRupiah(widget.amount),
                          style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 18,
                              color: primary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Jaminan aman
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE6F7EE),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lock_rounded,
                      size: 18, color: Color(0xFF4CAF50)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Transaksi terenkripsi & aman. Konfirmasi otomatis setelah pembayaran berhasil.',
                      style: TextStyle(
                          color: Colors.grey[800], fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _handlePayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
              child: _isProcessing
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Text('Bayar ${formatRupiah(widget.amount)}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 15)),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handlePayment() async {
    setState(() => _isProcessing = true);
    try {
      await ApiService().dio.post(
            '/bookings/${widget.bookingId}/payment-intents',
            data: {
              'tenantId': widget.tenantId,
              'amount': widget.amount,
              'currency': widget.currency,
              'method': _selectedMethod,
            },
          );
      if (mounted) {
        context.push('/payment/success'
            '?bookingId=${widget.bookingId}'
            '&amount=${widget.amount}'
            '&currency=${Uri.encodeComponent(widget.currency)}'
            '&method=$_selectedMethod');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Payment failed: ${e.error ?? e.message}'),
          backgroundColor: Colors.red,
        ));
        setState(() => _isProcessing = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Payment failed: $e'),
          backgroundColor: Colors.red,
        ));
        setState(() => _isProcessing = false);
      }
    }
  }
}

/// Stepper statis: Booking → Pembayaran → Selesai.
class _StepIndicator extends StatelessWidget {
  const _StepIndicator();

  Widget _dot(bool done, bool active) {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: done || active ? DEKATColors.primary : Colors.grey.shade300,
      ),
      child: Icon(
        done ? Icons.check_rounded : Icons.circle,
        size: 13,
        color: done
            ? Colors.white
            : (active ? Colors.white : Colors.transparent),
      ),
    );
  }

  Widget _line(bool done) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        color: done ? DEKATColors.primary : Colors.grey.shade300,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _dot(true, false),
        const SizedBox(width: 4),
        const Text('Booking',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
        _line(true),
        _dot(false, true),
        const SizedBox(width: 4),
        const Text('Pembayaran',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
        _line(false),
        _dot(false, false),
        const SizedBox(width: 4),
        Text('Selesai',
            style: TextStyle(fontSize: 11, color: Colors.grey[500])),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label, value;
  final bool mono;
  const _SummaryRow({required this.label, required this.value, this.mono = false});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Flexible(
            child: Text(
              value,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                fontFamily: mono ? 'monospace' : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
