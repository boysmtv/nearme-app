import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class BookingFormPage extends ConsumerStatefulWidget {
  final String providerId;
  final String serviceId;
  const BookingFormPage({super.key, required this.providerId, required this.serviceId});
  @override
  ConsumerState<BookingFormPage> createState() => _BookingFormPageState();
}

class _BookingFormPageState extends ConsumerState<BookingFormPage> {
  final _notesController = TextEditingController();
  String _selectedPaymentMethod = 'cash';
  bool _isLoading = false;

  @override
  void dispose() { _notesController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Service')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Service Summary', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _SummaryRow(label: 'Provider', value: widget.providerId),
            _SummaryRow(label: 'Service', value: widget.serviceId),
          ]))),
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
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: ElevatedButton(
          onPressed: _isLoading ? null : _handleBooking,
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Confirm Booking'),
        )),
      ),
    );
  }

  Future<void> _handleBooking() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService().createBooking({
        'provider_id': widget.providerId,
        'service_id': widget.serviceId,
        'payment_method': _selectedPaymentMethod,
        'notes': _notesController.text,
      });
      final bookingId = response.data['data']['id'] as String;
      if (mounted) context.push('/booking/confirm?bookingId=');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Booking failed: '), backgroundColor: Colors.red));
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
      Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
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