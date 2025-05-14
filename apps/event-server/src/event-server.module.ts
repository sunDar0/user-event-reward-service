import { CommonModule } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventServerController } from "./event-server.controller";
import { EventServerService } from "./event-server.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "dev-env",
    }),
    CommonModule,
  ],
  controllers: [EventServerController],
  providers: [EventServerService],
})
export class EventServerModule {}
