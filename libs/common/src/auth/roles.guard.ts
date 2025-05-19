import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { USER_ROLES } from './auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 메타데이터에서 필요한 역할 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);

    // 역할 요구사항이 없으면 접근 허용
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    // 사용자 객체가 없으면(인증되지 않은 사용자) 접근 거부
    if (!user) throw new ForbiddenException('인증이 필요합니다');

    // 사용자 역할 중 하나라도 필요한 역할과 일치하면 접근 허용
    // 관리자 역할은 모든 권한을 가지므로 필요한 역할과 상관없이 접근 허용
    const hasRole = user.roles?.some((role) => requiredRoles.includes(role)) || user.roles?.includes(USER_ROLES.ADMIN);

    if (!hasRole) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return true;
  }
}
