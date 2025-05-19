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
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward) {
      return false;
    }
    // 무제한(-1) 또는 아직 남아있는 수량이 있는 경우 true 반환
    return reward.quantity === -1 || reward.remainingQuantity > 0;
  }

  async decreaseRewardQuantity(rewardId: string): Promise<void> {
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward || reward.quantity === -1) {
      // 무제한(-1)인 경우 수량을 차감하지 않음
      return;
    }

    if (reward.remainingQuantity <= 0) {
      throw new Error('보상 수량이 다 소진되었습니다.');
    }

    await this.rewardModel.findByIdAndUpdate(rewardId, { $inc: { remainingQuantity: -1 } }, { new: true }).exec();
  }

  private toResponseDto(reward: RewardDocument): RewardResponseDto {
    return {
      rewardId: reward._id.toString(),
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
