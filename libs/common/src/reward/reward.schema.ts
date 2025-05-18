import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { REWARD_TYPE } from './reward.constants';

@Schema({ timestamps: true })
export class Reward extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: string;

  @Prop({ type: String, enum: REWARD_TYPE, required: true })
  type: REWARD_TYPE;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  details: Record<string, any>;

  @Prop({ type: Number, required: true, min: -1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  remainingQuantity: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
