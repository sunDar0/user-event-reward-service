import { AUTH_EVENT_TYPE, GenerateSwaggerApiDoc, Roles } from '@app/common';
import { UserRegisterDto } from '@app/common/dtos';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGatewayService } from './api-gateway.service';

@Controller({ path: 'api', version: '1' })
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Auth 서비스 라우팅
  @Post('auth/register')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '유저 등록',
    description: '회원가입을 위한 API입니다.',
    isPublic: true,
    body: { type: UserRegisterDto },
  })
  async register(@Body() userRegisterDto: UserRegisterDto) {
    return this.apiGatewayService.registUser(AUTH_EVENT_TYPE.REGISTER, userRegisterDto);
  }

  @Post('auth/login')
  @GenerateSwaggerApiDoc({
    tags: ['Auth'],
    summary: '로그인',
    description: '로그인을 위한 API입니다.',
    isPublic: true,
  })
  async login(@Body() loginDto: any) {
    return this.apiGatewayService.login(AUTH_EVENT_TYPE.LOGIN, loginDto);
  }

  @Post('auth/refresh')
  @ApiTags('Auth')
  async refresh(@Body() refreshDto: any) {
    // return this.apiGatewayService.forwardToAuthService('refresh', refreshDto);
  }

  @Get('users/me')
  @ApiTags('Auth')
  async getUserProfile(@Req() request: any) {
    const userId = request.user?.id; // JWT 인증 후 user 정보가 request에 추가됨
    // return this.apiGatewayService.forwardToAuthService('getUserProfile', {});
  }

  @Roles('ADMIN')
  @Put('users/:userId/roles')
  @ApiTags('Auth')
  async updateUserRoles(@Param('userId') userId: string, @Body() rolesDto: any) {
    // return this.apiGatewayService.forwardToAuthService('updateUserRoles', {
    //   userId,
    //   ...rolesDto,
    // });
  }

  // Event 서비스 라우팅
  @Roles('OPERATOR', 'ADMIN')
  @Post('events')
  @ApiTags('Event')
  async createEvent(@Body() eventDto: any, @Req() request: any) {
    const userId = request.user?.id;
    // return this.apiGatewayService.forwardToEventService(EVENT_EVENT_TYPE.CREATE_EVENT, {
    //   ...eventDto,
    //   createdBy: userId,
    // });
  }

  @Get('events')
  @ApiTags('Event')
  async getAllEvents(@Query() query: any) {
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
