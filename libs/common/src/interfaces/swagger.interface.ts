import { Type } from '@nestjs/common';
import { ApiBodyOptions, ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger';

export interface SwaggerDocInterface {
  summary: string;
  description: string;
  responseType?: Type;
  tags?: string[];
  query?: ApiQueryOptions | ApiQueryOptions[];
  param?: ApiParamOptions | ApiParamOptions[];
  body?: ApiBodyOptions;
}
