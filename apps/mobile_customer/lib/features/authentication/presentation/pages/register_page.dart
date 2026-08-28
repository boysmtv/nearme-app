import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_customer/core/router/app_router.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: DEKATColors.error),
        );
        ref.read(authProvider.notifier).clearError();
      }
      if ((prev == null || !prev.isLoggedIn) && next.isLoggedIn && mounted) {
        context.go('/discovery');
      }
    });

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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [Container(width: 4, height: 28, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 10), Text('Create Account ✨', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.4))]),
                  const SizedBox(height: 8),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08))), child: Text('Sign up to get started with DEKAT', style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))),
                ])),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
                  child: Column(children: [
                    TextFormField(
                      controller: _nameController,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(labelText: 'Full Name', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.person_rounded, color: DEKATColors.primary, size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Please enter your name';
                        if (v.trim().length < 2) return 'Name must be at least 2 characters';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(labelText: 'Email', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softSky.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.email_rounded, color: DEKATColors.info, size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Please enter your email';
                        if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(labelText: 'Phone Number', hintText: '+62 xxx xxxx xxxx', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.phone_rounded, color: DEKATColors.success, size: 18)), filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Please enter your phone number';
                        if (v.length < 10) return 'Please enter a valid phone number';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softLavender.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.lock_rounded, color: Color(0xFF9B7CFF), size: 18)),
                        suffixIcon: IconButton(icon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)), child: Icon(_obscurePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded, size: 16, color: Colors.grey[600])), onPressed: () => setState(() => _obscurePassword = !_obscurePassword)),
                        filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Please enter a password';
                        if (v.length < 8) return 'Password must be at least 8 characters';
                        if (!RegExp(r'(?=.*[A-Z])').hasMatch(v)) return 'Include at least one uppercase letter';
                        if (!RegExp(r'(?=.*[0-9])').hasMatch(v)) return 'Include at least one number';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      decoration: InputDecoration(
                        labelText: 'Confirm Password',
                        prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softPeach.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.lock_rounded, color: Color(0xFFFF9F43), size: 18)),
                        suffixIcon: IconButton(icon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)), child: Icon(_obscureConfirmPassword ? Icons.visibility_rounded : Icons.visibility_off_rounded, size: 16, color: Colors.grey[600])), onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword)),
                        filled: true, fillColor: DEKATColors.backgroundLight, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                      validator: (v) {
                        if (v != _passwordController.text) return 'Passwords do not match';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: _acceptTerms ? DEKATColors.primary.withValues(alpha: 0.18) : Colors.grey[200]!)),
                      child: Row(
                        children: [
                          Transform.scale(scale: 0.9, child: Checkbox(value: _acceptTerms, onChanged: (v) => setState(() => _acceptTerms = v ?? false), activeColor: DEKATColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)), side: BorderSide(color: Colors.grey[300]!))),
                          Expanded(
                            child: Text.rich(
                              TextSpan(
                                text: 'I agree to the ',
                                children: [
                                  TextSpan(text: 'Terms of Service', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700)),
                                  const TextSpan(text: ' and '),
                                  TextSpan(text: 'Privacy Policy', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700)),
                                ],
                              ),
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(gradient: _acceptTerms ? const LinearGradient(colors: DEKATColors.softViolet) : null, color: _acceptTerms ? null : Colors.grey[200], borderRadius: BorderRadius.circular(14), boxShadow: _acceptTerms ? [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 12, offset: const Offset(0, 4))] : null),
                      child: ElevatedButton(
                        onPressed: (_acceptTerms && !authState.isLoading) ? _handleRegister : null,
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, disabledBackgroundColor: Colors.transparent, disabledForegroundColor: Colors.grey[500], padding: const EdgeInsets.symmetric(vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                        child: authState.isLoading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.person_add_rounded, color: Colors.white, size: 18), const SizedBox(width: 8), Text('Create Account ✨', style: TextStyle(color: _acceptTerms ? Colors.white : Colors.grey[600], fontWeight: FontWeight.w700))]),
                      ),
                    ),
                  ]),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text('Already have an account?', style: TextStyle(color: Colors.grey[600])), TextButton(onPressed: () => context.pop(), style: TextButton.styleFrom(foregroundColor: DEKATColors.primary), child: const Text('Login', style: TextStyle(fontWeight: FontWeight.w800)))],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleRegister() {
    if (_formKey.currentState!.validate()) {
      ref.read(authProvider.notifier).register({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'password': _passwordController.text,
      });
    }
  }
}
