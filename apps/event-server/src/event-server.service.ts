import { CreateEventDto, EventResponseDto, EventService } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventServerService {
  constructor(private readonly eventService: EventService) {}

  async createEvent(createEventDto: CreateEventDto, createdBy: string): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto, createdBy);
  }

  async getAllEvents(): Promise<EventResponseDto[]> {
    return this.eventService.findAll();
  }

  async getEventById(id: string): Promise<EventResponseDto> {
    return this.eventService.findById(id);
  }
}
