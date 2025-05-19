import { CreateEventDto, EventResponseDto, EventService, RewardRequestService, RewardService } from '@app/common';
import { CreateRewardRequestDto, CreateRewardRequestWithEventDto, RewardRequestResponseDto } from '@app/common/dtos/reward-request.dto';
import { CreateRewardDto } from '@app/common/dtos/reward.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EventServerService {
  constructor(
    private readonly eventService: EventService,
    private readonly rewardService: RewardService,
    private readonly rewardRequestService: RewardRequestService,
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

  // 보상 요청 생성
  async createRewardRequest(userId: string, dto: CreateRewardRequestDto): Promise<RewardRequestResponseDto[]> {
    try {
      // 이벤트 존재 확인 및 보상 목록 조회
      const event = await this.eventService.findById(dto.eventId);
      if (!event) {
        throw new RpcException({
          message: '이벤트를 찾을 수 없습니다.',
          status: HttpStatus.NOT_FOUND,
        });
      }
      if (!event.rewards || event.rewards.length === 0) {
        throw new RpcException({
          message: '해당 이벤트에 등록된 보상이 없습니다.',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      // 이벤트 조건 검증
      const isConditionMet = await this.eventService.checkEventCondition(dto.completedInfo, event);
      if (!isConditionMet) {
        throw new RpcException({
          message: '이벤트 조건을 충족하지 않았습니다.',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // 이벤트와 보상 정보를 포함한 DTO 생성
      const requestWithEventDto: CreateRewardRequestWithEventDto = {
        eventId: dto.eventId,
        rewards: event.rewards,
        completedInfo: dto.completedInfo,
      };

      // 보상 요청 서비스 호출
      return await this.rewardRequestService.createRewardRequestWithEvent(userId, requestWithEventDto);
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  // 사용자별 보상 요청 목록 조회
  async getRewardRequestsByUserId(userId: string): Promise<RewardRequestResponseDto[]> {
    try {
      return await this.rewardRequestService.getRewardRequestsByUserId(userId);
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  // 전체 보상 요청 목록 조회 (필터링 가능)
  async getAllRewardRequests(filters: Record<string, any> = {}): Promise<RewardRequestResponseDto[]> {
    try {
      return await this.rewardRequestService.getAllRewardRequests(filters);
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
