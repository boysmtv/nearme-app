import 'package:dio/dio.dart';
import 'package:flutter_core/flutter_core.dart';

class AuthInterceptor extends Interceptor {
  bool _isRefreshing = false;
  String? _pendingToken;

  static bool _isPublicEndpoint(String path) {
    return path.startsWith('/public/') || path.startsWith('/auth/') || path.contains('/public/');
  }

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (_isPublicEndpoint(options.path)) {
      handler.next(options);
      return;
    }
    final token = await SecureStorageService.read(StorageKeys.accessToken);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      if (_isRefreshing) {
        final token = await SecureStorageService.read(StorageKeys.accessToken);
        if (token != null && token != _pendingToken) {
          err.requestOptions.headers['Authorization'] = 'Bearer $token';
          try {
            final response = await Dio().fetch(err.requestOptions);
            handler.resolve(response);
            return;
          } catch (_) {}
        }
        handler.next(err);
        return;
      }

      _isRefreshing = true;
      final refreshToken = await SecureStorageService.read(StorageKeys.refreshToken);
      if (refreshToken != null) {
        _pendingToken = await SecureStorageService.read(StorageKeys.accessToken);
        try {
          final refreshResponse = await Dio().post(
            '${err.requestOptions.baseUrl}/auth/refresh',
            queryParameters: {'refreshToken': refreshToken},
          );
          final respData = refreshResponse.data;
          final dataMap = respData is Map<String, dynamic> ? (respData['data'] as Map<String, dynamic>?) ?? respData : null;
          final newAccessToken = (dataMap?['accessToken'] ?? respData['accessToken']) as String?;
          final newRefreshToken = (dataMap?['refreshToken'] ?? respData['refreshToken']) as String?;

          if (newAccessToken != null) {
            await SecureStorageService.write(StorageKeys.accessToken, newAccessToken);
            if (newRefreshToken != null) {
              await SecureStorageService.write(StorageKeys.refreshToken, newRefreshToken);
            }
            err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
            final response = await Dio().fetch(err.requestOptions);
            _isRefreshing = false;
            _pendingToken = null;
            handler.resolve(response);
            return;
          }
        } catch (_) {
          await SecureStorageService.deleteAll();
          _isRefreshing = false;
          _pendingToken = null;
          handler.next(err);
          return;
        }
      }
      _isRefreshing = false;
      _pendingToken = null;
    }
    handler.next(err);
  }
}
