import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
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
        appBar: AppBar(title: const Text('Book Service')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Please pick a service, date and time first.'),
              TextButton(onPressed: () => context.pop(), child: const Text('Go Back')),
            ],
          ),
        ),
      );
    }
    final summaryAsync = ref.watch(bookingSummaryProvider({'providerId': widget.providerId, 'serviceId': widget.serviceId!}));
    return Scaffold(
      appBar: AppBar(title: const Text('Book Service')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          summaryAsync.when(
            data: (summary) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Service Summary', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _SummaryRow(label: 'Provider', value: summary.providerName),
              _SummaryRow(label: 'Service', value: summary.service.name),
              _SummaryRow(label: 'Duration', value: '${summary.service.durationMinutes} min'),
              _SummaryRow(label: 'Date', value: widget.date!),
              _SummaryRow(label: 'Time', value: widget.time!),
              _SummaryRow(label: 'Price', value: formatRupiah(summary.service.price)),
            ]))),
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
            error: (e, _) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
              Text('Failed to load service: $e'),
              TextButton(
                onPressed: () => ref.invalidate(bookingSummaryProvider({'providerId': widget.providerId, 'serviceId': widget.serviceId!})),
                child: const Text('Retry'),
              ),
            ]))),
          ),
          const SizedBox(height: 16),
          Text('Special Notes', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(controller: _notesController, maxLines: 3, decoration: const InputDecoration(hintText: 'Any special requests...')),
          const SizedBox(height: 24),
          Text('Payment Method', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _PaymentOption(title: 'Cash', subtitle: 'Pay at the venue', icon: Icons.money, value: 'cash', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
          _PaymentOption(title: 'E-Wallet', subtitle: 'GoPay, OVO, Dana', icon: Icons.account_balance_wallet, value: 'ewallet', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
          _PaymentOption(title: 'Bank Transfer', subtitle: 'BCA, Mandiri, BRI', icon: Icons.account_balance, value: 'bank', groupValue: _selectedPaymentMethod, onChanged: (v) => setState(() => _selectedPaymentMethod = v!)),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: ElevatedButton(
          onPressed: _isLoading ? null : _handleBooking,
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Confirm Booking'),
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
          backgroundColor: Colors.red,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Booking failed: $e'),
          backgroundColor: Colors.red,
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
  const _SummaryRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: Colors.grey[600])),
      Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold))),
    ]));
  }
}

class _PaymentOption extends StatelessWidget {
  final String title, subtitle, value, groupValue;
  final IconData icon;
  final ValueChanged<String?> onChanged;
  const _PaymentOption({required this.title, required this.subtitle, required this.icon, required this.value, required this.groupValue, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    return Card(margin: const EdgeInsets.only(bottom: 8), child: RadioListTile<String>(
      title: Text(title), subtitle: Text(subtitle), secondary: Icon(icon),
      value: value, groupValue: groupValue, onChanged: onChanged, activeColor: Theme.of(context).colorScheme.primary,
    ));
  }
}
