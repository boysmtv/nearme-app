enum Environment {
  development,
  staging,
  production,
}

class EnvironmentConfig {
  final Environment environment;
  final String apiBaseUrl;
  final String firebaseProjectId;
  final String sentryDsn;

  const EnvironmentConfig({
    required this.environment,
    required this.apiBaseUrl,
    required this.firebaseProjectId,
    this.sentryDsn = '',
  });

  bool get isDevelopment => environment == Environment.development;
  bool get isStaging => environment == Environment.staging;
  bool get isProduction => environment == Environment.production;

  static const development = EnvironmentConfig(
    environment: Environment.development,
    apiBaseUrl: 'https://dev-api.dekat.com',
    firebaseProjectId: 'dekat-dev',
  );

  static const staging = EnvironmentConfig(
    environment: Environment.staging,
    apiBaseUrl: 'https://staging-api.dekat.com',
    firebaseProjectId: 'dekat-staging',
  );

  static const production = EnvironmentConfig(
    environment: Environment.production,
    apiBaseUrl: 'https://api.dekat.com',
    firebaseProjectId: 'dekat-prod',
  );

  static EnvironmentConfig fromEnvironment(Environment env) {
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
