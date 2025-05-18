// libs/common/src/pipes/object-id.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다.');
    }
    return value;
  }
}
