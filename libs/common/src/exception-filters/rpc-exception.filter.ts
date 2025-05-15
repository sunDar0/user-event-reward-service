import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class AllExceptionsFilter implements ExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost) {
    const error = exception.getError() as any;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('RPC Exception:', error);

    // 상태 코드 확인 (기본값 500)
    const status = error.status || error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    // 일반 HTTP 응답
    response.status(status).json({
      statusCode: status,
      message: error.message || '서버 오류가 발생했습니다.',
      error: error.error || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}
