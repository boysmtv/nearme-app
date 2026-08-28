import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_partner/core/router/app_router.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});
  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  late AnimationController _anim;
  late Animation<double> _fade;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fade = CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic);
    _slide = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic));
    _anim.forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(partnerAuthProvider);
    ref.listen<PartnerAuthState>(partnerAuthProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(children: [const Icon(Icons.error_outline_rounded, color: Colors.white, size: 18), const SizedBox(width: 8), Expanded(child: Text(next.error!))]),
          backgroundColor: DEKATColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
        ref.read(partnerAuthProvider.notifier).clearError();
      }
    });

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: Stack(
        children: [
          // soft blobs background
          Positioned(top: -60, right: -40, child: _Blob(color: DEKATColors.primary.withValues(alpha: 0.10), size: 220)),
          Positioned(top: 120, left: -30, child: _Blob(color: DEKATColors.secondary.withValues(alpha: 0.08), size: 160)),
          Positioned(bottom: -30, right: -20, child: _Blob(color: DEKATColors.softMint[0].withValues(alpha: 0.14), size: 200)),
          Positioned(bottom: 180, left: -10, child: _Blob(color: DEKATColors.softSky[0].withValues(alpha: 0.10), size: 140)),
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(24),
              child: FadeTransition(
                opacity: _fade,
                child: SlideTransition(
                  position: _slide,
                  child: Form(
                    key: _formKey,
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      const SizedBox(height: 28),
                      Hero(
                        tag: 'logo',
                        child: Center(
                          child: Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight),
                              borderRadius: BorderRadius.circular(22),
                              boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 18, offset: const Offset(0, 8))],
                            ),
                            child: const Icon(Icons.storefront_rounded, size: 42, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text('DEKAT Partner',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.6, color: DEKATColors.textPrimary)),
                      const SizedBox(height: 6),
                      Text('Kelola bisnismu dengan mudah & cantik ✨',
                          textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: DEKATColors.textSecondary)),
                      const SizedBox(height: 10),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF7ED8A6), shape: BoxShape.circle)),
                            const SizedBox(width: 6),
                            Text('Trusted by 1.200+ partners', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: DEKATColors.primary.withValues(alpha: 0.9))),
                          ]),
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Form card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, 8))],
                          border: Border.all(color: Colors.grey[100]!),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                          _SoftFieldLabel(icon: Icons.email_outlined, label: 'Email', color: DEKATColors.softSky),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              hintText: 'budi@barbershopcentral.id',
                              prefixIcon: Container(
                                margin: const EdgeInsets.all(8),
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: DEKATColors.softSky[1], borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.email_rounded, size: 18, color: Color(0xFF5AA9E6)),
                              ),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) return 'Please enter your email';
                              if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          _SoftFieldLabel(icon: Icons.lock_outline_rounded, label: 'Password', color: DEKATColors.softLavender),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              hintText: '••••••••',
                              prefixIcon: Container(
                                margin: const EdgeInsets.all(8),
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: DEKATColors.softLavender[1], borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.lock_rounded, size: 18, color: Color(0xFF9A7BFF)),
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: DEKATColors.textHint),
                                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Please enter your password' : null,
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            height: 52,
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [DEKATColors.primary, Color(0xFFA48BFF)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 6))],
                              ),
                              child: ElevatedButton(
                                onPressed: authState.isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                                child: authState.isLoading
                                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                        const Text('Masuk', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                        const SizedBox(width: 8),
                                        Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle), child: const Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.white)),
                                      ]),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Center(child: TextButton(onPressed: () {}, child: Text('Lupa Password?', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w600)))),
                        ]),
                      ),
                      const SizedBox(height: 18),
                      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Text("Belum punya akun?", style: TextStyle(color: DEKATColors.textSecondary, fontSize: 13)),
                        TextButton(onPressed: () => context.push('/onboarding'), child: Text('Daftar Sekarang', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700))),
                      ]),
                      const SizedBox(height: 8),
                      // trust row
                      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        _TrustChip(icon: Icons.verified_rounded, label: 'Aman', color: DEKATColors.softMint),
                        const SizedBox(width: 8),
                        _TrustChip(icon: Icons.bolt_rounded, label: 'Cepat', color: DEKATColors.softPeach),
                        const SizedBox(width: 8),
                        _TrustChip(icon: Icons.favorite_rounded, label: 'Terpercaya', color: DEKATColors.softPink),
                      ]),
                    ]),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      ref.read(partnerAuthProvider.notifier).login(_emailController.text.trim(), _passwordController.text);
    }
  }
}

class _SoftFieldLabel extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<Color> color;
  const _SoftFieldLabel({required this.icon, required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(gradient: LinearGradient(colors: color), borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 14, color: Colors.white)),
      const SizedBox(width: 8),
      Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: DEKATColors.textPrimary)),
    ]);
  }
}

class _TrustChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<Color> color;
  const _TrustChip({required this.icon, required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color[1], borderRadius: BorderRadius.circular(20), border: Border.all(color: color[0].withValues(alpha: 0.25))),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: color[0]),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color[0])),
      ]),
    );
  }
}

class _Blob extends StatelessWidget {
  final Color color;
  final double size;
  const _Blob({required this.color, required this.size});
  @override
  Widget build(BuildContext context) {
    return Container(width: size, height: size, decoration: BoxDecoration(color: color, shape: BoxShape.circle));
  }
}
