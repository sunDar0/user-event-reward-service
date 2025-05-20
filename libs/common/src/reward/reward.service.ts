import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CreateRewardDto, RewardResponseDto } from '../dtos/reward.dto';
import { Reward, RewardDocument } from './reward.schema';

@Injectable()
export class RewardService {
  constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardDocument>) {}

  /**
   * eventId 기준 보상 생성
   * @param {string} eventId 이벤트 ID
   * @param {CreateRewardDto} createRewardDto 보상 생성 DTO
   * @returns {RewardResponseDto} 보상 응답 DTO
   */
  async createReward(eventId: string, createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
    const reward = new this.rewardModel({
      ...createRewardDto,
      eventId,
      remainingQuantity: createRewardDto.quantity < 0 ? 0 : createRewardDto.quantity, //
    });
    const savedReward = await reward.save();
    return this.toResponseDto(savedReward);
  }

  /**
   * eventId 기준 보상 조회
   * @param {string} eventId 이벤트 ID
   * @returns {RewardResponseDto[]} 보상 응답 DTO 배열
   */
  async getRewardsByEventId(eventId: string): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardModel.find({ eventId }).exec();
    return rewards.map(this.toResponseDto);
  }

  /**
   * rewardId 기준 보상 수량 검증
   * @param {string} rewardId 보상 ID
   * @returns {boolean} 검증 결과
   */
  async validateRewardQuantity(rewardId: string): Promise<boolean> {
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward) return false;

    // 무제한(-1) 또는 아직 남아있는 수량이 있는 경우 true 반환
    return reward.quantity === -1 || reward.remainingQuantity > 0;
  }

  /**
   * rewardId 기준 보상 수량 감소
   * @param {string} rewardId 보상 ID
   * @param {ClientSession} session 트랜잭션 세션
   * @returns {void}
   */
  async decreaseRewardQuantity(rewardId: string, session?: ClientSession): Promise<void> {
    const result = await this.rewardModel
      .findOneAndUpdate(
        {
          _id: rewardId,
        },
        { $inc: { remainingQuantity: -1 } },
        { new: true, session }, // 갱신된 도큐먼트 리턴
      )
      .exec();
    if (result.quantity === -1) return;
    if (result.remainingQuantity < 0) throw new Error('보상 수량이 다 소진되었습니다.');
  }

  /**
   * 보상 응답 DTO 변환
   * @param {RewardDocument} reward 보상 도큐먼트
   * @returns {RewardResponseDto} 보상 응답 DTO
   */
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
