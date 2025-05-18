import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserPayload {
  @ApiProperty({
    name: '_id',
    type: 'string',
    description: 'MongoDB에서 생성된 유저 고유 ID',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    name: 'name',
    type: 'string',
    description: '이름',
  })
  @IsString()
  name: string;
}

export class UserAuthDto extends UserPayload {
  @ApiProperty({
    name: 'email',
    type: 'string',
    description: '이메일',
  })
  @IsString()
  email: string;

  @ApiProperty({
    name: 'roles',
    type: 'string',
    description: '유저 권한',
  })
  @IsString()
  roles: string[];
}
