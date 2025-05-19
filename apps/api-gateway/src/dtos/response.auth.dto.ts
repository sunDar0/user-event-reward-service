import { UserInfoDto } from '@app/common/dtos/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseLoginDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken: string;
}

export class ResponseRefreshTokenDto {
  @ApiProperty({ description: '새로운 액세스 토큰' })
  newAccessToken: string;

  @ApiProperty({ description: '새로운 리프레시 토큰' })
  newRefreshToken: string;
}

export class ResponseUpdateUserRolesDto {
  @ApiProperty({ description: '사용자 정보' })
  user: UserInfoDto;
}
