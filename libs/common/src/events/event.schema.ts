import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { IEventCondition } from '../interfaces';
import { Reward } from '../reward/reward.schema';
import { EVENT_CONDITION_TYPE, EVENT_STATUS } from './event.constants';

export type EventDocument = HydratedDocument<Event & { rewards?: Reward[] }>;

export class EventCondition implements IEventCondition {
  @ApiProperty({
    description: '이벤트 조건 타입',
    example: EVENT_CONDITION_TYPE.LOGIN_STREAK,
  })
  @Prop({ required: true, type: String })
  type: EVENT_CONDITION_TYPE;

  @ApiProperty({
    description: '이벤트 조건 상세',
    example: { targetCount: 7, targetDate: '2025-01-01', targetAmount: 10000 },
  })
  @Prop({ required: true, type: Object })
  details: Record<string, any>;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: EVENT_STATUS,
    default: EVENT_STATUS.INACTIVE,
  })
  status: EVENT_STATUS;

  @Prop({ type: Object, required: true })
  conditions: EventCondition;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Add virtual field for rewards
EventSchema.virtual('rewards', {
  ref: 'Reward', // 참조할 모델
  localField: '_id', // Event의 _id
  foreignField: 'eventId', // Reward의 eventId
  justOne: false, // 하나의 이벤트에 여러 보상 가능
});

// 복합 인덱스 생성
EventSchema.index(
  {
    'conditions.type': 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: EVENT_STATUS.ACTIVE,
    },
    name: 'unique_active_condition_type',
  },
);
// 추가적인 인덱스들
EventSchema.index({ startDate: 1, endDate: 1 }); // 날짜 범위 쿼리 최적화
EventSchema.index({ status: 1 }); // 상태별 조회 최적화
EventSchema.index({ createdBy: 1 }); // 생성자별 조회 최적화
