import { BaseResponseDto } from '@app/common';
import { plainToInstance } from 'class-transformer';

/**
 * 응답 형식을 반환하는 함수
 * @param {T} data 응답 데이터
 * @param {string} message 응답 메시지
 * @param {number} statusCode 응답 상태 코드
 * @returns {BaseResponseDto<T>} 응답 형식
 */
export function response<T = any>(data: T, message = '', statusCode = 200): BaseResponseDto<T> {
  const response = plainToInstance(BaseResponseDto, {
    code: 0,
    status: statusCode,
    message: message,
    data: data,
  }) as BaseResponseDto<T>;
  return response;
}
