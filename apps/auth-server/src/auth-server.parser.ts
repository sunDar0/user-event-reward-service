import { UserDocument, UserInfoDto } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthServerParser {
  /**
   * 유저 정보를 DTO로 변환합니다.
   * @param {UserDocument} data
   * @returns {UserInfoDto}
   */
  parseUserData(data: UserDocument): UserInfoDto {
    return {
      userId: data._id.toString(),
      email: data.email,
      name: data.name,
      roles: data.roles,
    } satisfies UserInfoDto;
  }
}
