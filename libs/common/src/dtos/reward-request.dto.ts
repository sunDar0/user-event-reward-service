import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { RewardRequestStatus } from '../reward/reward-request.schema';

export class CreateRewardRequestDto {
  @ApiProperty({ description: '이벤트 ID' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: '보상 ID' })
  @IsString()
  @IsNotEmpty()
  rewardId: string;

  @ApiProperty({ description: '추가 정보', required: false })
  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}

export class UpdateRewardRequestStatusDto {
  @ApiProperty({ enum: RewardRequestStatus, description: '보상 요청 상태' })
  @IsEnum(RewardRequestStatus)
  @IsNotEmpty()
  status: RewardRequestStatus;

  @ApiProperty({ description: '처리 메모', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RewardRequestResponseDto {
  @ApiProperty({ description: '보상 요청 ID' })
  _id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '이벤트 ID' })
  eventId: string;

  @ApiProperty({ description: '보상 ID' })
  rewardId: string;

  @ApiProperty({ enum: RewardRequestStatus, description: '보상 요청 상태' })
  status: RewardRequestStatus;

  @ApiProperty({ description: '요청 시간' })
  requestedAt: Date;

  @ApiProperty({ description: '처리 시간', required: false })
  processedAt?: Date;

  @ApiProperty({ description: '수령 시간', required: false })
  claimedAt?: Date;

  @ApiProperty({ description: '처리 메모', required: false })
  notes?: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}
