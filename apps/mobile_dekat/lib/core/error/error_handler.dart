import 'package:dio/dio.dart';
import 'app_exception.dart';

class ErrorHandler {
  static AppException handle(dynamic error) {
    if (error is AppException) return error;
    if (error is DioException) return _handleDioError(error);
    return ServerException(error.toString());
  }

  static AppException _handleDioError(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;
    final serverMessage = data is Map<String, dynamic>
        ? data['message'] as String? ?? data['error'] as String?
        : null;

    return switch (error.type) {
      DioExceptionType.connectionTimeout =>
        const NetworkException('Connection timeout'),
      DioExceptionType.sendTimeout =>
        const NetworkException('Send timeout'),
      DioExceptionType.receiveTimeout =>
        const NetworkException('Receive timeout'),
      DioExceptionType.connectionError =>
        const NetworkException('No internet connection'),
      DioExceptionType.badResponse => _handleBadResponse(statusCode, serverMessage),
      _ => ServerException(serverMessage ?? error.message ?? 'Unknown error'),
    };
  }

  static AppException _handleBadResponse(int? statusCode, String? serverMessage) {
    return switch (statusCode) {
      400 => ValidationException(serverMessage ?? 'Validation error'),
      401 => AuthException(serverMessage ?? 'Unauthorized', statusCode: 401),
      403 => AuthException(serverMessage ?? 'Forbidden', statusCode: 403),
      404 => NotFoundException(serverMessage ?? 'Not found'),
      409 => ConflictException(serverMessage ?? 'Conflict'),
      500 => ServerException(serverMessage ?? 'Internal server error'),
      _ => ServerException(serverMessage ?? 'Server error', statusCode: statusCode),
    };
  }
}
