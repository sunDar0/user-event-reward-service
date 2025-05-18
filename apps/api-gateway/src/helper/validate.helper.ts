import { ApiGatewayEnvConfig, AuthServiceEnvConfig, EventServiceEnvConfig } from '@app/common/interfaces';
import * as Joi from 'joi';

export function validateApiGateWayEnv(): Joi.ObjectSchema<ApiGatewayEnvConfig> {
  return Joi.object<ApiGatewayEnvConfig, true>({
    APP_ENV: Joi.string().valid('local', 'test', 'dev', 'devqa', 'stage', 'prod').default('dev').required(),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    API_GATEWAY_PORT: Joi.number().required(),
    AUTH_SERVICE_HOST: Joi.string().required(),
    AUTH_SERVICE_PORT: Joi.number().required(),
    EVENT_SERVICE_HOST: Joi.string().required(),
    EVENT_SERVICE_PORT: Joi.number().required(),
  });
}

export function validateAuthServiceEnv(): Joi.ObjectSchema<AuthServiceEnvConfig> {
  return Joi.object<AuthServiceEnvConfig, true>({
    APP_ENV: Joi.string().valid('local', 'test', 'dev', 'devqa', 'stage', 'prod').default('dev').required(),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    AUTH_SERVICE_PORT: Joi.number().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
    REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
  });
}

export function validateEventServiceEnv(): Joi.ObjectSchema<EventServiceEnvConfig> {
  return Joi.object<EventServiceEnvConfig, true>({
    APP_ENV: Joi.string().valid('local', 'test', 'dev', 'devqa', 'stage', 'prod').default('dev').required(),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    EVENT_SERVICE_PORT: Joi.number().required(),
  });
}
