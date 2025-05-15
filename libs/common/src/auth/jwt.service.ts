import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Access Token과 Refresh Token을 발행합니다.
   * @param payload 토큰에 포함할 데이터
   * @returns { accessToken: string, refreshToken: string }
   */
  async generateTokens(payload: any): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
