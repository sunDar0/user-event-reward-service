import { AUTH_EVENT_TYPE } from '@app/common';
import { UserLoginDto } from '@app/common/dtos/user-login.dto';
import { UserRegisterDto } from '@app/common/dtos/user-register.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServerService } from './auth-server.service';

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.REGISTER })
  async registerUser(@Payload() data: UserRegisterDto) {
    return this.authServerService.register(data);
  }

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.LOGIN })
  async loginUser(@Payload() data: UserLoginDto) {
    return this.authServerService.login(data);
  }

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.UPDATE_PROFILE })
  async updateProfile(@Payload() data: { refreshToken: string }) {
    // return this.authServerService.refreshToken(data.refreshToken);
  }
}
