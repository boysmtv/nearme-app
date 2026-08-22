export interface Config {
  apiUrl: string;
  appName: string;
  environment: 'development' | 'staging' | 'production';
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'DEKAT',
  environment: (import.meta.env.VITE_ENVIRONMENT as Config['environment']) ?? 'development',
};
