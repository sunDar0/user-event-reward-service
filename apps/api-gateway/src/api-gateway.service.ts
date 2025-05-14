import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
    @Inject("EVENT_SERVICE") private readonly eventClient: ClientProxy
  ) {}

  getHello(): string {
    return "API Gateway is running";
  }

  async checkAuthServiceStatus(): Promise<string> {
    try {
      return await firstValueFrom(this.authClient.send({ cmd: "ping" }, {}));
    } catch (error) {
      return "Auth service unavailable";
    }
  }

  async checkEventServiceStatus(): Promise<string> {
    try {
      return await firstValueFrom(this.eventClient.send({ cmd: "ping" }, {}));
    } catch (error) {
      return "Event service unavailable";
    }
  }

  // Auth 서비스로 요청 전달
  async forwardToAuthService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.authClient.send({ cmd: pattern }, data));
    } catch (error) {
      this.handleServiceError(error, "Auth");
    }
  }

  // Event 서비스로 요청 전달
  async forwardToEventService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.eventClient.send({ cmd: pattern }, data)
      );
    } catch (error) {
      this.handleServiceError(error, "Event");
    }
  }

  // 서비스 에러 처리
  private handleServiceError(error: any, serviceName: string): never {
    console.error(`${serviceName} Service Error:`, error);

    // 서비스별 커스텀 에러 응답 또는 기본 에러 응답
    const errorResponse = {
      statusCode: error.status || 500,
      message: error.message || `${serviceName} service error`,
      error: error.error || "Internal Server Error",
    };

    throw errorResponse;
  }
}
