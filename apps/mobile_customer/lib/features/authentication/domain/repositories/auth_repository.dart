import 'package:dartz/dartz.dart';
import '../entities/auth_entity.dart';
import '../../../../core/error/failure.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthTokens>> login(String email, String password);
  Future<Either<Failure, void>> register(String email, String password, {String? name, String? phone});
  Future<Either<Failure, AuthTokens>> refreshToken(String refreshToken);
  Future<Either<Failure, void>> logout(String refreshToken);
  Future<Either<Failure, void>> requestOtp(String email);
  Future<Either<Failure, bool>> verifyOtp(String email, String otp);
}
