import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateAuthServiceEnv } from 'apps/api-gateway/src/helper/validate.helper';
import { AuthServerController } from './auth-server.controller';
import { AuthServerParser } from './auth-server.parser';
import { AuthServerService } from './auth-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/auth-server/.env'],
      validationSchema: validateAuthServiceEnv(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
  ],
  controllers: [AuthServerController],
  providers: [AuthServerService, AuthServerParser],
})
export class AuthServerModule {}
