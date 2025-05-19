import { UserAuthDto } from '@app/common/interfaces';
import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, Type } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SwaggerDocInterface } from 'apps/api-gateway/src/swagger/swagger.interface';
import { plainToInstance } from 'class-transformer';
import { isUndefined } from 'lodash';
import { BaseResponseDto } from './dtos';

export const ResponseDtoType = <T extends Type<unknown>>(t: T) =>
  applyDecorators(
    ApiExtraModels(BaseResponseDto, t),
    ApiOkResponse({
      schema: {
        title: `Response${t.name}Type`,
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(t) },
            },
          },
        ],
      },
    }),
  );

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const GenerateSwaggerApiDoc = (swaggerDocInterface: SwaggerDocInterface) => {
  const methodDecorators: MethodDecorator[] = [];
  const { summary, description, responseType, tags = [], query = [], param = [], body, isPublic = false } = swaggerDocInterface;

  if (isPublic) methodDecorators.push(Public());

  const queryOptions = Array.isArray(query) ? query : [query];
  queryOptions.forEach((q) => methodDecorators.push(ApiQuery(q)));

  const paramOptions = Array.isArray(param) ? param : [param];
  paramOptions.forEach((q) => methodDecorators.push(ApiParam(q)));

  if (!isUndefined(body)) methodDecorators.push(ApiBody(body));
  if (Array.isArray(tags)) methodDecorators.push(ApiTags(...tags));

  if (!isUndefined(responseType)) methodDecorators.push(ResponseDtoType(responseType));

  return applyDecorators(ApiOperation({ summary, description }), ...methodDecorators);
};

export const UserAuth = createParamDecorator((_: unknown, ctx: ExecutionContext): UserAuthDto => {
  const request = ctx.switchToHttp().getRequest();
  //인증된 유저 타입과 요청하는 api의 유저타입이 불일치 할경우 badRequestException 발생
  return plainToInstance(UserAuthDto, request.user);
});
