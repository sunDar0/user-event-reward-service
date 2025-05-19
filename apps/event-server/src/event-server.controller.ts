import { CreateEventDto, EVENT_EVENT_TYPE, REWARD_EVENT_TYPE } from '@app/common';
import { CreateRewardRequestDto } from '@app/common/dtos/reward-request.dto';
import { CreateRewardDto } from '@app/common/dtos/reward.dto';
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
  async getEventById(@Payload() eventId: string) {
    return await this.eventServerService.getEventById(eventId);
  }

  @MessagePattern({ cmd: REWARD_EVENT_TYPE.CREATE_REWARD })
  async createReward(@Payload() payload: { eventId: string; createRewardDto: CreateRewardDto }) {
    return await this.eventServerService.createReward(payload.eventId, payload.createRewardDto);
  }

  @MessagePattern({ cmd: REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID })
  async getEventRewardsByEventId(@Payload() eventId: string) {
    return await this.eventServerService.getRewardsByEventId(eventId);
  }

  // 보상 요청 생성
  @MessagePattern({ cmd: REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST })
  async createRewardRequest(@Payload() payload: { userId: string; requestDto: CreateRewardRequestDto }) {
    try {
      const requests = await this.eventServerService.createRewardRequest(payload.userId, payload.requestDto);
      return requests;
    } catch (error) {
      this.logger.error('Error in createRewardRequest:', error);
      throw error;
    }
  }

  // 사용자별 보상 요청 조회
  @MessagePattern({ cmd: REWARD_EVENT_TYPE.GET_REWARD_REQUESTS_BY_USER_ID })
  async getRewardRequestsByUserId(@Payload() userId: string) {
    try {
      return await this.eventServerService.getRewardRequestsByUserId(userId);
    } catch (error) {
      this.logger.error('Error in getRewardRequestsByUserId:', error);
      throw error;
    }
  }

  // 전체 보상 요청 조회
  @MessagePattern({ cmd: REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS })
  async getAllRewardRequests(@Payload() filters: Record<string, any> = {}) {
    try {
      return await this.eventServerService.getAllRewardRequests(filters);
    } catch (error) {
      this.logger.error('Error in getAllRewardRequests:', error);
      throw error;
    }
  }
}
