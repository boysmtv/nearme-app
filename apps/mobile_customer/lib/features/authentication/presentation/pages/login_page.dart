import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_customer/core/router/app_router.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _useOtp = false;
  bool _otpRequested = false;
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
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
    });

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 28),
                TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 700), curve: Curves.elasticOut, builder: (c,v,ch)=> Transform.scale(scale: 0.7+0.3*v, child: ch), child: Container(
                  width: 86, height: 86,
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(22), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 20, offset: const Offset(0, 8))]),
                  child: const Icon(Icons.spa_rounded, size: 44, color: Colors.white),
                )),
                const SizedBox(height: 16),
                TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12*(1-v)), child: ch)), child: Column(children: [
                  Text('DEKAT', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -1, color: DEKATColors.textPrimary)),
                  const SizedBox(height: 6),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.1)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]), child: Text('Find and book services near you ✨', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))),
                ])),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.07), blurRadius: 16, offset: const Offset(0, 6))]),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                    Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text(_useOtp ? 'Login with OTP' : 'Welcome Back 👋', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16))]),
                    const SizedBox(height: 16),
                    TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.email_rounded, color: DEKATColors.primary, size: 18)),
                    filled: true, fillColor: DEKATColors.backgroundLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Please enter your email';
                    if (!value.contains('@') || !value.contains('.')) return 'Please enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                if (!_useOtp) ...[
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softLavender.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.lock_rounded, color: Color(0xFF9B7CFF), size: 18)),
                      suffixIcon: IconButton(
                        icon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)), child: Icon(_obscurePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded, size: 16, color: Colors.grey[600])),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      filled: true, fillColor: DEKATColors.backgroundLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Please enter your password';
                      if (value.length < 6) return 'Password must be at least 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.push('/forgot-password'),
                      style: TextButton.styleFrom(foregroundColor: DEKATColors.primary),
                      child: const Text('Forgot Password?', style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                ] else ...[
                  TextFormField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    enabled: _otpRequested,
                    decoration: InputDecoration(
                      labelText: 'OTP Code',
                      prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.pin_rounded, color: DEKATColors.success, size: 18)),
                      counterText: '',
                      hintText: _otpRequested ? 'Enter 6-digit code' : 'Request an OTP first',
                      helperText: _otpRequested ? 'OTP sent to ${_emailController.text} ✨' : null,
                      helperStyle: const TextStyle(color: DEKATColors.success, fontWeight: FontWeight.w600, fontSize: 12),
                      filled: true, fillColor: _otpRequested ? Colors.white : Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: _otpRequested ? DEKATColors.success.withValues(alpha: 0.3) : Colors.grey[200]!)),
                    ),
                    validator: (value) {
                      if (!_otpRequested) return null;
                      if (value == null || value.isEmpty) return 'Please enter the OTP code';
                      if (value.length != 6) return 'OTP must be 6 digits';
                      return null;
                    },
                  ),
                ],
                const SizedBox(height: 18),
                Container(
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 4))]),
                  child: ElevatedButton(
                    onPressed: authState.isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 15), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: authState.isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(_useOtp ? Icons.pin_rounded : Icons.login_rounded, color: Colors.white, size: 18), const SizedBox(width: 8), Text(_useOtp ? (_otpRequested ? 'Verify OTP ✨' : 'Request OTP') : 'Login', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _useOtp = !_useOtp;
                      _otpRequested = false;
                      _otpController.clear();
                    });
                    ref.read(authProvider.notifier).clearError();
                  },
                  style: TextButton.styleFrom(foregroundColor: DEKATColors.primary),
                  child: Text(_useOtp ? 'Login with Password instead' : 'Login with OTP instead', style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                  ]),
                ),
                const SizedBox(height: 16),
                Row(children: [Expanded(child: Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.transparent, Colors.grey[200]!])))), Padding(padding: const EdgeInsets.symmetric(horizontal: 14), child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)), child: Text('OR', style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.w700, fontSize: 11)))) , Expanded(child: Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.grey[200]!, Colors.transparent]))))]),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]),
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6), border: Border.all(color: Colors.grey[200]!)), child: const Icon(Icons.g_mobiledata_rounded, size: 20, color: DEKATColors.error)),
                    label: const Text('Continue with Google', style: TextStyle(fontWeight: FontWeight.w600, color: DEKATColors.textPrimary)),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), side: BorderSide.none, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text("Don't have an account?", style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w500)), TextButton(onPressed: () => context.push('/register'), style: TextButton.styleFrom(foregroundColor: DEKATColors.primary), child: const Text('Sign Up ✨', style: TextStyle(fontWeight: FontWeight.w800)))]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      if (_useOtp) {
        if (!_otpRequested) {
          ref.read(authProvider.notifier).requestOtp(_emailController.text).then((_) {
            if (mounted && ref.read(authProvider).error == null) {
              setState(() => _otpRequested = true);
            }
          });
        } else {
          ref.read(authProvider.notifier).verifyOtp(
                _emailController.text,
                _otpController.text,
              );
        }
      } else {
        ref.read(authProvider.notifier).login(
              _emailController.text,
              _passwordController.text,
            );
      }
    }
  }
}
