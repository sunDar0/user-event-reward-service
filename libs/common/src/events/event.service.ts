import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto, EventResponseDto } from '../dtos';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  /**
   * 이벤트 생성
   * @param createEventDto 이벤트 생성 정보
   * @param createdBy 생성자 ID
   * @returns 생성된 이벤트 정보
   */
  async create(createEventDto: CreateEventDto, createdBy: string): Promise<EventResponseDto> {
    try {
      if (!Types.ObjectId.isValid(createdBy)) {
        throw new RpcException({
          message: '유효하지 않은 생성자 ID 형식입니다.',
          status: HttpStatus.BAD_REQUEST,
        });
      }
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
    console.log('id === ', id);
    const event = await this.eventModel.findById(id).exec();
    console.log('event === ', event);
    if (!event) {
      throw new RpcException({
        message: '이벤트를 찾을 수 없습니다.',
        status: HttpStatus.NOT_FOUND,
      });
    }
    return this.toResponseDto(event);
  }

  private toResponseDto(event: EventDocument): EventResponseDto {
    return {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      status: event.status,
      conditions: event.conditions,
      createdBy: event.createdBy,
      createdAt: event.createdAt?.toISOString() ?? '',
      updatedAt: event.updatedAt?.toISOString() ?? '',
    };
  }
}
