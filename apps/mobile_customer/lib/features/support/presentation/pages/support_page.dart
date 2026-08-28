import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class SupportPage extends ConsumerStatefulWidget {
  const SupportPage({super.key});
  @override
  ConsumerState<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends ConsumerState<SupportPage> {
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedCategory = 'general';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.support_agent_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Help & Support', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
      ),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFA2D2FF)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.18), blurRadius: 16, offset: const Offset(0, 6))]),
            child: Row(children: [
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.headset_mic_rounded, color: DEKATColors.primary, size: 22)),
              const SizedBox(width: 12),
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Butuh bantuan?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)), SizedBox(height: 3), Text('Tim DEKAT siap membantu 24/7 ✨', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500))])) ,
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.3))), child: const Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.circle, size: 8, color: Colors.greenAccent), SizedBox(width: 4), Text('Online', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))])),
            ]),
          )),
          const SizedBox(height: 18),
          Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), const Text('Submit a Ticket', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)), const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)), child: const Text('Respon cepat ⚡', style: TextStyle(color: DEKATColors.primary, fontSize: 11, fontWeight: FontWeight.w700)))]),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
            child: Column(children: [
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: InputDecoration(labelText: 'Category', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softViolet.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.category_rounded, color: DEKATColors.primary, size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                items: const [
                  DropdownMenuItem(value: 'general', child: Row(children: [Icon(Icons.help_rounded, size: 16, color: DEKATColors.primary), SizedBox(width: 8), Text('General Inquiry')])),
                  DropdownMenuItem(value: 'booking', child: Row(children: [Icon(Icons.calendar_month_rounded, size: 16, color: DEKATColors.success), SizedBox(width: 8), Text('Booking Issue')])),
                  DropdownMenuItem(value: 'payment', child: Row(children: [Icon(Icons.payments_rounded, size: 16, color: Color(0xFFFF9F43)), SizedBox(width: 8), Text('Payment Issue')])),
                  DropdownMenuItem(value: 'account', child: Row(children: [Icon(Icons.person_rounded, size: 16, color: DEKATColors.info), SizedBox(width: 8), Text('Account Issue')])),
                ],
                onChanged: (v) => setState(() => _selectedCategory = v!),
              ),
              const SizedBox(height: 14),
              TextField(controller: _subjectController, decoration: InputDecoration(labelText: 'Subject', hintText: 'e.g. Booking not confirmed', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softPeach.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.subject_rounded, color: Color(0xFFFF9F43), size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 14),
              TextField(controller: _messageController, maxLines: 5, decoration: InputDecoration(labelText: 'Message', hintText: 'Describe your issue in detail...', alignLabelWithHint: true, prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softMint.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.message_rounded, color: DEKATColors.success, size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 12, offset: const Offset(0, 4))]),
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTicket,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.send_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Submit Ticket ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 16),
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.06))), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.info_rounded, color: DEKATColors.primary, size: 14)), const SizedBox(width: 8), Expanded(child: Text('Biasanya dibalas dalam 2-4 jam kerja • Fast response', style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w500)))])),
        ],
      ),
    );
  }

  Future<void> _submitTicket() async {
    if (_subjectController.text.isEmpty || _messageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields'), backgroundColor: DEKATColors.warning, showCloseIcon: true));
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      await ApiService().submitSupportTicket({
        'category': _selectedCategory,
        'subject': _subjectController.text,
        'message': _messageController.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket submitted! 🎉'), backgroundColor: DEKATColors.success));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: DEKATColors.error));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
