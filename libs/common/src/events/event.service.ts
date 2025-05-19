import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto, EventResponseDto } from '../dtos';
import { CompareData } from '../interfaces/event.interface';
import { EventConditionStrategyFactory } from './event.condition.strategy';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly eventConditionStrategyFactory: EventConditionStrategyFactory,
  ) {}

  /**
   * 이벤트 생성
   * @param createEventDto 이벤트 생성 정보
   * @param createdBy 생성자 ID
   * @returns 생성된 이벤트 정보
   */
  async createEvent(createEventDto: CreateEventDto, createdBy: string): Promise<EventResponseDto> {
    try {
      const created = new this.eventModel({ ...createEventDto, createdBy });
      const saved = await created.save();
      return this.toResponseDto(saved);
    } catch (error) {
      this.logger.error('Error in createEvent:', error);
      if (error.code === 11000) {
        throw new RpcException({
          message: '이미 등록된 이벤트입니다.',
          status: HttpStatus.CONFLICT,
        });
      }
      throw new RpcException({
        message: '이벤트 생성 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * 모든 이벤트 조회
   * @returns 이벤트 목록
   */
  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.eventModel.find().exec();
    if (!events) {
      throw new RpcException({
        message: '이벤트를 찾을 수 없습니다.',
        status: HttpStatus.NOT_FOUND,
      });
    }
    return events.map(this.toResponseDto);
  }

  /**
   * 이벤트 조회
   * @param id 이벤트 ID
   * @returns 이벤트 정보
   */
  async findById(id: string): Promise<EventResponseDto> {
    const event = await this.eventModel
      .findById(id)
      .populate({
        path: 'rewards',
        select: 'type name details quantity remainingQuantity',
      })
      .exec();

    if (!event) {
      throw new RpcException({
        message: '이벤트를 찾을 수 없습니다.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return this.toResponseDto(event);
  }

  async checkEventCondition(compareData: CompareData, event: EventResponseDto): Promise<boolean> {
    if (!event) {
      throw new RpcException({
        message: '이벤트를 찾을 수 없습니다.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    try {
      const strategy = this.eventConditionStrategyFactory.getStrategy(event.conditions.type);
      return await strategy.validate(compareData, event.conditions);
    } catch (error) {
      this.logger.error(`이벤트 조건 검증 중 오류 발생: ${error.message}`, error.stack);
      // 잘못된 요청일 때
      if (error instanceof BadRequestException) throw new RpcException({ message: error.message, status: HttpStatus.BAD_REQUEST });
      // 서버 오류일 때
      throw new RpcException({
        message: '이벤트 조건 검증 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private toResponseDto(event: EventDocument): EventResponseDto {
    return {
      eventId: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      status: event.status,
      conditions: event.conditions,
      createdBy: event.createdBy,
      rewards: event.rewards?.map((reward) => ({
        rewardId: reward._id.toString(),
        eventId: reward.eventId.toString(),
        type: reward.type,
        name: reward.name,
        details: reward.details,
        quantity: reward.quantity,
        remainingQuantity: reward.remainingQuantity,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
      })),
      createdAt: event.createdAt?.toISOString() ?? '',
      updatedAt: event.updatedAt?.toISOString() ?? '',
    };
  }
}
