import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { EventServerService } from "./event-server.service";

@Controller()
export class EventServerController {
  constructor(private readonly eventServerService: EventServerService) {}

  @MessagePattern({ cmd: "ping" })
  ping(): string {
    return "Event Microservice is alive";
  }
}
