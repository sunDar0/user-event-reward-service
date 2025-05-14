import { UserRegisterDto } from '@app/common/dtos/user-register.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
  ) {}

  // Auth 서비스로 요청 전달
  registUser(pattern: string, data: UserRegisterDto) {
    return this.forwardToAuthService(pattern, data);
  }

  private forwardToAuthService(pattern: string, data: UserRegisterDto) {
    return this.authClient.send({ cmd: pattern }, data).pipe(
      catchError((error) => {
        this.handleServiceError(error, 'Auth');
      }),
    );
  }

  // Event 서비스로 요청 전달
  async forwardToEventService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.eventClient.send({ cmd: pattern }, data));
    } catch (error) {
      this.handleServiceError(error, 'Event');
    }
  }

  // 서비스 에러 처리
  private handleServiceError(error: any, serviceName: string): never {
    console.error(`${serviceName} Service Error:`, error);

    // 서비스별 커스텀 에러 응답 또는 기본 에러 응답
    const errorResponse = {
      statusCode: error.status || 500,
      message: error.message || `${serviceName} service error`,
      error: error.error || 'Internal Server Error',
    };

    throw errorResponse;
  }
}
