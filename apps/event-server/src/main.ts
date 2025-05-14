import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { EventServerModule } from "./event-server.module";

async function bootstrap() {
  const app = await NestFactory.create(EventServerModule);
  const configService = app.get(ConfigService);

  // 마이크로서비스 설정
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: configService.get<number>("EVENT_SERVICE_PORT"),
    },
  });

  await app.startAllMicroservices();
  console.log(
    `Event Microservice is listening on port ${configService.get<number>("EVENT_SERVICE_PORT")}`
  );
}
bootstrap();
