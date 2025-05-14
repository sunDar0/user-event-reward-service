import { Injectable } from '@nestjs/common';

@Injectable()
export class EventServerService {
  getHello(): string {
    return 'Hello World!';
  }
}
