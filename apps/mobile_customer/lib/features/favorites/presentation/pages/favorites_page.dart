import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/dekat_colors.dart';
import '../../../../shared/widgets/main_scaffold.dart';

class FavoritesPage extends ConsumerStatefulWidget {
  const FavoritesPage({super.key});

  @override
  ConsumerState<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends ConsumerState<FavoritesPage> {
  List<dynamic> _favorites = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    setState(() => _loading = true);
    try {
      // TODO: Call API GET /customer/favorites
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _favorites = [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      title: 'Favorite Staff',
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _favorites.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.favorite_border, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      Text('No favorites yet', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => context.go('/search'),
                        child: const Text('Find providers'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadFavorites,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _favorites.length,
                    itemBuilder: (context, index) {
                      final fav = _favorites[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: DEKATColors.primary,
                            child: Text(
                              (fav['staffName'] ?? 'S')[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(fav['staffName'] ?? 'Staff'),
                          subtitle: Text(fav['specialties'] ?? 'Provider staff'),
                          trailing: IconButton(
                            icon: const Icon(Icons.favorite, color: Colors.red),
                            onPressed: () => _removeFavorite(fav['staffId']),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Future<void> _removeFavorite(String staffId) async {
    // TODO: Call API DELETE /customer/favorites/$staffId
    setState(() => _favorites.removeWhere((f) => f['staffId'] == staffId));
  }
}