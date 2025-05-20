import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { CompareData } from '../interfaces/event.interface';
import { REWARD_REQUEST_STATUS } from '../reward/reward.constants';
import { RewardResponseDto } from './reward.dto';

export class CreateRewardRequestDto {
  @ApiProperty({ description: '이벤트 ID' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다.');
    }
    return value;
  })
  eventId: string;

  @ApiProperty({ description: '해당 유저의 이벤트 달성 정보' })
  @IsNotEmpty()
  completedInfo: CompareData;
}

export class UpdateRewardRequestStatusDto {
  @ApiProperty({ enum: REWARD_REQUEST_STATUS, description: '보상 요청 상태' })
  @IsEnum(REWARD_REQUEST_STATUS)
  @IsNotEmpty()
  status: REWARD_REQUEST_STATUS;

  @ApiProperty({ description: '처리 메모', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RewardRequestResponseDto {
  @ApiProperty({ description: '보상 요청 ID' })
  @IsMongoId()
  rewardRequestId: string;

  @ApiProperty({ description: '사용자 ID' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: '이벤트 ID' })
  @IsMongoId()
  eventId: string;

  @ApiProperty({ description: '보상 ID' })
  @IsMongoId()
  rewardId: string;

  @ApiProperty({ enum: REWARD_REQUEST_STATUS, description: '보상 요청 상태' })
  @IsEnum(REWARD_REQUEST_STATUS)
  status: REWARD_REQUEST_STATUS;

  @ApiProperty({ description: '요청 시간' })
  @IsDate()
  requestedAt: Date;

  @ApiProperty({ description: '처리 시간', required: false })
  @IsDate()
  @IsOptional()
  processedAt?: Date;

  @ApiProperty({ description: '수령 시간', required: false })
  @IsDate()
  @IsOptional()
  claimedAt?: Date;

  @ApiProperty({ description: '처리 메모', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: '생성일' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @IsDate()
  updatedAt: Date;
}

export class CreateRewardRequestWithEventDto {
  @ApiProperty({ description: '이벤트 ID' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: '보상 목록', type: [RewardResponseDto] })
  @IsArray()
  @IsNotEmpty()
  rewards: RewardResponseDto[];

  @ApiProperty({ description: '해당 유저의 이벤트 달성 정보', required: false })
  completedInfo?: CompareData;
}

export class GetRewardRequestsQueryDto {
  @ApiProperty({
    description: '사용자 ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({
    description: '이벤트 ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @ApiProperty({
    description: '보상 ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  rewardId?: string;

  @ApiProperty({
    description: '보상 요청 상태',
    required: false,
    enum: REWARD_REQUEST_STATUS,
  })
  @IsOptional()
  @IsEnum(REWARD_REQUEST_STATUS)
  status?: REWARD_REQUEST_STATUS;

  @ApiProperty({
    description: '요청 시작일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  requestedAtStart?: Date;

  @ApiProperty({
    description: '요청 종료일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  requestedAtEnd?: Date;

  @ApiProperty({
    description: '처리 시작일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  processedAtStart?: Date;

  @ApiProperty({
    description: '처리 종료일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  processedAtEnd?: Date;

  @ApiProperty({
    description: '수령 시작일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  claimedAtStart?: Date;

  @ApiProperty({
    description: '수령 종료일',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  claimedAtEnd?: Date;

  @ApiProperty({
    description: '메모 검색',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
