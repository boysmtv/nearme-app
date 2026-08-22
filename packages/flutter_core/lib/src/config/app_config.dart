import 'environment.dart';

class AppConfig {
  final Environment environment;
  final String apiBaseUrl;
  final String appName;
  final String version;
  final String buildNumber;
  final String firebaseProjectId;
  final String sentryDsn;
  final bool enableLogging;
  final Duration connectTimeout;
  final Duration receiveTimeout;
  final Duration sendTimeout;
  final int maxRetries;

  const AppConfig({
    required this.environment,
    required this.apiBaseUrl,
    this.appName = 'DEKAT',
    this.version = '1.0.0',
    this.buildNumber = '1',
    this.firebaseProjectId = '',
    this.sentryDsn = '',
    this.enableLogging = true,
    this.connectTimeout = const Duration(seconds: 10),
    this.receiveTimeout = const Duration(seconds: 30),
    this.sendTimeout = const Duration(seconds: 10),
    this.maxRetries = 3,
  });

  bool get isDevelopment => environment == Environment.development;
  bool get isStaging => environment == Environment.staging;
  bool get isProduction => environment == Environment.production;

  String get environmentName {
    switch (environment) {
      case Environment.development:
        return 'development';
      case Environment.staging:
        return 'staging';
      case Environment.production:
        return 'production';
    }
  }

  static const development = AppConfig(
    environment: Environment.development,
    apiBaseUrl: 'https://dev-api.dekat.com',
    firebaseProjectId: 'dekat-dev',
    enableLogging: true,
  );

  static const staging = AppConfig(
    environment: Environment.staging,
    apiBaseUrl: 'https://staging-api.dekat.com',
    firebaseProjectId: 'dekat-staging',
    enableLogging: true,
  );

  static const production = AppConfig(
    environment: Environment.production,
    apiBaseUrl: 'https://api.dekat.com',
    firebaseProjectId: 'dekat-prod',
    enableLogging: false,
  );

  static AppConfig fromEnvironment(Environment env) {
    switch (env) {
      case Environment.development:
        return development;
      case Environment.staging:
        return staging;
      case Environment.production:
        return production;
    }
  }
}
