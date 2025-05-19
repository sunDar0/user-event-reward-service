import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEventServiceEnv } from 'apps/api-gateway/src/helper/validate.helper';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/event-server/.env'],
      validationSchema: validateEventServiceEnv(),
    }),
    CommonModule,
  ],
  controllers: [EventServerController],
  providers: [EventServerService],
})
export class EventServerModule {}
