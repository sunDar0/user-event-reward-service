import { Types } from 'mongoose';
import { EVENT_STATUS } from '../events/event.constants';

export interface IEventCondition {
  type: string;
  details: Record<string, any>;
}

export interface IEvent {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: EVENT_STATUS;
  conditions: IEventCondition;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
