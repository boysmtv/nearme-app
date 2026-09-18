import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_partner/core/router/app_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

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

  @override
  void dispose() { _emailController.dispose(); _passwordController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(partnerAuthProvider);
    ref.listen<PartnerAuthState>(partnerAuthProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.error!), backgroundColor: Colors.red));
        ref.read(partnerAuthProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              RepaintBoundary(
                child: Container(
                  padding:
                      const EdgeInsets.fromLTRB(24, 40, 24, 72),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [DEKATColors.primary, Color(0xFF8B7CFF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(28),
                      bottomRight: Radius.circular(28),
                    ),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.business_center_rounded,
                            size: 36, color: Colors.white),
                      ),
                      const SizedBox(height: 14),
                      const Text('DEKAT Partner',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Text('Kelola bisnis Anda dalam genggaman',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color:
                                  Colors.white.withValues(alpha: 0.9),
                              fontSize: 13)),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                child: Transform.translate(
                  offset: const Offset(0, -48),
                  child: RepaintBoundary(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border:
                            Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: DEKATColors.primary
                                .withValues(alpha: 0.08),
                            blurRadius: 24,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.stretch,
                          children: [
                            const Text('Selamat Datang Kembali',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 17)),
                            const SizedBox(height: 4),
                            Text('Masuk untuk mengelola booking & layanan',
                                style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 12)),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              decoration: InputDecoration(
                                labelText: 'Email',
                                hintText: 'nama@bisnis.id',
                                prefixIcon: const Icon(
                                    Icons.email_outlined,
                                    color: DEKATColors.primary),
                                border: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.circular(12)),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Please enter your email';
                                if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              decoration: InputDecoration(
                                labelText: 'Password',
                                hintText: '••••••••',
                                prefixIcon: const Icon(
                                    Icons.lock_outlined,
                                    color: DEKATColors.primary),
                                suffixIcon: IconButton(
                                    icon: Icon(_obscurePassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined),
                                    onPressed: () => setState(() =>
                                        _obscurePassword =
                                            !_obscurePassword)),
                                border: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.circular(12)),
                              ),
                              validator: (v) => (v == null || v.isEmpty) ? 'Please enter your password' : null,
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              height: 50,
                              child: ElevatedButton(
                                onPressed:
                                    authState.isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: DEKATColors.primary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)),
                                ),
                                child: authState.isLoading
                                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Text('Login',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w800,
                                            fontSize: 15)),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                  onPressed: () {},
                                  child: const Text('Forgot Password?',
                                      style: TextStyle(
                                          color: DEKATColors.primary,
                                          fontWeight: FontWeight.w700))),
                            ),
                            const Divider(height: 24),
                            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Text("Don't have an account?",
                                  style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 13)),
                              TextButton(
                                  onPressed: () =>
                                      context.push('/onboarding'),
                                  child: const Text('Register',
                                      style: TextStyle(
                                          color: DEKATColors.primary,
                                          fontWeight: FontWeight.w800))),
                            ]),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      ref.read(partnerAuthProvider.notifier).login(_emailController.text, _passwordController.text);
    }
  }
}
