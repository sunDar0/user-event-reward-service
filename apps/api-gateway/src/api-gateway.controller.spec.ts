import { AUTH_EVENT_TYPE, EVENT_EVENT_TYPE, REWARD_EVENT_TYPE, REWARD_REQUEST_STATUS, setValueInJestProvide, USER_ROLES } from '@app/common';
import { GetRewardRequestsQueryDto, UpdateUserRolesDto, UserInfoDto } from '@app/common/dtos';
import { EventResponseDto } from '@app/common/dtos/event.dto';
import { UserAuthDto } from '@app/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { firstValueFrom, of } from 'rxjs';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ResponseLoginDto, ResponseRefreshTokenDto, ResponseUpdateUserRolesDto } from './dtos/response.auth.dto';
import { EVENT_FIXTURE } from './fixtures/event.fixture';
import { REWARD_REQUEST_FIXTURE } from './fixtures/reward-request.fixture';
import { REWARD_FIXTURE } from './fixtures/reward.fixture';
import { LOGIN_USER_FIXTURE, USER_FIXTURE } from './fixtures/user.fixture';

type MockApiGatewayService = jest.Mocked<ApiGatewayService>;

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let service: MockApiGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        {
          provide: ApiGatewayService,
          useValue: setValueInJestProvide(ApiGatewayService),
        },
      ],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
    service = module.get<MockApiGatewayService>(ApiGatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AUTH EVENT 엔드포인트', () => {
    describe('register', () => {
      it('유저 등록을 성공해야한다.', async () => {
        // Arrange
        const registerDto = USER_FIXTURE.USER_1.value;
        const mockResponse: UserInfoDto = {
          userId: '1',
          email: registerDto.email,
          name: registerDto.name,
          roles: registerDto.roles,
        };
        const mockServiceResponse = { user: mockResponse };
        service.registerUser.mockReturnValue(of(mockServiceResponse));

        // Act
        const result = await firstValueFrom(controller.register(registerDto));

        // Assert
        expect(service.registerUser).toHaveBeenCalledWith(AUTH_EVENT_TYPE.REGISTER, registerDto);
        expect(result).toEqual({ code: 0, status: 201, message: '유저등록이 완료되었습니다.', data: mockServiceResponse });
      });
    });

    describe('login', () => {
      it('로그인을 성공해야한다.', async () => {
        // Arrange
        const loginDto = LOGIN_USER_FIXTURE.USER_1.value;
        const mockLoginResponse: ResponseLoginDto = {
          accessToken: 'token123',
          refreshToken: 'refresh123',
        };
        service.login.mockReturnValue(of(mockLoginResponse));

        // Act
        const result = await firstValueFrom(controller.login(loginDto));

        // Assert
        expect(service.login).toHaveBeenCalledWith(AUTH_EVENT_TYPE.LOGIN, loginDto);
        expect(result).toEqual({ code: 0, status: 200, message: '로그인 성공', data: mockLoginResponse });
      });
    });

    describe('refreshToken', () => {
      it('토큰 갱신을 성공해야한다.', async () => {
        // Arrange
        const refreshToken = 'refresh-token-123';
        const mockRefreshTokenResponse: ResponseRefreshTokenDto = {
          newAccessToken: 'new-access-token-123',
          newRefreshToken: 'new-refresh-token-123',
        };
        service.refreshAccessToken.mockReturnValue(of(mockRefreshTokenResponse));

        // Act
        const result = await firstValueFrom(controller.refreshToken(refreshToken));

        // Assert
        expect(service.refreshAccessToken).toHaveBeenCalledWith(AUTH_EVENT_TYPE.REFRESH_TOKEN, refreshToken);
        expect(result).toEqual({ code: 0, status: 200, message: '토큰 갱신 성공', data: mockRefreshTokenResponse });
      });
    });

    describe('updateUserRoles', () => {
      it('사용자 권한 수정을 성공해야한다.', async () => {
        // Arrange
        const userId = '507f1f77bcf86cd799439011';
        const updateRolesDto: UpdateUserRolesDto = {
          roles: [USER_ROLES.OPERATOR, USER_ROLES.AUDITOR],
        };
        const mockUpdateRolesResponse: ResponseUpdateUserRolesDto = {
          user: {
            userId,
            email: 'test@example.com',
            name: 'Test User',
            roles: updateRolesDto.roles,
          },
        };
        service.updateUserRoles.mockReturnValue(of(mockUpdateRolesResponse));

        // Act
        const result = await firstValueFrom(controller.updateUserRoles(userId, updateRolesDto));

        // Assert
        expect(service.updateUserRoles).toHaveBeenCalledWith(AUTH_EVENT_TYPE.UPDATE_ROLES, userId, updateRolesDto);
        expect(result).toEqual({ code: 0, status: 200, message: '사용자 권한 수정 성공', data: mockUpdateRolesResponse });
      });
    });
  });

  describe('EVENT 엔드포인트', () => {
    describe('createEvent', () => {
      it('이벤트 생성을 성공해야한다.', async () => {
        // Arrange
        const eventDto = EVENT_FIXTURE.LOGIN_STREAK.value;
        const userAuth: UserAuthDto = {
          _id: '507f1f77bcf86cd799439011',
          ...USER_FIXTURE.OPERATOR_1.value,
        };
        const mockEventResponse: EventResponseDto = {
          eventId: '1',
          ...eventDto,
          createdBy: new Types.ObjectId(userAuth._id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockServiceResponse = { event: mockEventResponse };
        service.createEvent.mockReturnValue(of(mockServiceResponse));

        // Act
        const result = await firstValueFrom(controller.createEvent(eventDto, userAuth));

        // Assert
        expect(service.createEvent).toHaveBeenCalledWith(EVENT_EVENT_TYPE.CREATE_EVENT, eventDto, userAuth._id);
        expect(result).toEqual({ code: 0, status: 201, message: '이벤트 생성 성공', data: mockServiceResponse });
      });
    });

    describe('getAllEvents', () => {
      it('모든 이벤트를 조회할 수 있어야한다.', async () => {
        // Arrange
        const mockEventResponse: EventResponseDto = {
          eventId: '1',
          ...EVENT_FIXTURE.LOGIN_STREAK.value,
          createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockServiceResponse = { events: [mockEventResponse] };
        service.getAllEvents.mockReturnValue(of(mockServiceResponse));

        // Act
        const result = await firstValueFrom(controller.getAllEvents());

        // Assert
        expect(service.getAllEvents).toHaveBeenCalledWith(EVENT_EVENT_TYPE.GET_ALL_EVENTS);
        expect(result).toEqual({ code: 0, status: 200, message: '이벤트 목록 조회 성공', data: mockServiceResponse });
      });
    });

    describe('getEventById', () => {
      it('이벤트 상세 조회를 성공해야한다.', async () => {
        // Arrange
        const eventId = '507f1f77bcf86cd799439011';
        const mockEventResponse: EventResponseDto = {
          eventId,
          ...EVENT_FIXTURE.LOGIN_STREAK.value,
          createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockServiceResponse = { event: mockEventResponse };
        service.getEventById.mockReturnValue(of(mockServiceResponse));

        // Act
        const result = await firstValueFrom(controller.getEventById(eventId));

        // Assert
        expect(service.getEventById).toHaveBeenCalledWith(EVENT_EVENT_TYPE.GET_EVENT_BY_ID, eventId);
        expect(result).toEqual({ code: 0, status: 200, message: '이벤트 상세 조회 성공', data: mockServiceResponse });
      });
    });
  });

  describe('REWARD 엔드포인트', () => {
    describe('createReward', () => {
      it('보상 생성을 성공해야한다.', async () => {
        // Arrange
        const eventId = 'event123';
        const rewardDto = REWARD_FIXTURE.ITEM.value;
        const mockRewardResponse = {
          reward: {
            rewardId: '1',
            eventId,
            ...rewardDto,
            remainingQuantity: rewardDto.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
        service.createReward.mockReturnValue(of(mockRewardResponse));

        // Act
        const result = await firstValueFrom(controller.createReward(eventId, rewardDto));

        // Assert
        expect(service.createReward).toHaveBeenCalledWith(REWARD_EVENT_TYPE.CREATE_REWARD, eventId, rewardDto);
        expect(result).toEqual({ code: 0, status: 201, message: '보상 등록 성공', data: mockRewardResponse });
      });
    });

    describe('getRewardsByEventId', () => {
      it('이벤트 아이디로 보상을 조회할 수 있어야한다.', async () => {
        // Arrange
        const eventId = 'event123';
        const mockRewardsResponse = {
          rewards: [
            {
              rewardId: '1',
              eventId,
              ...REWARD_FIXTURE.ITEM.value,
              remainingQuantity: REWARD_FIXTURE.ITEM.value.quantity,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
        service.getRewardsByEventId.mockReturnValue(of(mockRewardsResponse));

        // Act
        const result = await firstValueFrom(controller.getRewardsByEventId(eventId));

        // Assert
        expect(service.getRewardsByEventId).toHaveBeenCalledWith(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, eventId);
        expect(result).toEqual({ code: 0, status: 200, message: '보상 목록 조회 성공', data: mockRewardsResponse });
      });
    });
  });

  describe('REWARD REQUEST 엔드포인트', () => {
    describe('createRewardRequest', () => {
      it('보상 요청을 성공해야한다.', async () => {
        // Arrange
        const requestDto = REWARD_REQUEST_FIXTURE.LOGIN_STREAK_REWARD_REQUEST.value;
        const userAuth: UserAuthDto = {
          _id: '507f1f77bcf86cd799439011',
          ...USER_FIXTURE.USER_1.value,
        };
        const mockRewardRequestResponse = {
          rewardRequest: {
            rewardRequestId: '1',
            userId: userAuth._id,
            eventId: requestDto.eventId,
            rewardId: 'reward123',
            status: REWARD_REQUEST_STATUS.PENDING,
            requestedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
        service.createRewardRequest.mockReturnValue(of(mockRewardRequestResponse));

        // Act
        const result = await firstValueFrom(controller.createRewardRequest(requestDto, userAuth));

        // Assert
        expect(service.createRewardRequest).toHaveBeenCalledWith(REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST, userAuth._id, requestDto);
        expect(result).toEqual({ code: 0, status: 201, message: '보상 요청 성공', data: mockRewardRequestResponse });
      });
    });

    describe('getMyRewardRequests', () => {
      it('내 보상 요청 내역을 조회할 수 있어야한다.', async () => {
        // Arrange
        const userAuth: UserAuthDto = {
          _id: '507f1f77bcf86cd799439011',
          ...USER_FIXTURE.USER_1.value,
        };
        const mockRewardRequestsResponse = {
          rewardRequests: [
            {
              rewardRequestId: '1',
              userId: userAuth._id,
              eventId: REWARD_REQUEST_FIXTURE.LOGIN_STREAK_REWARD_REQUEST.value.eventId,
              rewardId: 'reward123',
              status: REWARD_REQUEST_STATUS.PENDING,
              requestedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
        service.getMyRewardRequests.mockReturnValue(of(mockRewardRequestsResponse));

        // Act
        const result = await firstValueFrom(controller.getMyRewardRequests(userAuth));

        // Assert
        expect(service.getMyRewardRequests).toHaveBeenCalledWith(REWARD_EVENT_TYPE.GET_REWARD_REQUESTS_BY_USER_ID, userAuth._id);
        expect(result).toEqual({ code: 0, status: 200, message: '보상 요청 내역 조회 성공', data: mockRewardRequestsResponse });
      });
    });

    describe('getAllRewardRequests', () => {
      it('전체 보상 요청 내역을 조회할 수 있어야한다.', async () => {
        // Arrange
        const query: GetRewardRequestsQueryDto = {
          status: REWARD_REQUEST_STATUS.PENDING,
        };
        const mockRewardRequestsResponse = {
          rewardRequests: [
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
          ],
        };
        service.getAllRewardRequests.mockReturnValue(of(mockRewardRequestsResponse));

        // Act
        const result = await firstValueFrom(controller.getAllRewardRequests(query));

        // Assert
        expect(service.getAllRewardRequests).toHaveBeenCalledWith(REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS, query);
        expect(result).toEqual({ code: 0, status: 200, message: '전체 보상 요청 내역 조회 성공', data: mockRewardRequestsResponse });
      });
    });
  });
});
