import { CreateEventDto, EventResponseDto, RegisterUserDto, UpdateUserRolesDto, UserInfoDto, UserLoginDto } from '@app/common';
import { CreateRewardRequestDto, RewardRequestResponseDto } from '@app/common/dtos/reward-request.dto';
import { CreateRewardDto, RewardResponseDto } from '@app/common/dtos/reward.dto';
import { Inject, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, Observable } from 'rxjs';
import { ResponseLoginDto, ResponseRefreshTokenDto, ResponseUpdateUserRolesDto } from './dtos/response.auth.dto';
import { ResponseCreateEventDto, ResponseGetAllEventsDto, ResponseGetEventByIdDto } from './dtos/response.event.dto';
import { ResponseCreateRewardRequestDto, ResponseGetAllRewardRequestsDto, ResponseGetMyRewardRequestsDto } from './dtos/response.reward-request.dto';
import { ResponseCreateRewardDto, ResponseGetRewardsByEventIdDto } from './dtos/response.reward.dto';
import { ResponseRegisterUserDto } from './dtos/response.user.dto';

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

  /**
   * 유저 등록
   * @param {string} pattern 패턴
   * @param {RegisterUserDto} RegisterUserDto 유저 등록 정보
   * @returns {Observable<ResponseRegisterUserDto>}
   */
  registerUser(pattern: string, RegisterUserDto: RegisterUserDto): Observable<ResponseRegisterUserDto> {
    return this.forwardToService<UserInfoDto, RegisterUserDto>('AUTH', pattern, RegisterUserDto).pipe(
      map((user: UserInfoDto) => ({ user }) satisfies ResponseRegisterUserDto),
    );
  }

  /**
   * 로그인
   * @param {string} pattern 패턴
   * @param {UserLoginDto} userLoginDto 로그인 정보
   * @returns {Observable<ResponseLoginDto>}
   */
  login(pattern: string, userLoginDto: UserLoginDto): Observable<ResponseLoginDto> {
    return this.forwardToService<{ accessToken: string; refreshToken: string }, UserLoginDto>('AUTH', pattern, userLoginDto).pipe(
      map(({ accessToken, refreshToken }) => ({ accessToken, refreshToken }) satisfies ResponseLoginDto),
    );
  }

  /**
   * 토큰 갱신
   * @param {string} pattern 패턴
   * @param {string} refreshToken 리프레시 토큰
   * @returns {Observable<ResponseRefreshTokenDto>}
   */
  refreshAccessToken(pattern: string, refreshToken: string): Observable<ResponseRefreshTokenDto> {
    return this.forwardToService<{ newAccessToken: string; newRefreshToken: string }, string>('AUTH', pattern, refreshToken).pipe(
      map(({ newAccessToken, newRefreshToken }) => ({ newAccessToken, newRefreshToken }) satisfies ResponseRefreshTokenDto),
    );
  }

  /**
   * 사용자 권한 수정
   * @param {string} pattern 패턴
   * @param {string} userId 사용자 ID
   * @param {UpdateUserRolesDto} rolesDto 권한 수정 정보
   * @returns {Observable<ResponseUpdateUserRolesDto>}
   */
  updateUserRoles(pattern: string, userId: string, rolesDto: UpdateUserRolesDto): Observable<ResponseUpdateUserRolesDto> {
    return this.forwardToService<UserInfoDto, { userId: string; rolesDto: UpdateUserRolesDto }>('AUTH', pattern, { userId, rolesDto }).pipe(
      map((user: UserInfoDto) => ({ user }) satisfies ResponseUpdateUserRolesDto),
    );
  }

  /** Event 서비스 */

  /**
   * 이벤트 생성
   * @param {string} pattern 패턴
   * @param {CreateEventDto} eventDto 이벤트 생성 정보
   * @param {string} createdBy 생성자 ID
   * @returns {Observable<ResponseCreateEventDto>} 이벤트 응답
   */
  createEvent(pattern: string, eventDto: CreateEventDto, createdBy: string): Observable<ResponseCreateEventDto> {
    return this.forwardToService<EventResponseDto, { eventDto: CreateEventDto; createdBy: string }>('EVENT', pattern, { eventDto, createdBy }).pipe(
      map((event: EventResponseDto) => ({ event }) satisfies ResponseCreateEventDto),
    );
  }

  /**
   * 이벤트 목록 조회
   * @param {string} pattern 패턴
   * @returns {Observable<ResponseGetAllEventsDto>}
   */
  getAllEvents(pattern: string): Observable<ResponseGetAllEventsDto> {
    return this.forwardToService<EventResponseDto[], Record<string, never>>('EVENT', pattern, {}).pipe(
      map((events: EventResponseDto[]) => ({ events }) satisfies ResponseGetAllEventsDto),
    );
  }

  /**
   * 이벤트 상세 조회
   * @param {string} pattern 패턴
   * @param {string} id 이벤트 ID
   * @returns {Observable<ResponseGetEventByIdDto>}
   */
  getEventById(pattern: string, eventId: string): Observable<ResponseGetEventByIdDto> {
    return this.forwardToService<EventResponseDto, string>('EVENT', pattern, eventId).pipe(
      map((event: EventResponseDto) => ({ event }) satisfies ResponseGetEventByIdDto),
    );
  }

  /** Reward 서비스 */

  /**
   * 이벤트 보상 등록
   * @param pattern 패턴
   * @param eventId 이벤트 ID
   * @param createRewardDto 보상 생성 정보
   * @returns 보상 응답
   */
  createReward(pattern: string, eventId: string, createRewardDto: CreateRewardDto) {
    return this.forwardToService<RewardResponseDto, { eventId: string; createRewardDto: CreateRewardDto }>('EVENT', pattern, {
      eventId,
      createRewardDto,
    }).pipe(map((reward: RewardResponseDto) => ({ reward }) satisfies ResponseCreateRewardDto));
  }

  /**
   * 이벤트별 보상 목록 조회
   * @param pattern 패턴
   * @param eventId 이벤트 ID
   * @returns 보상 목록
   */
  getRewardsByEventId(pattern: string, eventId: string) {
    return this.forwardToService<RewardResponseDto[], string>('EVENT', pattern, eventId).pipe(
      map((rewards: RewardResponseDto[]) => ({ rewards }) satisfies ResponseGetRewardsByEventIdDto),
    );
  }

  /** RewardRequest 서비스 */

  /**
   * 보상 요청 생성
   * @param pattern 패턴
   * @param payload 요청 페이로드
   * @returns 보상 요청 응답
   */
  createRewardRequest(pattern: string, userId: string, requestDto: CreateRewardRequestDto) {
    return this.forwardToService<RewardRequestResponseDto, { userId: string; requestDto: CreateRewardRequestDto }>('EVENT', pattern, {
      userId,
      requestDto,
    }).pipe(map((rewardRequest: RewardRequestResponseDto) => ({ rewardRequest }) satisfies ResponseCreateRewardRequestDto));
  }

  /**
   * 사용자별 보상 요청 조회
   * @param pattern 패턴
   * @param userId 사용자 ID
   * @returns 보상 요청 목록
   */
  getMyRewardRequests(pattern: string, userId: string) {
    return this.forwardToService<RewardRequestResponseDto[], string>('EVENT', pattern, userId).pipe(
      map((rewardRequests: RewardRequestResponseDto[]) => ({ rewardRequests }) satisfies ResponseGetMyRewardRequestsDto),
    );
  }

  /**
   * 전체 보상 요청 목록 조회
   * @param pattern 패턴
   * @param filters 필터링 조건
   * @returns 보상 요청 목록
   */
  getAllRewardRequests(pattern: string, filters: Record<string, any> = {}) {
    return this.forwardToService<RewardRequestResponseDto[], Record<string, any>>('EVENT', pattern, filters).pipe(
      map((rewardRequests: RewardRequestResponseDto[]) => ({ rewardRequests }) satisfies ResponseGetAllRewardRequestsDto),
    );
  }

  /** private method */
  /**
   * 서비스로 요청 전달
   * @param serviceType 서비스 타입
   * @param pattern 이벤트 패턴
   * @param data 요청 데이터
   * @returns 서비스 응답
   */
  private forwardToService<R, T = void>(serviceType: ServiceType, pattern: string, data?: T) {
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
    return client.send<R, T | undefined>({ cmd: pattern }, data).pipe(
      catchError((error) => {
        this.logger.error(`Error in ${serviceType} service communication:`, { error, pattern, data });

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

  /**
   * 서비스 연결
   * @param serviceType 서비스 타입
   * @param client 클라이언트
   */
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
}
