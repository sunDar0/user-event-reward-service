import {
  AUTH_EVENT_TYPE,
  EVENT_EVENT_TYPE,
  GenerateSwaggerApiDoc,
  JwtAuthGuard,
  REWARD_EVENT_TYPE,
  Roles,
  RolesGuard,
  UserAuth,
  UserAuthDto,
} from '@app/common';
import { ObjectIdPipe } from '@app/common/common.pipe';
import { CreateEventDto, EventResponseDto, RegisterUserDto, UpdateUserRolesDto, UserInfoDto, UserLoginDto } from '@app/common/dtos';
import { CreateRewardDto, RewardResponseDto } from '@app/common/dtos/reward.dto';
import { AllExceptionsFilter, UnauthorizedExceptionFilter } from '@app/common/exception-filters';
import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
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
    responseType: UserInfoDto,
  })
  register(@Body() RegisterUserDto: RegisterUserDto) {
    return this.apiGatewayService
      .registerUser(AUTH_EVENT_TYPE.REGISTER, RegisterUserDto)
      .pipe(map((user: UserInfoDto) => response({ user }, '유저등록이 완료되었습니다.', HttpStatus.CREATED)));
  }

  @Post('auth/login')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '로그인',
    description: '로그인을 시도합니다.',
    isPublic: true,
    body: { type: UserLoginDto },
  })
  async login(@Body() loginDto: UserLoginDto) {
    return this.apiGatewayService
      .login(AUTH_EVENT_TYPE.LOGIN, loginDto)
      .pipe(map(({ accessToken, refreshToken }) => response({ accessToken, refreshToken }, '로그인 성공', HttpStatus.OK)));
  }

  @Get('auth/refresh')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '토큰 갱신',
    description: '리프레시 토큰을 활용해 엑세스 토큰을 갱신합니다.',
    isPublic: true,
    query: { type: 'string', name: 'refreshToken', description: '리프레시 토큰' },
  })
  refreshToken(@Query('refreshToken') refreshToken: string) {
    console.log('refreshToken', refreshToken);
    return this.apiGatewayService
      .refreshAccessToken(AUTH_EVENT_TYPE.REFRESH_TOKEN, refreshToken)
      .pipe(map(({ newAccessToken, newRefreshToken }) => response({ newAccessToken, newRefreshToken }, '토큰 갱신 성공', HttpStatus.OK)));
  }

  @Roles('ADMIN')
  @Put('users/:userId/roles')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '사용자 권한 수정',
    description: '사용자의 권한을 수정합니다.',
    param: { type: 'string', name: 'userId', description: '권한을 수정할 대상자의 식별자' },
    body: { type: UpdateUserRolesDto },
  })
  async updateUserRoles(@Param('userId', ObjectIdPipe) userId: string, @Body() rolesDto: UpdateUserRolesDto) {
    return this.apiGatewayService
      .updateUserRoles(AUTH_EVENT_TYPE.UPDATE_ROLES, userId, rolesDto)
      .pipe(map((user: UserInfoDto) => response({ user }, '사용자 권한 수정 성공', HttpStatus.OK)));
  }

  // Event 서비스 라우팅
  @Roles('OPERATOR', 'ADMIN')
  @Post('events')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 생성',
    description: '이벤트를 생성합니다.',
    body: { type: CreateEventDto },
  })
  async createEvent(@Body() eventDto: CreateEventDto, @UserAuth() userAuth: UserAuthDto) {
    return this.apiGatewayService
      .createEvent(EVENT_EVENT_TYPE.CREATE_EVENT, eventDto, userAuth._id)
      .pipe(map((event: EventResponseDto) => response({ event }, '이벤트 생성 성공', HttpStatus.CREATED)));
  }

  @Get('events')
  @Roles('OPERATOR', 'ADMIN')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 목록 조회',
    description: '이벤트 목록을 조회합니다.',
    responseType: EventResponseDto,
  })
  async getAllEvents() {
    return this.apiGatewayService
      .getAllEvents(EVENT_EVENT_TYPE.GET_ALL_EVENTS)
      .pipe(map((events: EventResponseDto[]) => response({ events }, '이벤트 목록 조회 성공', HttpStatus.OK)));
  }

  @Get('events/:id')
  @Roles('OPERATOR', 'ADMIN')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 상세 조회',
    description: '이벤트를 상세 조회합니다.',
    param: { type: 'string', name: 'id', description: '이벤트 ID' },
    responseType: EventResponseDto,
  })
  async getEventById(@Param('id', ObjectIdPipe) id: string) {
    return this.apiGatewayService
      .getEventById(EVENT_EVENT_TYPE.GET_EVENT_BY_ID, id)
      .pipe(map((event: EventResponseDto) => response({ event }, '이벤트 상세 조회 성공', HttpStatus.OK)));
  }

  // 보상 관련 API
  @Roles('OPERATOR', 'ADMIN')
  @Post('events/:eventId/rewards')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '보상 등록',
    description: '특정 이벤트에 보상을 등록합니다.',
    param: { type: 'string', name: 'eventId', description: '이벤트 ID' },
    body: { type: CreateRewardDto },
    responseType: RewardResponseDto,
  })
  async createReward(@Param('eventId', ObjectIdPipe) eventId: string, @Body() createRewardDto: CreateRewardDto) {
    return this.apiGatewayService
      .createReward(REWARD_EVENT_TYPE.CREATE_REWARD, eventId, createRewardDto)
      .pipe(map((reward: RewardResponseDto) => response({ reward }, '보상 등록 성공', HttpStatus.CREATED)));
  }

  @Get('events/:eventId/rewards')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '보상 목록 조회',
    description: '특정 이벤트의 보상 목록을 조회합니다.',
    param: { type: 'string', name: 'eventId', description: '이벤트 ID' },
    responseType: RewardResponseDto,
  })
  async getRewardsByEventId(@Param('eventId', ObjectIdPipe) eventId: string) {
    return this.apiGatewayService
      .getRewardsByEventId(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, eventId)
      .pipe(map((rewards: RewardResponseDto[]) => response({ rewards }, '보상 목록 조회 성공', HttpStatus.OK)));
  }

  // 보상 요청 관련 API
  @Roles('USER')
  @Post('reward-requests')
  @ApiTags('Event')
  async createRewardRequest(@Body() requestDto: any, @Req() request: any) {
    const userId = request.user?.id;
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.CREATE_REWARD_REQUEST, {
    //   ...requestDto,
    //   userId,
    // });
  }

  @Roles('USER')
  @Get('reward-requests/me')
  @ApiTags('Event')
  async getMyRewardRequests(@Req() request: any) {
    const userId = request.user?.id;
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.GET_REWARD_REQUESTS_BY_USER_ID, { userId });
  }

  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  @Get('reward-requests')
  @ApiTags('Event')
  async getAllRewardRequests(@Query() query: any) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.GET_ALL_REWARD_REQUESTS, query);
  }

  @Roles('OPERATOR', 'ADMIN')
  @Put('reward-requests/:requestId/approve')
  @ApiTags('Event')
  async approveRewardRequest(@Param('requestId') requestId: string) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.APPROVE_REWARD_REQUEST, { requestId });
  }

  @Roles('OPERATOR', 'ADMIN')
  @Put('reward-requests/:requestId/reject')
  @ApiTags('Event')
  async rejectRewardRequest(@Param('requestId') requestId: string, @Body() rejectDto: any) {
    // return this.apiGatewayService.forwardToService(REWARD_EVENT_TYPE.REJECT_REWARD_REQUEST, {
    //   requestId,
    //   ...rejectDto,
    // });
  }
}
