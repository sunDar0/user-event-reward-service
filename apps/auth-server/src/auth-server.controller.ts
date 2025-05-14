import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServerService } from './auth-server.service';

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @MessagePattern({ cmd: 'register' })
  registerUser(data: any): string {
    // Process the received data
    return `Received data: ${JSON.stringify(data)}`;
  }
}
