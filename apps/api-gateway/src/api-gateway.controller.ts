import { Roles } from "@app/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiGatewayService } from "./api-gateway.service";

@Controller("v1")
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // 기본 상태 확인 엔드포인트
  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get("status/auth")
  @ApiTags("Auth")
  async getAuthStatus(): Promise<string> {
    return this.apiGatewayService.checkAuthServiceStatus();
  }

  @Get("status/event")
  @ApiTags("Event")
  async getEventStatus(): Promise<string> {
    return this.apiGatewayService.checkEventServiceStatus();
  }

  // Auth 서비스 라우팅
  @Post("auth/register")
  @ApiTags("Auth")
  async register(@Body() registerDto: any) {
    return this.apiGatewayService.forwardToAuthService("register", registerDto);
  }

  @Post("auth/login")
  @ApiTags("Auth")
  async login(@Body() loginDto: any) {
    return this.apiGatewayService.forwardToAuthService("login", loginDto);
  }

  @Post("auth/refresh")
  @ApiTags("Auth")
  async refresh(@Body() refreshDto: any) {
    return this.apiGatewayService.forwardToAuthService("refresh", refreshDto);
  }

  @Get("users/me")
  @ApiTags("Auth")
  async getUserProfile(@Req() request: any) {
    const userId = request.user?.id; // JWT 인증 후 user 정보가 request에 추가됨
    return this.apiGatewayService.forwardToAuthService("getUserProfile", {
      userId,
    });
  }

  @Roles("ADMIN")
  @Put("users/:userId/roles")
  @ApiTags("Auth")
  async updateUserRoles(
    @Param("userId") userId: string,
    @Body() rolesDto: any
  ) {
    return this.apiGatewayService.forwardToAuthService("updateUserRoles", {
      userId,
      ...rolesDto,
    });
  }

  // Event 서비스 라우팅
  @Roles("OPERATOR", "ADMIN")
  @Post("events")
  @ApiTags("Event")
  async createEvent(@Body() eventDto: any, @Req() request: any) {
    const userId = request.user?.id;
    return this.apiGatewayService.forwardToEventService("createEvent", {
      ...eventDto,
      createdBy: userId,
    });
  }

  @Get("events")
  @ApiTags("Event")
  async getAllEvents(@Query() query: any) {
    return this.apiGatewayService.forwardToEventService("getAllEvents", query);
  }

  @Get("events/:id")
  @ApiTags("Event")
  async getEventById(@Param("id") id: string) {
    return this.apiGatewayService.forwardToEventService("getEventById", { id });
  }

  @Roles("OPERATOR", "ADMIN")
  @Put("events/:id")
  @ApiTags("Event")
  async updateEvent(@Param("id") id: string, @Body() eventDto: any) {
    return this.apiGatewayService.forwardToEventService("updateEvent", {
      id,
      ...eventDto,
    });
  }

  @Roles("ADMIN")
  @Delete("events/:id")
  @ApiTags("Event")
  async deleteEvent(@Param("id") id: string) {
    return this.apiGatewayService.forwardToEventService("deleteEvent", { id });
  }

  // 보상 관련 API
  @Roles("OPERATOR", "ADMIN")
  @Post("events/:eventId/rewards")
  @ApiTags("Event")
  async createReward(
    @Param("eventId") eventId: string,
    @Body() rewardDto: any
  ) {
    return this.apiGatewayService.forwardToEventService("createReward", {
      eventId,
      ...rewardDto,
    });
  }

  @Get("events/:eventId/rewards")
  @ApiTags("Event")
  async getRewardsByEventId(@Param("eventId") eventId: string) {
    return this.apiGatewayService.forwardToEventService("getRewardsByEventId", {
      eventId,
    });
  }

  @Roles("OPERATOR", "ADMIN")
  @Put("events/:eventId/rewards/:rewardId")
  @ApiTags("Event")
  async updateReward(
    @Param("eventId") eventId: string,
    @Param("rewardId") rewardId: string,
    @Body() rewardDto: any
  ) {
    return this.apiGatewayService.forwardToEventService("updateReward", {
      eventId,
      rewardId,
      ...rewardDto,
    });
  }

  @Roles("ADMIN")
  @Delete("events/:eventId/rewards/:rewardId")
  @ApiTags("Event")
  async deleteReward(
    @Param("eventId") eventId: string,
    @Param("rewardId") rewardId: string
  ) {
    return this.apiGatewayService.forwardToEventService("deleteReward", {
      eventId,
      rewardId,
    });
  }

  // 보상 요청 관련 API
  @Roles("USER")
  @Post("reward-requests")
  @ApiTags("Event")
  async createRewardRequest(@Body() requestDto: any, @Req() request: any) {
    const userId = request.user?.id;
    return this.apiGatewayService.forwardToEventService("createRewardRequest", {
      ...requestDto,
      userId,
    });
  }

  @Roles("USER")
  @Get("reward-requests/me")
  @ApiTags("Event")
  async getMyRewardRequests(@Req() request: any) {
    const userId = request.user?.id;
    return this.apiGatewayService.forwardToEventService(
      "getRewardRequestsByUserId",
      { userId }
    );
  }

  @Roles("OPERATOR", "AUDITOR", "ADMIN")
  @Get("reward-requests")
  @ApiTags("Event")
  async getAllRewardRequests(@Query() query: any) {
    return this.apiGatewayService.forwardToEventService(
      "getAllRewardRequests",
      query
    );
  }

  @Roles("OPERATOR", "ADMIN")
  @Put("reward-requests/:requestId/approve")
  @ApiTags("Event")
  async approveRewardRequest(@Param("requestId") requestId: string) {
    return this.apiGatewayService.forwardToEventService(
      "approveRewardRequest",
      { requestId }
    );
  }

  @Roles("OPERATOR", "ADMIN")
  @Put("reward-requests/:requestId/reject")
  @ApiTags("Event")
  async rejectRewardRequest(
    @Param("requestId") requestId: string,
    @Body() rejectDto: any
  ) {
    return this.apiGatewayService.forwardToEventService("rejectRewardRequest", {
      requestId,
      ...rejectDto,
    });
  }
}
