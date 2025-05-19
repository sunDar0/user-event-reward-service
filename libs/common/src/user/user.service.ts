import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../dtos';
import { User, UserDocument } from './user.schema';

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

  async createUser(RegisterUserDto: RegisterUserDto): Promise<UserDocument> {
    try {
      // 이메일 중복 체크
      const existingUser = await this.getUserByEmail(RegisterUserDto.email);
      if (existingUser) {
        this.logger.warn(`User with email ${RegisterUserDto.email} already exists`);
        throw new RpcException({
          message: '이미 등록된 이메일입니다.',
          status: HttpStatus.CONFLICT,
        });
      }
      const createdUser = new this.userModel(RegisterUserDto);

      const savedUser = await createdUser.save();
      return savedUser;
    } catch (error) {
      this.logger.error('Error in create:', error);
      throw error;
    }
  }

  async updateUser(updateUser: UserDocument) {
    try {
      await updateUser.save();
    } catch (error) {
      this.logger.error('Error in updateUser:', error);
      throw new RpcException({
        message: '유저 정보 업데이트 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
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

  async getUserById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      this.logger.error('Error in getUserById:', error);
      throw new RpcException({
        message: '사용자 조회 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getUserByRefreshToken(_id: string, name: string, refreshToken: string) {
    try {
      return await this.userModel.findOne({ _id, name, refreshToken }).exec();
    } catch (error) {
      this.logger.error('Error in getUserByRefreshToken:', error);
      throw new RpcException({
        message: '사용자 조회 중 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
