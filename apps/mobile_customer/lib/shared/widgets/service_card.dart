import 'package:flutter/material.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class ServiceCard extends StatelessWidget {
  final Service service;
  final VoidCallback? onTap;
  const ServiceCard({super.key, required this.service, this.onTap});

  List<Color> _gradientFor(String name) {
    final n = name.toLowerCase();
    if (n.contains('hair') || n.contains('cut') || n.contains('barber')) return DEKATColors.softViolet;
    if (n.contains('spa') || n.contains('massage') || n.contains('pijat')) return DEKATColors.softMint;
    if (n.contains('nail') || n.contains('kuku')) return DEKATColors.softPink;
    if (n.contains('facial') || n.contains('beauty') || n.contains('kecantikan')) return DEKATColors.softPeach;
    if (n.contains('color') || n.contains('warna')) return DEKATColors.softLavender;
    return DEKATColors.softSky;
  }

  IconData _iconFor(String name) {
    final n = name.toLowerCase();
    if (n.contains('hair') || n.contains('cut')) return Icons.content_cut_rounded;
    if (n.contains('spa') || n.contains('massage')) return Icons.spa_rounded;
    if (n.contains('nail')) return Icons.brush_rounded;
    if (n.contains('facial') || n.contains('beauty')) return Icons.face_retouching_natural_rounded;
    if (n.contains('color')) return Icons.palette_rounded;
    if (n.contains('beard')) return Icons.face_rounded;
    return Icons.auto_awesome_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final grad = _gradientFor(service.name);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: grad.last.withValues(alpha: 0.6)),
        boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.12), blurRadius: 14, offset: const Offset(0, 4)), BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              Container(
                width: 58, height: 58,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.22), blurRadius: 8, offset: const Offset(0, 3))],
                ),
                child: Icon(_iconFor(service.name), color: Colors.white, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(service.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: DEKATColors.textPrimary)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(color: grad.last, borderRadius: BorderRadius.circular(8)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.schedule_rounded, size: 11, color: grad.first),
                    const SizedBox(width: 4),
                    Text('${service.durationMinutes} min', style: TextStyle(color: grad.first, fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
                ),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(10)),
                child: Text('Rp ${service.price}', style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 13)),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}
