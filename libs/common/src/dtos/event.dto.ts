import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { EVENT_CONDITION_TYPE, EVENT_STATUS } from '../events/event.constants';
import { EventCondition } from '../events/event.schema';
import { RewardResponseDto } from './reward.dto';

export class CreateEventDto {
  @ApiProperty({
    description: '이벤트 제목',
    example: '이벤트 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '이벤트 설명',
    example: '이벤트 설명',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '이벤트 시작일',
    example: '2025-05-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '이벤트 종료일',
    example: '2025-06-01',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: '이벤트 상태',
    example: EVENT_STATUS.ACTIVE,
  })
  @IsEnum(EVENT_STATUS)
  status: EVENT_STATUS;

  @ApiProperty({
    description: '이벤트 조건',
    type: EventCondition,
    example: { type: EVENT_CONDITION_TYPE.LOGIN_STREAK, details: { targetCount: 30, targetReward: 10000 } },
  })
  @IsObject()
  conditions: EventCondition;
}

export class EventResponseDto {
  @ApiProperty({ description: '이벤트 ID' })
  eventId: string;

  @ApiProperty({ description: '이벤트 제목' })
  title: string;

  @ApiProperty({ description: '이벤트 설명' })
  description: string;

  @ApiProperty({ description: '이벤트 시작일' })
  startDate: string;

  @ApiProperty({ description: '이벤트 종료일' })
  endDate: string;

  @ApiProperty({ enum: EVENT_STATUS, description: '이벤트 상태' })
  status: EVENT_STATUS;

  @ApiProperty({ description: '이벤트 조건', type: 'object' })
  conditions: EventCondition;

  @ApiProperty({ description: '생성자 ID' })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: '보상 목록', type: [RewardResponseDto], required: false })
  rewards?: RewardResponseDto[];

  @ApiProperty({ description: '생성일' })
  createdAt: string;

  @ApiProperty({ description: '수정일' })
  updatedAt: string;
}
