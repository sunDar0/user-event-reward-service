import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserPayload {
  @ApiProperty({
    name: 'id',
    type: 'string',
    description: '유저 ID',
  })
  @IsString()
  id: string;

  @ApiProperty({
    name: 'email',
    type: 'string',
    description: '유저 이메일',
  })
  @IsString()
  email: string;

  @ApiProperty({
    name: 'name',
    type: 'string',
    description: '유저 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    name: 'roles',
    type: 'string',
    description: '유저 권한',
  })
  @IsString()
  roles: string[];
}

export class UserAuthDto extends UserPayload {}
