import { UserInfoDto } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseRegisterUserDto {
  @ApiProperty({ description: '유저 정보', type: UserInfoDto })
  user: UserInfoDto;
}
