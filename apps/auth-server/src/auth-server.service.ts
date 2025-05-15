import { UserLoginDto } from '@app/common/dtos';
import { UserRegisterDto } from '@app/common/dtos/user-register.dto';
import { UserService } from '@app/common/user/user.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServerService {
  constructor(private readonly userService: UserService) {}

  async register(registerDto: UserRegisterDto) {
    registerDto.password = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.userService.createUser(registerDto);

    // 비밀번호를 제외한 사용자 정보 반환
    const { password: _, ...result } = newUser;
    return result;
  }

  /**
   * 사용자 로그인을 처리하고 JWT 토큰을 발행합니다.
   * @param loginDto 로그인 정보
   * @returns JWT 토큰 정보
   */
  async login(loginDto: UserLoginDto) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new RpcException({
        message: '등록되지 않은 유저가 없거나, 패스워드가 일치하지 않습니다.',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    // 비밀번호 검증
    const isPasswordValid = (await bcrypt.compare(loginDto.password, user.password)) ?? false;
    if (!isPasswordValid) {
      throw new RpcException({
        message: '등록되지 않은 유저가 없거나, 패스워드가 일치하지 않습니다.',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // JWT 토큰 발행
    const payload = {
      // sub: user.,
      // email: user.email,
      // name: user.name,
      // roles: user.roles,
    };
    console.log(user);
    // this.jwtService.generateTokens(payload);
    return;
  }
}
