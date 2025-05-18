import { AUTH_EVENT_TYPE, GenerateSwaggerApiDoc, JwtAuthGuard, Roles, RolesGuard, UserAuth, UserAuthDto } from '@app/common';
import { RegisterUserDto, UserInfoDto, UserLoginDto } from '@app/common/dtos';
import { AllExceptionsFilter, UnauthorizedExceptionFilter } from '@app/common/exception-filters';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { response } from './helper/response.helper';

@ApiBearerAuth('jwt')
@Controller({ path: 'api', version: '1' })
@UseFilters(AllExceptionsFilter, UnauthorizedExceptionFilter)
@UseGuards(RolesGuard, JwtAuthGuard)
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
    return this.apiGatewayService.refreshAccessToken(AUTH_EVENT_TYPE.REFRESH_TOKEN, refreshToken);
  }

  @Roles('ADMIN')
  @Put('users/:userId/roles')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '사용자 권한 수정',
    description: '사용자의 권한을 수정합니다.',
    param: { type: 'string', name: 'userId', description: '권한을 수정할 대상자의 식별자' },
  })
  async updateUserRoles(@Param('userId') userId: string, @Body() rolesDto: any) {
    // return this.apiGatewayService.forwardToAuthService('updateUserRoles', {
    //   userId,
    //   ...rolesDto,
    // });
  }

  // Event 서비스 라우팅
  @Roles('OPERATOR', 'ADMIN')
  @Post('events')
  @GenerateSwaggerApiDoc({
    tags: ['Event'],
    summary: '이벤트 생성',
    description: '이벤트를 생성합니다.',
    body: {},
  })
  async createEvent(@Body() eventDto: any, @Req() request: any) {
    const userId = request.user?.id;
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.CREATE_EVENT, {
    //   ...eventDto,
    //   createdBy: userId,
    // });
  }

  @Get('events')
  @ApiTags('Event')
  async getAllEvents(@Query() query: any, @UserAuth() userAuth: UserAuthDto) {
    console.log('userAuth', userAuth);
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.GET_ALL_EVENTS, query);
  }

  @Get('events/:id')
  @ApiTags('Event')
  async getEventById(@Param('id') id: string) {
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.GET_EVENT_BY_ID, { id });
  }

  @Roles('OPERATOR', 'ADMIN')
  @Put('events/:id')
  @ApiTags('Event')
  async updateEvent(@Param('id') id: string, @Body() eventDto: any) {
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.UPDATE_EVENT, {
    //   id,
    //   ...eventDto,
    // });
  }

  @Roles('ADMIN')
  @Delete('events/:id')
  @ApiTags('Event')
  async deleteEvent(@Param('id') id: string) {
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.DELETE_EVENT, { id });
  }

  // 보상 관련 API
  @Roles('OPERATOR', 'ADMIN')
  @Post('events/:eventId/rewards')
  @ApiTags('Event')
  async createReward(@Param('eventId') eventId: string, @Body() rewardDto: any) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.CREATE_REWARD, {
    //   eventId,
    //   ...rewardDto,
    // });
  }

  @Get('events/:eventId/rewards')
  @ApiTags('Event')
  async getRewardsByEventId(@Param('eventId') eventId: string) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.GET_REWARDS_BY_EVENT_ID, {
    //   eventId,
    // });
  }

  @Roles('OPERATOR', 'ADMIN')
  @Put('events/:eventId/rewards/:rewardId')
  @ApiTags('Event')
  async updateReward(@Param('eventId') eventId: string, @Param('rewardId') rewardId: string, @Body() rewardDto: any) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.UPDATE_REWARD, {
    //   eventId,
    //   rewardId,
    //   ...rewardDto,
    // });
  }

  @Roles('ADMIN')
  @Delete('events/:eventId/rewards/:rewardId')
  @ApiTags('Event')
  async deleteReward(@Param('eventId') eventId: string, @Param('rewardId') rewardId: string) {
    // return this.apiGatewayService.forwardToEventService(REWARD_EVENT_TYPE.DELETE_REWARD, {
    //   eventId,
    //   rewardId,
    // });
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
