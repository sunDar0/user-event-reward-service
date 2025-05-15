import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import swagger from 'apps/api-gateway/src/swagger/swagger';
import { ApiGatewayModule } from './api-gateway.module';
async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableVersioning({
    type: VersioningType.URI, // URI Versioning
  });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('API_GATEWAY_PORT');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 데코레이터가 없는 속성은 제거
      forbidNonWhitelisted: true, // 데코레이터가 없는 속성이 있으면 에러 발생
      transform: true, // 데코레이터가 있는 속성을 타입으로 변환
      transformOptions: { enableImplicitConversion: true }, // @Type() 데코레이터 생략
    }),
  );

  await swagger(app, configService);

  await app.listen(port);
  console.log(`API Gateway is running on port ${port}`);
}
bootstrap();
