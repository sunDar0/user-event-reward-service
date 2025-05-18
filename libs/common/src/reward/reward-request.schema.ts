import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { REWARD_REQUEST_STATUS } from './reward.constants';

// 6.0 이상 버전부터 추가(Document 대신 HydratedDocument 사용) - 타입 안정성
export type RewardRequestDocument = HydratedDocument<RewardRequest>;

@Schema({ timestamps: true, collection: 'reward-requests' })
export class RewardRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reward', required: true })
  rewardId: string;

  @Prop({
    type: String,
    enum: REWARD_REQUEST_STATUS,
    default: REWARD_REQUEST_STATUS.PENDING,
    required: true,
  })
  status: REWARD_REQUEST_STATUS;

  @Prop({ type: Date, default: Date.now })
  requestedAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date })
  claimedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);
