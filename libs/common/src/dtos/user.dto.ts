import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { USER_ROLES } from '../auth';
import { UserAuthDto } from '../interfaces';

export class RegisterUserDto {
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

export class UserLoginDto {
  @ApiProperty({
    description: '이메일',
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserRolesDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '역할 목록',
    example: [USER_ROLES.USER, USER_ROLES.OPERATOR],
  })
  @IsArray()
  roles: USER_ROLES[];
}

export class UserInfoDto extends PickType(UserAuthDto, ['email', 'name', 'roles']) {
  @ApiProperty({
    description: '사용자 ID',
    example: '1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
