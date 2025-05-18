import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { REWARD_REQUEST_STATUS } from './reward.constants';

@Schema({ timestamps: true })
export class RewardRequest extends Document {
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
