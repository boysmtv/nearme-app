import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import '../services/secure_storage_service.dart';
import 'api_client.dart';

class DioClient {
  late final Dio _dio;
  final AppConfig _config;

  DioClient(this._config) {
    _dio = Dio(
      BaseOptions(
        baseUrl: _config.apiBaseUrl,
        connectTimeout: _config.connectTimeout,
        receiveTimeout: _config.receiveTimeout,
        sendTimeout: _config.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      _RequestIdInterceptor(),
      _AuthInterceptor(),
      _RetryInterceptor(maxRetries: _config.maxRetries),
      _ErrorInterceptor(),
      if (_config.enableLogging) _LoggingInterceptor(),
    ]);
  }

  Dio get dio => _dio;
}

class _RequestIdInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final requestId = DateTime.now().millisecondsSinceEpoch.toString();
    options.headers['X-Request-Id'] = requestId;
    handler.next(options);
  }
}

class _AuthInterceptor extends Interceptor {
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
    final token = await SecureStorageService.read('access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      if (_isRefreshing) {
        final token = await SecureStorageService.read('access_token');
        if (token != null && token != _pendingToken) {
          err.requestOptions.headers['Authorization'] = 'Bearer $token';
          try {
            final response = await Dio().fetch(err.requestOptions);
            _isRefreshing = false;
            _pendingToken = null;
            handler.resolve(response);
            return;
          } catch (_) {}
        }
        _isRefreshing = false;
        _pendingToken = null;
        handler.next(err);
        return;
      }

      _isRefreshing = true;
      final refreshToken = await SecureStorageService.read('refresh_token');
      if (refreshToken != null) {
        _pendingToken = await SecureStorageService.read('access_token');
        try {
          final refreshResponse = await Dio().post(
            '${err.requestOptions.baseUrl}/auth/refresh',
            queryParameters: {'refreshToken': refreshToken},
          );
          final data = refreshResponse.data['data'] as Map<String, dynamic>?;
          final newAccessToken = data?['accessToken'] as String?;
          final newRefreshToken = data?['refreshToken'] as String?;

          if (newAccessToken != null) {
            await SecureStorageService.write('access_token', newAccessToken);
            if (newRefreshToken != null) {
              await SecureStorageService.write('refresh_token', newRefreshToken);
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
          // Force-logout: notify the app so it can update state and navigate
          ApiClient.onAuthFailure?.call();
          handler.next(err);
          return;
        }
      } else {
        // No refresh token available — force logout
        await SecureStorageService.deleteAll();
        ApiClient.onAuthFailure?.call();
      }
      _isRefreshing = false;
      _pendingToken = null;
    }
    handler.next(err);
  }
}

class _RetryInterceptor extends Interceptor {
  final int maxRetries;

  _RetryInterceptor({this.maxRetries = 3});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retryCount = err.requestOptions.extra['retryCount'] ?? 0;

    if (retryCount < maxRetries && _shouldRetry(err)) {
      err.requestOptions.extra['retryCount'] = retryCount + 1;
      final delay = Duration(milliseconds: 1000 * (1 << retryCount));
      await Future.delayed(delay);

      try {
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (_) {
        handler.next(err);
        return;
      }
    }
    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError ||
        (err.response?.statusCode ?? 0) >= 500;
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    String errorMessage;
    int? statusCode = err.response?.statusCode;

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
        errorMessage = 'Connection timeout. Please check your internet connection.';
        break;
      case DioExceptionType.sendTimeout:
        errorMessage = 'Send timeout. Please try again.';
        break;
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Receive timeout. Please try again.';
        break;
      case DioExceptionType.badResponse:
        errorMessage = _handleErrorResponse(statusCode, err.response?.data);
        break;
      case DioExceptionType.cancel:
        errorMessage = 'Request was cancelled.';
        break;
      case DioExceptionType.connectionError:
        errorMessage = 'No internet connection.';
        break;
      default:
        errorMessage = 'An unexpected error occurred.';
    }

    handler.next(
      DioException(
        requestOptions: err.requestOptions,
        error: errorMessage,
        type: err.type,
        response: err.response,
      ),
    );
  }

  String _handleErrorResponse(int? statusCode, dynamic responseData) {
    final serverMessage = responseData is Map<String, dynamic>
        ? responseData['message'] as String?
        : null;

    switch (statusCode) {
      case 400:
        return serverMessage ?? 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'You don\'t have permission to access this resource.';
      case 404:
        return 'Resource not found.';
      case 409:
        return serverMessage ?? 'Conflict. The resource already exists.';
      case 422:
        return serverMessage ?? 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('→ REQUEST[${options.method}] => ${options.uri}');
    if (options.data != null) {
      debugPrint('  Body: ${options.data}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint(
      '← RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint(
      '✗ ERROR[${err.response?.statusCode}] => ${err.requestOptions.uri}',
    );
    debugPrint('  Message: ${err.message}');
    handler.next(err);
  }
}
