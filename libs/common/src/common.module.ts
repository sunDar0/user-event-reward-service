import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CommonService } from "./common.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "dev-env",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("ACCESS_TOKEN_EXPIRATION"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CommonService],
  exports: [CommonService, JwtModule],
})
export class CommonModule {}
