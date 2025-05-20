import { AUTH_EVENT_TYPE, EVENT_EVENT_TYPE, REWARD_EVENT_TYPE, REWARD_REQUEST_STATUS, USER_ROLES } from '@app/common';
import {
  CreateEventDto,
  CreateRewardDto,
  CreateRewardRequestDto,
  GetRewardRequestsQueryDto,
  RegisterUserDto,
  UpdateUserRolesDto,
  UserInfoDto,
  UserLoginDto,
} from '@app/common/dtos';
import { EventResponseDto } from '@app/common/dtos/event.dto';
import { RewardRequestResponseDto } from '@app/common/dtos/reward-request.dto';
import { RewardResponseDto } from '@app/common/dtos/reward.dto';
import { UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { EVENT_FIXTURE } from './fixtures/event.fixture';
import { REWARD_REQUEST_FIXTURE } from './fixtures/reward-request.fixture';
import { REWARD_FIXTURE } from './fixtures/reward.fixture';
import { LOGIN_USER_FIXTURE, USER_FIXTURE } from './fixtures/user.fixture';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;
  let authClient: ClientProxy;
  let eventClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiGatewayService,
        {
          provide: 'AUTH_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: 'EVENT_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiGatewayService>(ApiGatewayService);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
    eventClient = module.get<ClientProxy>('EVENT_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AUTH 서비스', () => {
    describe('registerUser', () => {
      it('유저 등록을 성공해야한다.', async () => {
        // Arrange
        const registerDto: RegisterUserDto = USER_FIXTURE.USER_1.value;
        const mockResponse: UserInfoDto = {
          userId: '1',
          email: registerDto.email,
          name: registerDto.name,
          roles: registerDto.roles,
        };
        jest.spyOn(authClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.registerUser(AUTH_EVENT_TYPE.REGISTER, registerDto));

        // Assert
        expect(authClient.send).toHaveBeenCalledWith({ cmd: AUTH_EVENT_TYPE.REGISTER }, registerDto);
        expect(result).toEqual({ user: mockResponse });
      });

      it('유저 등록 실패시 에러를 반환해야한다.', async () => {
        // Arrange
        const registerDto: RegisterUserDto = USER_FIXTURE.USER_1.value;
        const error = new Error('Registration failed');
        jest.spyOn(authClient, 'send').mockReturnValue(throwError(() => error));

        // Act & Assert
        await expect(firstValueFrom(service.registerUser(AUTH_EVENT_TYPE.REGISTER, registerDto))).rejects.toThrow();
      });
    });

    describe('login', () => {
      it('로그인을 성공해야한다.', async () => {
        // Arrange
        const loginDto: UserLoginDto = LOGIN_USER_FIXTURE.USER_1.value;
        const mockResponse = {
          accessToken: 'token123',
          refreshToken: 'refresh123',
        };
        jest.spyOn(authClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.login(AUTH_EVENT_TYPE.LOGIN, loginDto));

        // Assert
        expect(authClient.send).toHaveBeenCalledWith({ cmd: AUTH_EVENT_TYPE.LOGIN }, loginDto);
        expect(result).toEqual(mockResponse);
      });

      it('인증 실패시 UnauthorizedException을 반환해야한다.', async () => {
        // Arrange
        const loginDto: UserLoginDto = LOGIN_USER_FIXTURE.USER_1.value;
        const error = { status: 401, message: '인증에 실패했습니다.' };
        jest.spyOn(authClient, 'send').mockReturnValue(throwError(() => error));

        // Act & Assert
        await expect(firstValueFrom(service.login(AUTH_EVENT_TYPE.LOGIN, loginDto))).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('updateUserRoles', () => {
      it('사용자 권한 수정을 성공해야한다.', async () => {
        // Arrange
        const userId = '507f1f77bcf86cd799439011';
        const updateRolesDto: UpdateUserRolesDto = {
          roles: [USER_ROLES.OPERATOR, USER_ROLES.AUDITOR],
        };
        const mockResponse: UserInfoDto = {
          userId,
          email: 'test@example.com',
          name: 'Test User',
          roles: updateRolesDto.roles,
        };
        jest.spyOn(authClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.updateUserRoles(AUTH_EVENT_TYPE.UPDATE_ROLES, userId, updateRolesDto));

        // Assert
        expect(authClient.send).toHaveBeenCalledWith({ cmd: AUTH_EVENT_TYPE.UPDATE_ROLES }, { userId, rolesDto: updateRolesDto });
        expect(result).toEqual({ user: mockResponse });
      });
    });
  });

  describe('EVENT 서비스', () => {
    describe('createEvent', () => {
      it('이벤트 생성을 성공해야한다.', async () => {
        // Arrange
        const eventDto: CreateEventDto = EVENT_FIXTURE.LOGIN_STREAK.value;
        const createdBy = '507f1f77bcf86cd799439011';
        const mockResponse: EventResponseDto = {
          eventId: '1',
          ...eventDto,
          createdBy: new Types.ObjectId(createdBy),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.createEvent(EVENT_EVENT_TYPE.CREATE_EVENT, eventDto, createdBy));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: EVENT_EVENT_TYPE.CREATE_EVENT }, { eventDto, createdBy });
        expect(result).toEqual({ event: mockResponse });
      });
    });

    describe('getAllEvents', () => {
      it('모든 이벤트를 조회할 수 있어야한다.', async () => {
        // Arrange
        const mockResponse: EventResponseDto[] = [
          {
            eventId: '1',
            ...EVENT_FIXTURE.LOGIN_STREAK.value,
            createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.getAllEvents(EVENT_EVENT_TYPE.GET_ALL_EVENTS));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: EVENT_EVENT_TYPE.GET_ALL_EVENTS }, {});
        expect(result).toEqual({ events: mockResponse });
      });
    });
  });

  describe('REWARD 서비스', () => {
    describe('createReward', () => {
      it('보상 생성을 성공해야한다.', async () => {
        // Arrange
        const eventId = 'event123';
        const rewardDto: CreateRewardDto = REWARD_FIXTURE.ITEM.value;
        const mockResponse: RewardResponseDto = {
          rewardId: '1',
          eventId,
          ...rewardDto,
          remainingQuantity: rewardDto.quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.createReward(REWARD_EVENT_TYPE.CREATE_REWARD, eventId, rewardDto));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: REWARD_EVENT_TYPE.CREATE_REWARD }, { eventId, createRewardDto: rewardDto });
        expect(result).toEqual({ reward: mockResponse });
      });
    });

    describe('getRewardsByEventId', () => {
      it('이벤트 아이디로 보상을 조회할 수 있어야한다.', async () => {
        // Arrange
        const eventId = 'event123';
        const mockResponse: RewardResponseDto[] = [
          {
            rewardId: '1',
            eventId,
            ...REWARD_FIXTURE.ITEM.value,
            remainingQuantity: REWARD_FIXTURE.ITEM.value.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.getRewardsByEventId(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, eventId));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID }, eventId);
        expect(result).toEqual({ rewards: mockResponse });
      });
    });
  });

  describe('REWARD REQUEST 서비스', () => {
    describe('createRewardRequest', () => {
      it('보상 요청을 성공해야한다.', async () => {
        // Arrange
        const userId = '507f1f77bcf86cd799439011';
        const requestDto: CreateRewardRequestDto = REWARD_REQUEST_FIXTURE.LOGIN_STREAK_REWARD_REQUEST.value;
        const mockResponse: RewardRequestResponseDto = {
          rewardRequestId: '1',
          userId,
          eventId: requestDto.eventId,
          rewardId: 'reward123',
          status: REWARD_REQUEST_STATUS.PENDING,
          requestedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.createRewardRequest(REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST, userId, requestDto));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST }, { userId, requestDto });
        expect(result).toEqual({ rewardRequest: mockResponse });
      });
    });

    describe('getAllRewardRequests', () => {
      it('전체 보상 요청 내역을 조회할 수 있어야한다.', async () => {
        // Arrange
        const query: GetRewardRequestsQueryDto = {
          status: REWARD_REQUEST_STATUS.PENDING,
        };
        const mockResponse: RewardRequestResponseDto[] = [
          {
            rewardRequestId: '1',
            userId: '507f1f77bcf86cd799439011',
            eventId: REWARD_REQUEST_FIXTURE.LOGIN_STREAK_REWARD_REQUEST.value.eventId,
            rewardId: 'reward123',
            status: REWARD_REQUEST_STATUS.PENDING,
            requestedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        jest.spyOn(eventClient, 'send').mockReturnValue(of(mockResponse));

        // Act
        const result = await firstValueFrom(service.getAllRewardRequests(REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS, query));

        // Assert
        expect(eventClient.send).toHaveBeenCalledWith({ cmd: REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS }, query);
        expect(result).toEqual({ rewardRequests: mockResponse });
      });
    });
  });
});
