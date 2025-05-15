export interface EnvConfig {
  APP_ENV: 'local' | 'test' | 'dev' | 'devqa' | 'stage' | 'prod';
  APP_VERSION: string;
  APP_NAME: string;
}

export interface ApiGatewayEnvConfig extends EnvConfig {
  API_GATEWAY_PORT: number;
  AUTH_SERVICE_HOST: string;
  AUTH_SERVICE_PORT: number;
  EVENT_SERVICE_HOST: string;
  EVENT_SERVICE_PORT: number;
}

export interface AuthServiceEnvConfig extends EnvConfig {
  AUTH_SERVICE_PORT: number;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_EXPIRATION: string;
}

export interface EventServiceEnvConfig extends EnvConfig {
  EVENT_SERVICE_PORT: number;
}
