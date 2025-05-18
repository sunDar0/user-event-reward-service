import { AUTH_EVENT_TYPE } from '@app/common';
import { RegisterUserDto } from '@app/common/dtos';
import { UpdateUserRolesDto, UserLoginDto } from '@app/common/dtos/user.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServerService } from './auth-server.service';

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.REGISTER })
  async registerUser(@Payload() data: RegisterUserDto) {
    return this.authServerService.register(data);
  }

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.LOGIN })
  async loginUser(@Payload() data: UserLoginDto) {
    return await this.authServerService.login(data);
  }

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.REFRESH_TOKEN })
  async refreshToken(@Payload() refreshToken: string) {
    return await this.authServerService.refreshToken(refreshToken);
  }

  @MessagePattern({ cmd: AUTH_EVENT_TYPE.UPDATE_ROLES })
  async updateUserRoles(@Payload() data: { userId: string; rolesDto: UpdateUserRolesDto }) {
    return this.authServerService.updateUserRoles(data.userId, data.rolesDto);
  }
}
