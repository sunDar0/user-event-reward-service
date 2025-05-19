import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventConditionStrategyFactory,
  LoginStreakStrategy,
  MonsterKillStrategy,
  PurchaseCountStrategy,
  QuestClearStrategy,
  RecommendCountStrategy,
} from './event.condition.strategy';
import { Event, EventSchema } from './event.schema';
import { EventService } from './event.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  providers: [
    EventService,
    EventConditionStrategyFactory,
    LoginStreakStrategy,
    QuestClearStrategy,
    MonsterKillStrategy,
    RecommendCountStrategy,
    PurchaseCountStrategy,
  ],
  exports: [EventService],
})
export class EventModule {}
