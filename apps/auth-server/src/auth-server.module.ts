import { CommonModule } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthServerController } from "./auth-server.controller";
import { AuthServerService } from "./auth-server.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "dev-env",
    }),
    CommonModule,
  ],
  controllers: [AuthServerController],
  providers: [AuthServerService],
})
export class AuthServerModule {}
