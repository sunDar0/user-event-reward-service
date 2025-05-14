import { UserRegisterDto } from '@app/common/dtos/user-register.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServerService } from './auth-server.service';

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @MessagePattern({ cmd: 'register' })
  registerUser(data: UserRegisterDto): string {
    // Process the received data
    return `Received data: ${JSON.stringify(data)}`;
  }

  @MessagePattern({ cmd: 'login' })
  loginUser(data: any): string {
    // Process the received data
    return `Received data: ${JSON.stringify(data)}`;
  }
}
