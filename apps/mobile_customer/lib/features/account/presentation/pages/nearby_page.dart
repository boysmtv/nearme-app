import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class NearbyPage extends ConsumerStatefulWidget {
  const NearbyPage({super.key});

  @override
  ConsumerState<NearbyPage> createState() => _NearbyPageState();
}

class _NearbyPageState extends ConsumerState<NearbyPage> {
  List<dynamic> _providers = [];
  bool _isLoading = true;
  double _radius = 5;

  @override
  void initState() {
    super.initState();
    _loadNearby();
  }

  Future<void> _loadNearby() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final res = await api.dio.get(
        '/public/providers?q=&radius=$_radius&lat=-6.2088&lng=106.8456',
      );
      if (res.data['success'] == true) {
        final data = res.data['data'];
        setState(() {
          _providers = data is List ? data : (data['providers'] ?? []);
        });
      }
    } catch (e) {
      debugPrint('Error loading nearby: $e');
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Provider Terdekat'),
        actions: [
          DropdownButton<double>(
            value: _radius,
            underline: const SizedBox(),
            icon: const Icon(Icons.filter_list),
            items: [1, 3, 5, 10, 20].map((r) {
              return DropdownMenuItem(
                value: r.toDouble(),
                child: Text('$r km'),
              );
            }).toList(),
            onChanged: (v) {
              if (v != null) {
                setState(() => _radius = v);
                _loadNearby();
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _providers.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_off, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text('Tidak ada provider di sekitar', style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => context.push('/search'),
                        child: const Text('Cari Manual'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadNearby,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _providers.length,
                    itemBuilder: (context, index) {
                      final p = _providers[index] as Map<String, dynamic>;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(12),
                          leading: CircleAvatar(
                            radius: 28,
                            backgroundImage: p['logoUrl'] != null
                                ? NetworkImage(p['logoUrl'] as String)
                                : null,
                            child: p['logoUrl'] == null
                                ? Text(
                                    (p['name'] as String? ?? '?')[0].toUpperCase(),
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                  )
                                : null,
                          ),
                          title: Text(
                            p['name'] as String? ?? 'Provider',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            p['location'] as String? ?? p['address'] as String? ?? 'Indonesia',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => context.push('/provider/${p['slug'] ?? p['id']}'),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
