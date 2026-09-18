import 'app_exception.dart';

sealed class Failure {
  final String message;
  const Failure(this.message);

  factory Failure.fromException(AppException e) {
    return switch (e) {
      ServerException(message: final m) => ServerFailure(m),
      CacheException(message: final m) => CacheFailure(m),
      NetworkException(message: final m) => NetworkFailure(m),
      AuthException(message: final m) => AuthFailure(m),
      ValidationException(message: final m, errors: final err) => ValidationFailure(m, errors: err),
      NotFoundException(message: final m) => NotFoundFailure(m),
      ConflictException(message: final m) => ConflictFailure(m),
      _ => ServerFailure(e.message),
    };
  }
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class ValidationFailure extends Failure {
  final Map<String, String>? errors;
  const ValidationFailure(super.message, {this.errors});
}

class NotFoundFailure extends Failure {
  const NotFoundFailure(super.message);
}

class ConflictFailure extends Failure {
  const ConflictFailure(super.message);
}
