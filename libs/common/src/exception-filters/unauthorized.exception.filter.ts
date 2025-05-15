import { ArgumentsHost, Catch, ExceptionFilter, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter<UnauthorizedException> {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    console.log('UnauthorizedExceptionFilter', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message || '인증에 실패했습니다.';

    response.status(status).json({
      statusCode: status,
      message: message,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }
}
