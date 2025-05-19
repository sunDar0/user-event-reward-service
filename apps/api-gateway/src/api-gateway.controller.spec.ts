import { AUTH_EVENT_TYPE, EVENT_EVENT_TYPE, REWARD_EVENT_TYPE, USER_ROLES } from '@app/common';
import { BaseResponseDto, CreateEventDto, CreateRewardDto, RegisterUserDto, UserInfoDto, UserLoginDto } from '@app/common/dtos';
import { EventResponseDto } from '@app/common/dtos/event.dto';
import { EVENT_CONDITION_TYPE, EVENT_STATUS } from '@app/common/events/event.constants';
import { EventCondition } from '@app/common/events/event.schema';
import { UserAuthDto } from '@app/common/interfaces';
import { REWARD_TYPE } from '@app/common/reward/reward.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { firstValueFrom, of } from 'rxjs';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ResponseLoginDto } from './dtos/response.auth.dto';
import { ResponseCreateEventDto, ResponseGetAllEventsDto } from './dtos/response.event.dto';
import { ResponseCreateRewardDto, ResponseGetRewardsByEventIdDto } from './dtos/response.reward.dto';

interface ResponseRegisterUserDto {
  user: UserInfoDto;
}

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let service: ApiGatewayService;

  const mockApiGatewayService = {
    registerUser: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    updateUserRoles: jest.fn(),
    createEvent: jest.fn(),
    getAllEvents: jest.fn(),
    getEventById: jest.fn(),
    createReward: jest.fn(),
    getRewardsByEventId: jest.fn(),
    createRewardRequest: jest.fn(),
    getMyRewardRequests: jest.fn(),
    getAllRewardRequests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        {
          provide: ApiGatewayService,
          useValue: mockApiGatewayService,
        },
      ],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
    service = module.get<ApiGatewayService>(ApiGatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Endpoints', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password123',
          name: 'testuser',
          roles: [USER_ROLES.USER],
        };
        const mockResponse: UserInfoDto = {
          userId: '1',
          email: 'test@example.com',
          name: 'testuser',
          roles: [USER_ROLES.USER],
        };
        const mockBaseResponse: BaseResponseDto<ResponseRegisterUserDto> = {
          code: 0,
          result: true,
          status: 200,
          message: '유저등록이 완료되었습니다.',
          data: { user: mockResponse },
        };
        mockApiGatewayService.registerUser.mockReturnValue(of(mockBaseResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseRegisterUserDto>>(controller.register(registerDto));

        // Assert
        expect(service.registerUser).toHaveBeenCalledWith(AUTH_EVENT_TYPE.REGISTER, registerDto);
        expect(result.data.user).toEqual(mockResponse);
        expect(result.message).toBe('유저등록이 완료되었습니다.');
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        // Arrange
        const loginDto: UserLoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };
        const mockResponse: ResponseLoginDto = {
          accessToken: 'token123',
          refreshToken: 'refresh123',
        };
        const mockBaseResponse: BaseResponseDto<ResponseLoginDto> = {
          code: 0,
          result: true,
          status: 200,
          message: '로그인 성공',
          data: mockResponse,
        };
        mockApiGatewayService.login.mockReturnValue(of(mockBaseResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseLoginDto>>(controller.login(loginDto));

        // Assert
        expect(service.login).toHaveBeenCalledWith(AUTH_EVENT_TYPE.LOGIN, loginDto);
        expect(result.data).toEqual(mockResponse);
        expect(result.message).toBe('로그인 성공');
      });
    });
  });

  describe('Event Endpoints', () => {
    describe('createEvent', () => {
      it('should create event successfully', async () => {
        // Arrange
        const eventDto: CreateEventDto = {
          title: 'Test Event',
          description: 'Test Description',
          startDate: '2024-03-20',
          endDate: '2024-03-21',
          status: EVENT_STATUS.ACTIVE,
          conditions: {
            type: EVENT_CONDITION_TYPE.LOGIN_STREAK,
            details: { targetCount: 7 },
          } as EventCondition,
        };
        const userAuth: UserAuthDto = {
          _id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: [USER_ROLES.OPERATOR],
        };
        const mockEventResponse: EventResponseDto = {
          eventId: '1',
          title: eventDto.title,
          description: eventDto.description,
          startDate: eventDto.startDate,
          endDate: eventDto.endDate,
          status: eventDto.status,
          conditions: eventDto.conditions,
          createdBy: new Types.ObjectId(userAuth._id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockBaseResponse: BaseResponseDto<ResponseCreateEventDto> = {
          code: 0,
          result: true,
          status: 200,
          message: '이벤트 생성 성공',
          data: { event: mockEventResponse },
        };
        mockApiGatewayService.createEvent.mockReturnValue(of(mockBaseResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseCreateEventDto>>(controller.createEvent(eventDto, userAuth));

        // Assert
        expect(service.createEvent).toHaveBeenCalledWith(EVENT_EVENT_TYPE.CREATE_EVENT, eventDto, userAuth._id);
        expect(result.data).toEqual({ event: mockEventResponse });
        expect(result.message).toBe('이벤트 생성 성공');
      });
    });

    describe('getAllEvents', () => {
      it('should get all events successfully', async () => {
        // Arrange
        const mockEventResponse: EventResponseDto = {
          eventId: '1',
          title: 'Event 1',
          description: 'Description 1',
          startDate: '2024-03-20',
          endDate: '2024-03-21',
          status: EVENT_STATUS.ACTIVE,
          conditions: {
            type: EVENT_CONDITION_TYPE.LOGIN_STREAK,
            details: { targetCount: 7 },
          } as EventCondition,
          createdBy: new Types.ObjectId('user123'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockBaseResponse: BaseResponseDto<ResponseGetAllEventsDto> = {
          code: 0,
          result: true,
          status: 200,
          message: '이벤트 목록 조회 성공',
          data: { events: [mockEventResponse] },
        };
        mockApiGatewayService.getAllEvents.mockReturnValue(of(mockBaseResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseGetAllEventsDto>>(controller.getAllEvents());

        // Assert
        expect(service.getAllEvents).toHaveBeenCalledWith(EVENT_EVENT_TYPE.GET_ALL_EVENTS);
        expect(result.data).toEqual({ events: [mockEventResponse] });
        expect(result.message).toBe('이벤트 목록 조회 성공');
      });
    });
  });

  describe('Reward Endpoints', () => {
    describe('createReward', () => {
      it('should create reward successfully', async () => {
        // Arrange
        const eventId = 'event123';
        const rewardDto: CreateRewardDto = {
          name: 'Test Reward',
          type: REWARD_TYPE.ITEM,
          quantity: 100,
          details: { itemId: 'item123' },
        };
        const mockResponse: ResponseCreateRewardDto = {
          reward: {
            rewardId: '1',
            eventId,
            ...rewardDto,
            remainingQuantity: rewardDto.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
        const mockBaseResponse: BaseResponseDto<ResponseCreateRewardDto> = {
          code: 0,
          result: true,
          status: 200,
          message: '보상 등록 성공',
          data: mockResponse,
        };
        mockApiGatewayService.createReward.mockReturnValue(of(mockBaseResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseCreateRewardDto>>(controller.createReward(eventId, rewardDto));

        // Assert
        expect(service.createReward).toHaveBeenCalledWith(REWARD_EVENT_TYPE.CREATE_REWARD, eventId, rewardDto);
        expect(result.data).toEqual(mockResponse);
        expect(result.message).toBe('보상 등록 성공');
      });
    });

    describe('getRewardsByEventId', () => {
      it('should get rewards by event id successfully', async () => {
        // Arrange
        const eventId = 'event123';
        const mockResponse: ResponseGetRewardsByEventIdDto = {
          rewards: [
            {
              rewardId: '1',
              eventId,
              name: 'Reward 1',
              type: REWARD_TYPE.ITEM,
              quantity: 100,
              remainingQuantity: 100,
              details: {},
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
        mockApiGatewayService.getRewardsByEventId.mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom<BaseResponseDto<ResponseGetRewardsByEventIdDto>>(controller.getRewardsByEventId(eventId));

        // Assert
        expect(service.getRewardsByEventId).toHaveBeenCalledWith(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, eventId);
        expect(result.data).toEqual(mockResponse);
        expect(result.message).toBe('보상 목록 조회 성공');
      });
    });
  });
});
