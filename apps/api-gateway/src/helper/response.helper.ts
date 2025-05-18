import { BaseResponseDto } from '@app/common';
import { plainToInstance } from 'class-transformer';

export function response<T = any>(data: T, message = '', statusCode = 200): BaseResponseDto<T> {
  const response = plainToInstance(BaseResponseDto, {
    code: 0,
    status: statusCode,
    message: message,
    data: data,
  }) as BaseResponseDto<T>;
  return response;
}
