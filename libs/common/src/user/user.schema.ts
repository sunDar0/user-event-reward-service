// apps/auth-server/src/users/entities/user.entity.ts
import { USER_ROLES } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: USER_ROLES, default: [USER_ROLES.USER] })
  roles: USER_ROLES[];

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ type: String, default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
