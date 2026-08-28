import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _emailSent = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Container(margin: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(10)), child: IconButton(icon: const Icon(Icons.arrow_back_rounded, size: 18), onPressed: () => context.pop())),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: _emailSent ? _buildSuccessView() : _buildFormView(),
        ),
      ),
    );
  }

  Widget _buildFormView() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 600), curve: Curves.easeOutBack, builder: (c,v,ch)=> Transform.scale(scale: 0.8+0.2*v, child: ch), child: Container(width: 86, height: 86, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(22), boxShadow: [BoxShadow(color: const Color(0xFFFF9F43).withValues(alpha: 0.22), blurRadius: 18, offset: const Offset(0, 6))]), child: const Icon(Icons.lock_reset_rounded, size: 42, color: Colors.white))),
          const SizedBox(height: 20),
          TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(children: [
            Text('Forgot Password? 🔑', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.4)),
            const SizedBox(height: 8),
            Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08))), child: Text("Enter your email and we'll send you a reset link ✨", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))),
          ])),
          const SizedBox(height: 28),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: 'Email', hintText: 'your@email.com', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softPeach.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.email_rounded, color: Color(0xFFFF9F43), size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Please enter your email';
                  if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 18),
              Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: const Color(0xFFFF9F43).withValues(alpha: 0.22), blurRadius: 12, offset: const Offset(0, 4))]), child: ElevatedButton(onPressed: _isLoading ? null : _handleSendResetLink, style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.send_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Send Reset Link ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]))),
              const SizedBox(height: 10),
              TextButton(onPressed: () => context.pop(), style: TextButton.styleFrom(foregroundColor: Colors.grey[600]), child: const Text('Back to Login', style: TextStyle(fontWeight: FontWeight.w600))),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 600), curve: Curves.easeOutBack, builder: (c,v,ch)=> Transform.scale(scale: 0.85+0.15*v, child: Opacity(opacity: v.clamp(0,1), child: ch)), child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(width: 100, height: 100, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint, begin: Alignment.topLeft, end: Alignment.bottomRight), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.24), blurRadius: 20, offset: const Offset(0, 8))]), child: const Icon(Icons.mark_email_read_rounded, size: 48, color: Colors.white)),
        const SizedBox(height: 20),
        Text('Check Your Email 📧', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.successLight)), child: Column(children: [
          Text("We've sent a password reset link to", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 4),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(8)), child: Text(_emailController.text, textAlign: TextAlign.center, style: const TextStyle(color: DEKATColors.success, fontWeight: FontWeight.w700, fontSize: 13))),
        ])),
        const SizedBox(height: 24),
        Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.22), blurRadius: 12)]), child: ElevatedButton(onPressed: () => context.go('/login'), style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 32), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Text('Back to Login', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)))),
        const SizedBox(height: 12),
        TextButton(onPressed: _handleSendResetLink, style: TextButton.styleFrom(foregroundColor: DEKATColors.primary), child: const Text('Resend Email', style: TextStyle(fontWeight: FontWeight.w600))),
      ],
    ));
  }

  Future<void> _handleSendResetLink() async {
    if (_emailSent) {
      // resend without validation
      setState(() => _isLoading = true);
      try {
        await ApiService().forgotPassword(_emailController.text.trim());
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reset link resent ✨'), backgroundColor: DEKATColors.success));
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to send reset link: $e'), backgroundColor: DEKATColors.error));
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
      return;
    }
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        await ApiService().forgotPassword(_emailController.text.trim());
        setState(() {
          _isLoading = false;
          _emailSent = true;
        });
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to send reset link: $e'), backgroundColor: DEKATColors.error),
          );
        }
      }
    }
  }
}
