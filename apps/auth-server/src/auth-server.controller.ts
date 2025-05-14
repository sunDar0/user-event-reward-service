import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { AuthServerService } from "./auth-server.service";

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @MessagePattern({ cmd: "ping" })
  ping(): string {
    return "Auth Microservice is alive";
  }
}
