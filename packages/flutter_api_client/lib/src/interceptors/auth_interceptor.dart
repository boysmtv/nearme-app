import 'package:dio/dio.dart';
import 'package:flutter_core/flutter_core.dart';

class AuthInterceptor extends Interceptor {
  bool _isRefreshing = false;
  String? _pendingToken;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
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
            data: {'refresh_token': refreshToken},
          );
          final newAccessToken = refreshResponse.data['access_token'] as String?;
          final newRefreshToken = refreshResponse.data['refresh_token'] as String?;

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
