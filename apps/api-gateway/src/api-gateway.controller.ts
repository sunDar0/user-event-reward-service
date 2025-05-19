import { AUTH_EVENT_TYPE, EVENT_EVENT_TYPE, GenerateSwaggerApiDoc, JwtAuthGuard, REWARD_EVENT_TYPE, Roles, RolesGuard, UserAuth } from '@app/common';
import { ObjectIdPipe } from '@app/common/common.pipe';
import { CreateEventDto, CreateRewardDto, CreateRewardRequestDto, RegisterUserDto, UpdateUserRolesDto, UserLoginDto } from '@app/common/dtos';
import { AllExceptionsFilter, UnauthorizedExceptionFilter } from '@app/common/exception-filters';
import { UserAuthDto } from '@app/common/interfaces';
import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { map } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { ResponseLoginDto, ResponseRefreshTokenDto, ResponseUpdateUserRolesDto } from './dtos/response.auth.dto';
import { ResponseCreateEventDto, ResponseGetAllEventsDto, ResponseGetEventByIdDto } from './dtos/response.event.dto';
import { ResponseCreateRewardRequestDto, ResponseGetAllRewardRequestsDto, ResponseGetMyRewardRequestsDto } from './dtos/response.reward-request.dto';
import { ResponseCreateRewardDto, ResponseGetRewardsByEventIdDto } from './dtos/response.reward.dto';
import { ResponseRegisterUserDto } from './dtos/response.user.dto';
import { EVENT_FIXTURE } from './fixtures/event.fixture';
import { REWARD_FIXTURE } from './fixtures/reward.fixture';
import { response } from './helper/response.helper';

@ApiBearerAuth('jwt')
@Controller({ path: 'api', version: '1' })
@UseFilters(AllExceptionsFilter, UnauthorizedExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Auth 서비스 라우팅
  @Post('auth/register')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '유저 등록',
    description: '유저 등록을 진행합니다.',
    isPublic: true,
    body: { type: RegisterUserDto },
    responseType: ResponseRegisterUserDto,
  })
  register(@Body() RegisterUserDto: RegisterUserDto) {
    return this.apiGatewayService
      .registerUser(AUTH_EVENT_TYPE.REGISTER, RegisterUserDto)
      .pipe(map((user: ResponseRegisterUserDto) => response(user, '유저등록이 완료되었습니다.', HttpStatus.CREATED)));
  }

  @Post('auth/login')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '로그인',
    description: '로그인을 시도합니다.',
    isPublic: true,
    body: { type: UserLoginDto },
    responseType: ResponseLoginDto,
  })
  async login(@Body() loginDto: UserLoginDto) {
    return this.apiGatewayService
      .login(AUTH_EVENT_TYPE.LOGIN, loginDto)
      .pipe(map((loginResponse: ResponseLoginDto) => response(loginResponse, '로그인 성공', HttpStatus.OK)));
  }

  @Get('auth/refresh')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '토큰 갱신',
    description: '리프레시 토큰을 활용해 엑세스 토큰을 갱신합니다.',
    isPublic: true,
    query: { type: 'string', name: 'refreshToken', description: '리프레시 토큰' },
    responseType: ResponseRefreshTokenDto,
  })
  refreshToken(@Query('refreshToken') refreshToken: string) {
    console.log('refreshToken', refreshToken);
    return this.apiGatewayService
      .refreshAccessToken(AUTH_EVENT_TYPE.REFRESH_TOKEN, refreshToken)
      .pipe(map((refreshTokenResponse: ResponseRefreshTokenDto) => response(refreshTokenResponse, '토큰 갱신 성공', HttpStatus.OK)));
  }

  @Roles('ADMIN')
  @Put('users/:userId/roles')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '사용자 권한 수정',
    description: '사용자의 권한을 수정합니다.',
    param: { type: 'string', name: 'userId', description: '권한을 수정할 대상자의 식별자' },
    body: { type: UpdateUserRolesDto },
    responseType: ResponseUpdateUserRolesDto,
  })
  async updateUserRoles(@Param('userId', ObjectIdPipe) userId: string, @Body() rolesDto: UpdateUserRolesDto) {
    return this.apiGatewayService
      .updateUserRoles(AUTH_EVENT_TYPE.UPDATE_ROLES, userId, rolesDto)
      .pipe(map((user: ResponseUpdateUserRolesDto) => response(user, '사용자 권한 수정 성공', HttpStatus.OK)));
  }

  // Event 서비스 라우팅
  @Post('events')
  @Roles('OPERATOR')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 생성',
    description: '이벤트를 생성합니다.',
    body: {
      type: CreateEventDto,
      examples: EVENT_FIXTURE,
    },
    responseType: ResponseCreateEventDto,
  })
  async createEvent(@Body() eventDto: CreateEventDto, @UserAuth() userAuth: UserAuthDto) {
    return this.apiGatewayService
      .createEvent(EVENT_EVENT_TYPE.CREATE_EVENT, eventDto, userAuth._id)
      .pipe(map((event: ResponseCreateEventDto) => response(event, '이벤트 생성 성공', HttpStatus.CREATED)));
  }

  @Get('events')
  @Roles('OPERATOR')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 목록 조회',
    description: '이벤트 목록을 조회합니다.',
    responseType: ResponseGetAllEventsDto,
  })
  async getAllEvents() {
    return this.apiGatewayService
      .getAllEvents(EVENT_EVENT_TYPE.GET_ALL_EVENTS)
      .pipe(map((events: ResponseGetAllEventsDto) => response(events, '이벤트 목록 조회 성공', HttpStatus.OK)));
  }

  @Get('events/:id')
  @Roles('OPERATOR')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 상세 조회',
    description: '이벤트를 상세 조회합니다.',
    param: { type: 'string', name: 'id', description: '이벤트 ID' },
    responseType: ResponseGetEventByIdDto,
  })
  async getEventById(@Param('id', ObjectIdPipe) id: string) {
    return this.apiGatewayService
      .getEventById(EVENT_EVENT_TYPE.GET_EVENT_BY_ID, id)
      .pipe(map((event: ResponseGetEventByIdDto) => response(event, '이벤트 상세 조회 성공', HttpStatus.OK)));
  }

  // 보상 관련 API
  @Roles('OPERATOR')
  @Post('events/:eventId/rewards')
  @GenerateSwaggerApiDoc({
    tags: ['Event', 'Reward'],
    summary: '보상 등록',
    description: '특정 이벤트에 보상을 등록합니다.',
    param: { type: 'string', name: 'eventId', description: '이벤트 ID' },
    body: { type: CreateRewardDto, examples: REWARD_FIXTURE },
    responseType: ResponseCreateRewardDto,
  })
  async createReward(@Param('eventId', ObjectIdPipe) eventId: string, @Body() createRewardDto: CreateRewardDto) {
    return this.apiGatewayService
      .createReward(REWARD_EVENT_TYPE.CREATE_REWARD, eventId, createRewardDto)
      .pipe(map((reward: ResponseCreateRewardDto) => response(reward, '보상 등록 성공', HttpStatus.CREATED)));
  }

  @Roles('AUDITOR')
  @Get('events/:eventId/rewards')
  @GenerateSwaggerApiDoc({
    tags: ['Event', 'Reward'],
    summary: '보상 목록 조회',
    description: '특정 이벤트의 보상 목록을 조회합니다.',
    param: { type: 'string', name: 'eventId', description: '이벤트 ID' },
    responseType: ResponseGetRewardsByEventIdDto,
  })
  async getRewardsByEventId(@Param('eventId', ObjectIdPipe) eventId: string) {
    return this.apiGatewayService
      .getRewardsByEventId(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, eventId)
      .pipe(map((rewards: ResponseGetRewardsByEventIdDto) => response(rewards, '보상 목록 조회 성공', HttpStatus.OK)));
  }

  // 보상 요청 관련 API
  @Roles('USER')
  @Post('reward-requests')
  @GenerateSwaggerApiDoc({
    tags: ['Event', 'Reward'],
    summary: '보상 요청 생성',
    description: '이벤트 보상을 요청합니다.',
    body: { type: CreateRewardRequestDto },
    responseType: ResponseCreateRewardRequestDto,
  })
  async createRewardRequest(@Body() requestDto: CreateRewardRequestDto, @UserAuth() userAuth: UserAuthDto) {
    return this.apiGatewayService
      .createRewardRequest(REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST, userAuth._id, requestDto)
      .pipe(map((reward: ResponseCreateRewardRequestDto) => response(reward, '보상 요청 성공', HttpStatus.CREATED)));
  }

  @Roles('USER')
  @Get('reward-requests/me')
  @GenerateSwaggerApiDoc({
    tags: ['Event', 'Reward'],
    summary: '내 보상 요청 내역 조회',
    description: '내 보상 요청 내역을 조회합니다.',
    responseType: ResponseGetMyRewardRequestsDto,
  })
  async getMyRewardRequests(@UserAuth() userAuth: UserAuthDto) {
    return this.apiGatewayService
      .getMyRewardRequests(REWARD_EVENT_TYPE.GET_REWARD_REQUESTS_BY_USER_ID, userAuth._id)
      .pipe(map((rewards: ResponseGetMyRewardRequestsDto) => response(rewards, '보상 요청 내역 조회 성공', HttpStatus.OK)));
  }

  @Roles('OPERATOR', 'AUDITOR')
  @Get('reward-requests')
  @GenerateSwaggerApiDoc({
    tags: ['Event', 'Reward'],
    summary: '전체 보상 요청 내역 조회',
    description: '전체 보상 요청 내역을 조회합니다.',
    responseType: ResponseGetAllRewardRequestsDto,
  })
  async getAllRewardRequests(@Query() query: any) {
    return this.apiGatewayService
      .getAllRewardRequests(REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS, query)
      .pipe(map((rewards: ResponseGetAllRewardRequestsDto) => response(rewards, '전체 보상 요청 내역 조회 성공', HttpStatus.OK)));
  }
}
