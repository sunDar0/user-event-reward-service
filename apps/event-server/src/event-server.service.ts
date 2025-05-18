import { CreateEventDto, EventResponseDto, EventService, RewardService } from '@app/common';
import { CreateRewardDto } from '@app/common/dtos/reward.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EventServerService {
  constructor(
    private readonly eventService: EventService,
    private readonly rewardService: RewardService,
  ) {}

  async createEvent(createEventDto: CreateEventDto, createdBy: string): Promise<EventResponseDto> {
    return this.eventService.createEvent(createEventDto, createdBy);
  }

  async getAllEvents(): Promise<EventResponseDto[]> {
    return this.eventService.findAll();
  }

  async getEventById(id: string): Promise<EventResponseDto> {
    return this.eventService.findById(id);
  }

  async createReward(eventId: string, createRewardDto: CreateRewardDto) {
    try {
      const event = await this.eventService.findById(eventId);
      if (!event) {
        throw new RpcException({
          message: '이벤트를 찾을 수 없습니다.',
          status: HttpStatus.NOT_FOUND,
        });
      }
      const newReward = await this.rewardService.createReward(eventId, createRewardDto);
      return newReward;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.status,
      });
    }
  }

  async getRewardsByEventId(eventId: string) {
    const rewards = await this.rewardService.getRewardsByEventId(eventId);

    return rewards;
  }
}
