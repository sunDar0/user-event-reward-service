import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UserPayload } from "../interfaces/user.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("인증 토큰이 필요합니다");
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      // 요청 객체에 사용자 정보 추가
      request.user = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        roles: payload.roles,
      };
    } catch (error) {
      throw new UnauthorizedException("유효하지 않은 토큰입니다");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
