import { CommonModule } from '@app/common';
import { UserModule } from '@app/common/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthServerController } from './auth-server.controller';
import { AuthServerService } from './auth-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'dev-env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    UserModule,
  ],
  controllers: [AuthServerController],
  providers: [AuthServerService],
})
export class AuthServerModule {}
