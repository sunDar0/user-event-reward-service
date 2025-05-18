import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Event } from '../events/event.schema';
import { REWARD_TYPE } from './reward.constants';

export type RewardDocument = HydratedDocument<Reward & { event?: Event }>;
@Schema({ timestamps: true })
export class Reward {
  _id: Types.ObjectId;

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

  @Prop({ type: Number, required: true, min: -1 })
  remainingQuantity: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
