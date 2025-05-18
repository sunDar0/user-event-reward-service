import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EventServerModule } from './event-server.module';

async function bootstrap() {
  const app = await NestFactory.create(EventServerModule);
  const configService = app.get(ConfigService);

  // 마이크로서비스 설정
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('EVENT_SERVICE_HOST'),
      port: configService.get<number>('EVENT_SERVICE_PORT'),
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });

  await app.startAllMicroservices();
  console.log(`Event Microservice is listening on port ${configService.get<number>('EVENT_SERVICE_PORT')}`);
}
bootstrap();
