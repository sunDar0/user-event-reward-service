import { CreateEventDto, EVENT_EVENT_TYPE } from '@app/common';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventServerService } from './event-server.service';

@Controller()
export class EventServerController {
  private readonly logger = new Logger(EventServerController.name);

  constructor(private readonly eventServerService: EventServerService) {}

  @MessagePattern({ cmd: EVENT_EVENT_TYPE.CREATE_EVENT })
  async createEvent(@Payload() payload: { eventDto: CreateEventDto; createdBy: string }) {
    return await this.eventServerService.createEvent(payload.eventDto, payload.createdBy);
  }

  @MessagePattern({ cmd: EVENT_EVENT_TYPE.GET_ALL_EVENTS })
  async getAllEvents() {
    try {
      const events = await this.eventServerService.getAllEvents();
      return events;
    } catch (error) {
      this.logger.error('Error in getAllEvents:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: EVENT_EVENT_TYPE.GET_EVENT_BY_ID })
  async getEventById(@Payload() payload: { id: string }) {
    return await this.eventServerService.getEventById(payload.id);
  }
}
