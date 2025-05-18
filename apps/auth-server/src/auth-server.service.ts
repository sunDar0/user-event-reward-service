import { JwtService, UserDocument, UserPayload, UserService } from '@app/common';
import { RegisterUserDto, UserInfoDto, UserLoginDto } from '@app/common/dtos';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { AuthServerParser } from './auth-server.parser';

@Injectable()
export class AuthServerService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly parser: AuthServerParser,
  ) {}

  /**
   * 사용자 등록을 처리합니다.
   * @param {registerDto} 사용자 등록 정보
   * @returns 등록된 사용자 정보
   */
  async register(registerDto: RegisterUserDto): Promise<UserInfoDto> {
    registerDto.password = await bcrypt.hash(registerDto.password, 10);
    const user: UserDocument = await this.userService.createUser(registerDto);
    return this.parser.parseRegisterUserData(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const { _id, name }: UserPayload = await this.jwtService.verifyRefreshToken(refreshToken);
      // DB에 저장된 Refresh Token과 일치하는지, 유효한지 검증
      const user = await this.userService.getUserByRefreshToken(_id, name, refreshToken);
      if (!user) {
        throw new UnauthorizedException('잘못된 토큰이거나, 이미 만료된 토큰입니다.');
      }
      console.log('user', user);
      const payload = {
        _id: user._id.toString(),
        name: user.name,
      } satisfies UserPayload;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.jwtService.generateTokens(payload);

      user.refreshToken = newRefreshToken;
      await this.userService.updateUser(user);

      return { newAccessToken, newRefreshToken };
    } catch (error) {
      console.error('Error during refreshToken:', error); // 에러 로깅 추가
      throw new RpcException({
        message: '잘못된 토큰이거나, 이미 만료된 토큰입니다.',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  /**
   * 사용자 로그인을 처리하고 JWT 토큰을 발행합니다.
   * @param loginDto 로그인 정보
   * @returns JWT 토큰 정보
   */
  async login(loginDto: UserLoginDto) {
    const user: UserDocument = await this.userService.getUserByEmail(loginDto.email);

    if (!user) {
      throw new RpcException({
        message: '등록된 유저가 없거나, 패스워드가 일치하지 않습니다.',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    // 비밀번호 검증
    const isPasswordValid = (await bcrypt.compare(loginDto.password, user.password)) ?? false;
    if (!isPasswordValid) {
      throw new RpcException({
        message: '등록된 유저가 없거나, 패스워드가 일치하지 않습니다.',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // JWT 토큰 발행

    const payload = {
      _id: user._id.toString(),
      name: user.name,
    } satisfies UserPayload;
    const { accessToken, refreshToken } = await this.jwtService.generateTokens(payload);

    user.refreshToken = refreshToken;
    user.lastLoginAt = dayjs().toDate();
    await this.userService.updateUser(user);

    return { accessToken, refreshToken };
  }
}
