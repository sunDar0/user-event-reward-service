import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAuthDto, UserPayload } from '../interfaces';
import { UserDocument, UserService } from '../user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: UserPayload) {
    // UserService를 사용하여 사용자 조회
    const user: UserDocument = await this.userService.getUserById(payload._id);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles,
    } satisfies UserAuthDto;
  }
}
