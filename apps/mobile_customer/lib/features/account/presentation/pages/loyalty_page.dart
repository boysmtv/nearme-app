import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/dekat_colors.dart';

class LoyaltyPage extends ConsumerStatefulWidget {
  const LoyaltyPage({super.key});

  @override
  ConsumerState<LoyaltyPage> createState() => _LoyaltyPageState();
}

class _LoyaltyPageState extends ConsumerState<LoyaltyPage> {
  int _points = 0;
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadLoyalty();
  }

  Future<void> _loadLoyalty() async {
    setState(() => _loading = true);
    try {
      // TODO: Call API GET /customer/profile (for points) and loyalty history
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _points = 0;
        _history = [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Loyalty Points'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [DEKATColors.primary, DEKATColors.primary.withOpacity(0.8)]),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.stars, size: 48, color: Colors.white),
                      const SizedBox(height: 8),
                      Text('$_points', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white)),
                      const Text('Points', style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
                Expanded(
                  child: _history.isEmpty
                      ? Center(child: Text('No loyalty history', style: TextStyle(color: Colors.grey[500])))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _history.length,
                          itemBuilder: (context, index) {
                            final h = _history[index];
                            return ListTile(
                              leading: Icon(h['type'] == 'EARN' ? Icons.add_circle : Icons.remove_circle,
                                  color: h['type'] == 'EARN' ? Colors.green : Colors.red),
                              title: Text(h['description'] ?? 'Points'),
                              trailing: Text('${h['points'] > 0 ? '+' : ''}${h['points']}',
                                  style: TextStyle(
                                      color: h['points'] > 0 ? Colors.green : Colors.red,
                                      fontWeight: FontWeight.bold)),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}