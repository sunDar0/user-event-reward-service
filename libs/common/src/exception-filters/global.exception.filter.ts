import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { BaseResponseDto } from '../dtos';
import { BaseException } from '../exceptions/base.exception';

/**
 * 전역 예외 필터
 * 모든 예외를 처리하고 일관된 형식의 응답을 반환
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 요청 정보 로깅
    this.logger.error({
      exception,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 오류가 발생했습니다.';
    let error = 'Internal Server Error';
    let metadata: Record<string, any> | undefined;

    // 예외 타입에 따른 처리
    if (exception instanceof BaseException) {
      // 커스텀 예외 처리
      status = exception.statusCode;
      message = exception.message;
      error = exception.error || error;
      metadata = exception.metadata;
    } else if (exception instanceof HttpException) {
      // NestJS HTTP 예외 처리
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      error = response.error || 'HTTP Exception';
    } else if (exception instanceof RpcException) {
      // 마이크로서비스 RPC 예외 처리
      const rpcError = exception.getError() as any;
      status = rpcError.statusCode || status;
      message = rpcError.message || message;
      error = rpcError.error || error;
      metadata = rpcError.metadata;
    } else if (exception instanceof Error) {
      // 일반 Error 객체 처리
      message = exception.message;
      error = exception.name;
    }

    // 응답 생성
    const errorResponse = {
      code: -1,
      result: false,
      status: status,
      message,
      data: {
        error,
        metadata,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.headers['x-request-id'], // 요청 추적을 위한 ID
      },
    } satisfies BaseResponseDto<any>;

    // 응답 전송
    response.status(status).json(errorResponse);
  }
}
