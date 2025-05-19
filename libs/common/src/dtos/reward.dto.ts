import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { REWARD_TYPE } from '../reward';

export class CreateRewardDto {
  @ApiProperty({ enum: REWARD_TYPE, description: '보상 타입', example: REWARD_TYPE.CASH })
  @IsEnum(REWARD_TYPE)
  @IsNotEmpty()
  type: REWARD_TYPE;

  @ApiProperty({ description: '보상 이름', example: '1000원 캐시' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '보상 상세 정보', example: { amount: 1000 } })
  @IsObject()
  @IsNotEmpty()
  details: Record<string, any>;

  @ApiProperty({ description: '보상 수량 (-1은 무제한)', example: 100 })
  @IsNumber()
  @Min(-1)
  quantity: number;
}

export class UpdateRewardDto {
  @ApiProperty({ enum: REWARD_TYPE, description: '보상 타입', required: false })
  @IsEnum(REWARD_TYPE)
  @IsOptional()
  type?: REWARD_TYPE;

  @ApiProperty({ description: '보상 이름', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '보상 상세 정보', required: false, example: { amount: 1000 } })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({ description: '보상 수량 (-1은 무제한)', required: false, example: 100 })
  @IsNumber()
  @Min(-1)
  @IsOptional()
  quantity?: number;
}

export class RewardResponseDto {
  @ApiProperty({ description: '보상 ID' })
  rewardId: string;

  @ApiProperty({ description: '이벤트 ID' })
  eventId: string;

  @ApiProperty({ enum: REWARD_TYPE, description: '보상 타입' })
  type: REWARD_TYPE;

  @ApiProperty({ description: '보상 이름' })
  name: string;

  @ApiProperty({ description: '보상 상세 정보' })
  details: Record<string, any>;

  @ApiProperty({ description: '보상 총 수량' })
  quantity: number;

  @ApiProperty({ description: '보상 남은 수량' })
  remainingQuantity: number;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}
