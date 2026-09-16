import 'package:dartz/dartz.dart';
import '../entities/auth_entity.dart';
import '../repositories/auth_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class LoginUseCase extends UseCase<AuthTokens, LoginParams> {
  final AuthRepository repository;
  LoginUseCase(this.repository);
  @override
  Future<Either<Failure, AuthTokens>> call(LoginParams params) => repository.login(params.email, params.password);
}

class LoginParams {
  final String email;
  final String password;
  const LoginParams({required this.email, required this.password});
}

class RegisterUseCase extends UseCase<void, RegisterParams> {
  final AuthRepository repository;
  RegisterUseCase(this.repository);
  @override
  Future<Either<Failure, void>> call(RegisterParams params) =>
      repository.register(params.email, params.password, name: params.name, phone: params.phone);
}

class RegisterParams {
  final String email;
  final String password;
  final String? name;
  final String? phone;
  const RegisterParams({required this.email, required this.password, this.name, this.phone});
}

class RefreshTokenUseCase extends UseCase<AuthTokens, String> {
  final AuthRepository repository;
  RefreshTokenUseCase(this.repository);
  @override
  Future<Either<Failure, AuthTokens>> call(String refreshToken) => repository.refreshToken(refreshToken);
}

class LogoutUseCase extends UseCase<void, String> {
  final AuthRepository repository;
  LogoutUseCase(this.repository);
  @override
  Future<Either<Failure, void>> call(String refreshToken) => repository.logout(refreshToken);
}

class RequestOtpUseCase extends UseCase<void, String> {
  final AuthRepository repository;
  RequestOtpUseCase(this.repository);
  @override
  Future<Either<Failure, void>> call(String email) => repository.requestOtp(email);
}

class VerifyOtpUseCase extends UseCase<bool, VerifyOtpParams> {
  final AuthRepository repository;
  VerifyOtpUseCase(this.repository);
  @override
  Future<Either<Failure, bool>> call(VerifyOtpParams params) => repository.verifyOtp(params.email, params.otp);
}

class VerifyOtpParams {
  final String email;
  final String otp;
  const VerifyOtpParams({required this.email, required this.otp});
}
