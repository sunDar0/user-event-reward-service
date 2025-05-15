import { UserLoginDto } from '@app/common';
import { UserRegisterDto } from '@app/common/dtos/user-register.dto';
import { Inject, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';

export type ServiceType = 'AUTH' | 'EVENT';

@Injectable()
export class ApiGatewayService implements OnModuleInit {
  private readonly logger = new Logger(ApiGatewayService.name);
  private serviceConnections: Map<ServiceType, boolean> = new Map();

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
  ) {
    // 초기 연결 상태 설정
    this.serviceConnections.set('AUTH', false);
    this.serviceConnections.set('EVENT', false);
  }

  async onModuleInit() {
    try {
      // Auth 서비스 연결 확인
      await this.connectService('AUTH', this.authClient);
      // Event 서비스 연결 확인
      await this.connectService('EVENT', this.eventClient);
    } catch (error) {
      this.logger.error('서비스 초기 연결 실패:', error);
      throw error;
    }
  }

  private async connectService(serviceType: ServiceType, client: ClientProxy) {
    try {
      // connect()는 Promise를 반환하므로 직접 await 사용
      await client.connect();
      this.serviceConnections.set(serviceType, true);
      this.logger.log(`${serviceType} 서비스 연결 성공`);
    } catch (error) {
      this.serviceConnections.set(serviceType, false);
      this.logger.error(`${serviceType} 서비스 연결 실패:`, error);
      throw error;
    }
  }

  // Auth 서비스로 요청 전달
  registerUser(pattern: string, data: UserRegisterDto) {
    return this.forwardToService<any, UserRegisterDto>('AUTH', pattern, data);
  }

  login(pattern: string, data: UserLoginDto) {
    console.debug(data);
    return this.forwardToService<string, UserLoginDto>('AUTH', pattern, data);
  }

  /** private method */

  /**
   * 서비스로 요청 전달
   * @param serviceType 서비스 타입
   * @param pattern 이벤트 패턴
   * @param data 요청 데이터
   * @returns 서비스 응답
   */
  private forwardToService<R, T>(serviceType: ServiceType, pattern: string, data: T) {
    // 서비스 연결 상태 확인
    if (!this.serviceConnections.get(serviceType)) {
      throw {
        statusCode: 503,
        message: `${serviceType} 서비스가 현재 사용 불가능합니다.`,
        error: 'Service Unavailable',
      };
    }

    // 서비스 타입에 따른 클라이언트 선택
    const client = serviceType === 'AUTH' ? this.authClient : this.eventClient;

    // 서비스 요청 전달
    return client.send<R, T>({ cmd: pattern }, data).pipe(
      catchError((error) => {
        // 연결 오류 발생 시 연결 상태 업데이트
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
          this.serviceConnections.set(serviceType, false);
        }
        return this.handleServiceError(error, serviceType);
      }),
    );
  }

  /**
   * 서비스 에러 처리
   * @param error 에러 객체
   * @param serviceName 서비스 이름
   */
  private handleServiceError(error: any, serviceName: string): never {
    console.error(`${serviceName} Service Error:`, error);

    // 에러 상태 코드가 401이면 UnauthorizedException 재생성
    if (error.status === 401 || error.statusCode === 401) {
      const message = error.message || '인증에 실패했습니다.';
      throw new UnauthorizedException(message);
    }

    // 서비스별 커스텀 에러 응답 또는 기본 에러 응답
    const errorResponse = {
      statusCode: error.status || 500,
      message: error.message || `${serviceName} service error`,
      error: error.error || 'Internal Server Error',
    };

    throw errorResponse;
  }
}
