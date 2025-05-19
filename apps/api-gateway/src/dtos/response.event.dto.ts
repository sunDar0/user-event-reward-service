import { EventResponseDto } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseCreateEventDto {
  @ApiProperty({ description: '생성된 이벤트 정보', type: EventResponseDto })
  event: EventResponseDto;
}

export class ResponseGetAllEventsDto {
  @ApiProperty({ description: '이벤트 목록', type: [EventResponseDto] })
  events: EventResponseDto[];
}

export class ResponseGetEventByIdDto {
  @ApiProperty({ description: '이벤트 상세 정보', type: EventResponseDto })
  event: EventResponseDto;
}
