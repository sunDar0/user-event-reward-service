import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRewardDto, RewardResponseDto } from '../dtos/reward.dto';
import { Reward, RewardDocument } from './reward.schema';

@Injectable()
export class RewardService {
  constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardDocument>) {}

  async createReward(eventId: string, createRewardDto: CreateRewardDto) {
    const reward = new this.rewardModel({ ...createRewardDto, eventId, remainingQuantity: createRewardDto.quantity });
    return this.toResponseDto(await reward.save());
  }

  async getRewardsByEventId(eventId: string) {
    const rewards = await this.rewardModel.find({ eventId }).exec();
    return rewards.map(this.toResponseDto);
  }

  async validateRewardQuantity(rewardId: string): Promise<boolean> {
    // TODO: Implement reward quantity validation logic
    throw new Error('Method not implemented.');
  }

  async decreaseRewardQuantity(rewardId: string): Promise<void> {
    // TODO: Implement decrease reward quantity logic
    throw new Error('Method not implemented.');
  }

  private toResponseDto(reward: RewardDocument): RewardResponseDto {
    return {
      _id: reward._id.toString(),
      eventId: reward.eventId,
      type: reward.type,
      name: reward.name,
      details: reward.details,
      quantity: reward.quantity,
      remainingQuantity: reward.remainingQuantity,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }
}
