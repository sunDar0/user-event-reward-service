import { RewardRequestResponseDto } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseCreateRewardRequestDto {
  @ApiProperty({ description: '생성된 보상 요청 정보', type: RewardRequestResponseDto })
  rewardRequest: RewardRequestResponseDto;
}

export class ResponseGetMyRewardRequestsDto {
  @ApiProperty({ description: '내 보상 요청 목록', type: [RewardRequestResponseDto] })
  rewardRequests: RewardRequestResponseDto[];
}

export class ResponseGetAllRewardRequestsDto {
  @ApiProperty({ description: '전체 보상 요청 목록', type: [RewardRequestResponseDto] })
  rewardRequests: RewardRequestResponseDto[];
}
