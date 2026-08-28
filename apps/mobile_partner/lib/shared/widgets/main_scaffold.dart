import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  static const _tabs = [
    _TabMeta(icon: Icons.calendar_month_outlined, active: Icons.calendar_month_rounded, label: 'Calendar', gradient: DEKATColors.softViolet),
    _TabMeta(icon: Icons.receipt_long_outlined, active: Icons.receipt_long_rounded, label: 'Bookings', gradient: DEKATColors.softSky),
    _TabMeta(icon: Icons.account_balance_wallet_outlined, active: Icons.account_balance_wallet_rounded, label: 'Earnings', gradient: DEKATColors.softMint),
    _TabMeta(icon: Icons.people_outline_rounded, active: Icons.people_rounded, label: 'Staff', gradient: DEKATColors.softLavender),
    _TabMeta(icon: Icons.bar_chart_outlined, active: Icons.bar_chart_rounded, label: 'Reports', gradient: DEKATColors.softPeach),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/bookings')) return 1;
    if (location.startsWith('/payments')) return 2;
    if (location.startsWith('/staff')) return 3;
    if (location.startsWith('/reports')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/calendar');
        break;
      case 1:
        context.go('/bookings');
        break;
      case 2:
        context.go('/payments');
        break;
      case 3:
        context.go('/staff');
        break;
      case 4:
        context.go('/reports');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 18, offset: const Offset(0, -4))],
          border: Border(top: BorderSide(color: Colors.grey[100]!)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(8, 10, 8, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final selected = idx == i;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => _onTap(context, i),
                    behavior: HitTestBehavior.opaque,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      curve: Curves.easeOutCubic,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(
                        color: selected ? tab.gradient[1].withValues(alpha: 0.9) : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                        border: selected ? Border.all(color: tab.gradient[0].withValues(alpha: 0.22)) : null,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 220),
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              gradient: selected ? LinearGradient(colors: tab.gradient, begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
                              color: selected ? null : Colors.grey[100],
                              borderRadius: BorderRadius.circular(11),
                              boxShadow: selected ? [BoxShadow(color: tab.gradient[0].withValues(alpha: 0.32), blurRadius: 8, offset: const Offset(0, 3))] : null,
                            ),
                            child: Icon(selected ? tab.active : tab.icon, size: 20, color: selected ? Colors.white : DEKATColors.textHint),
                          ),
                          const SizedBox(height: 4),
                          AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 200),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                              color: selected ? DEKATColors.primary : DEKATColors.textHint,
                              letterSpacing: -0.2,
                            ),
                            child: Text(tab.label),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabMeta {
  final IconData icon;
  final IconData active;
  final String label;
  final List<Color> gradient;
  const _TabMeta({required this.icon, required this.active, required this.label, required this.gradient});
}
