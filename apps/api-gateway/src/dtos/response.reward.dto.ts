import { RewardResponseDto } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseCreateRewardDto {
  @ApiProperty({ description: '생성된 보상 정보', type: RewardResponseDto })
  reward: RewardResponseDto;
}

export class ResponseGetRewardsByEventIdDto {
  @ApiProperty({ description: '보상 목록', type: [RewardResponseDto] })
  rewards: RewardResponseDto[];
}
