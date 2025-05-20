import { RpcException } from '@nestjs/microservices';

/**
 * 기본 예외 클래스
 * 모든 커스텀 예외의 기본이 되는 클래스
 */
export class BaseException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly error?: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 예외를 JSON 형태로 변환
   */
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      error: this.error,
      metadata: this.metadata,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * RpcException으로 변환
   * 마이크로서비스 간 통신에서 사용
   */
  toRpcException(): RpcException {
    return new RpcException({
      code: this.error || this.name,
      message: this.message,
      details: this.metadata,
      statusCode: this.statusCode,
    });
  }
}

/**
 * 비즈니스 로직 예외
 * 비즈니스 규칙 위반 시 발생하는 예외
 */
export class BusinessException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(400, message, error, metadata);
  }
}

/**
 * 인증 예외
 * 인증 실패 시 발생하는 예외
 */
export class AuthException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(401, message, error, metadata);
  }
}

/**
 * 권한 예외
 * 권한 부족 시 발생하는 예외
 */
export class ForbiddenException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(403, message, error, metadata);
  }
}

/**
 * 리소스 없음 예외
 * 요청한 리소스를 찾을 수 없을 때 발생하는 예외
 */
export class NotFoundException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(404, message, error, metadata);
  }
}

/**
 * 유효성 검증 예외
 * 입력값 검증 실패 시 발생하는 예외
 */
export class ValidationException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(422, message, error, metadata);
  }
}

/**
 * 서버 내부 예외
 * 예상치 못한 서버 오류 발생 시 사용하는 예외
 */
export class InternalServerException extends BaseException {
  constructor(message: string, error?: string, metadata?: Record<string, any>) {
    super(500, message, error, metadata);
  }
}
