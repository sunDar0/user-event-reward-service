import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { USER_ROLES } from '../auth/auth.constants';

export class UserRegisterDto {
  @ApiProperty({
    name: 'email',
    type: 'string',
    description: '이메일',
    example: 'abc@def.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    type: 'string',
    description: '비밀번호',
    example: '12345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    name: 'name',
    type: 'string',
    description: '이름',
    example: '홍길동',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'roles',
    type: 'array',
    description: '역할',
    example: [USER_ROLES.USER, USER_ROLES.OPERATOR],
  })
  @IsArray()
  roles: USER_ROLES[];
}
