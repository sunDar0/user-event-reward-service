import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRegisterDto } from '../dtos';
import { User } from './user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw new RpcException({
        message: '사용자 목록 조회 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createUser(userRegisterDto: UserRegisterDto): Promise<User> {
    try {
      // 이메일 중복 체크
      const existingUser = await this.findUserByEmail(userRegisterDto.email);
      if (existingUser) {
        this.logger.warn(`User with email ${userRegisterDto.email} already exists`);
        throw new RpcException({
          message: '이미 등록된 이메일입니다.',
          status: HttpStatus.CONFLICT,
        });
      }
      const createdUser = new this.userModel(userRegisterDto);

      const savedUser = await createdUser.save();

      // 필요한 사용자 정보만 반환
      return savedUser.toObject();
    } catch (error) {
      this.logger.error('Error in create:', error);

      throw new RpcException({
        message: '사용자 생성 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error('Error in findUserByEmail:', error);
      throw new RpcException({
        message: '사용자 조회 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
