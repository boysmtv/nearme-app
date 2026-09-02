import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/dekat_colors.dart';

class ServicesPage extends ConsumerStatefulWidget {
  const ServicesPage({super.key});

  @override
  ConsumerState<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends ConsumerState<ServicesPage> {
  List<dynamic> _services = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _loading = true);
    try {
      // TODO: Call API GET /provider/services
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _services = [];
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
        title: const Text('Services'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showCreateServiceDialog(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _services.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.design_services_outlined, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      const Text('No services yet'),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () => _showCreateServiceDialog(),
                        child: const Text('Add Service'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadServices,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _services.length,
                    itemBuilder: (context, index) {
                      final service = _services[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: DEKATColors.primary.withOpacity(0.1),
                            child: Icon(Icons.spa, color: DEKATColors.primary),
                          ),
                          title: Text(service['name'] ?? 'Service'),
                          subtitle: Text('Rp ${(service['price'] ?? 0).toString()} • ${service['duration'] ?? 0} min'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Switch(
                                value: service['isActive'] ?? true,
                                onChanged: (val) => _toggleService(service['id'], val),
                              ),
                              IconButton(
                                icon: const Icon(Icons.edit, size: 20),
                                onPressed: () => _showEditServiceDialog(service),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  void _showCreateServiceDialog() {
    // TODO: Show create service dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Service'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(decoration: InputDecoration(labelText: 'Name')),
            const TextField(decoration: InputDecoration(labelText: 'Price'), keyboardType: TextInputType.number),
            const TextField(decoration: InputDecoration(labelText: 'Duration (min)'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Save')),
        ],
      ),
    );
  }

  void _showEditServiceDialog(dynamic service) {
    // TODO: Show edit service dialog
  }

  void _toggleService(String id, bool active) {
    // TODO: Call API PUT /provider/services/$id
  }
}
