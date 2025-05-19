import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateRewardRequestDto,
  CreateRewardRequestWithEventDto,
  RewardRequestResponseDto,
  UpdateRewardRequestStatusDto,
} from '../dtos/reward-request.dto';
import { RewardRequest, RewardRequestDocument } from './reward-request.schema';
import { REWARD_REQUEST_STATUS } from './reward.constants';
import { RewardService } from './reward.service';

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    private readonly rewardService: RewardService,
  ) {}

  // 보상 요청 생성 (이벤트 서버에서 호출)
  async createRewardRequestWithEvent(userId: string, dto: CreateRewardRequestWithEventDto): Promise<RewardRequestResponseDto[]> {
    // 1. 해당 이벤트에 대한 기존 요청이 있는지 확인
    const existingRequest = await this.rewardRequestModel
      .findOne({
        userId,
        eventId: dto.eventId,
        status: { $in: [REWARD_REQUEST_STATUS.PENDING, REWARD_REQUEST_STATUS.APPROVED, REWARD_REQUEST_STATUS.CLAIMED] },
      })
      .exec();

    if (existingRequest) throw new BadRequestException('이미 해당 이벤트에 대한 보상 요청이 존재합니다.');

    // 3. 각 보상에 대한 요청 생성 및 처리
    const rewardRequests = await Promise.all(
      dto.rewards.map(async (reward) => {
        // 보상 수량 검증
        const isRewardAvailable = await this.rewardService.validateRewardQuantity(reward.rewardId);

        if (!isRewardAvailable) {
          // 수량 부족 시 실패 요청 생성
          return this.rewardRequestModel.create({
            userId,
            eventId: dto.eventId,
            rewardId: reward.rewardId,
            status: REWARD_REQUEST_STATUS.FAILED_NO_REMAINING_REWARD,
            requestedAt: new Date(),
            completedInfo: dto.completedInfo,
          });
        }

        // 보상 수량 차감
        await this.rewardService.decreaseRewardQuantity(reward.rewardId);

        // 승인된 요청 생성
        return this.rewardRequestModel.create({
          userId,
          eventId: dto.eventId,
          rewardId: reward.rewardId,
          status: REWARD_REQUEST_STATUS.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedInfo: dto.completedInfo,
        });
      }),
    );

    return rewardRequests.map((request) => this.toResponseDto(request));
  }

  // 기존 createRewardRequest 메서드는 이벤트 서버에서만 사용하도록 유지
  async createRewardRequest(userId: string, dto: CreateRewardRequestDto): Promise<RewardRequestResponseDto> {
    throw new BadRequestException('이벤트 서버를 통해 보상 요청을 생성해주세요.');
  }

  // 사용자별 보상 요청 목록 조회
  async getRewardRequestsByUserId(userId: string): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return requests.map((request) => this.toResponseDto(request));
  }

  // 전체 또는 필터링된 보상 요청 목록 조회
  async getAllRewardRequests(filters: Record<string, any> = {}): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestModel.find(filters).sort({ createdAt: -1 }).exec();
    return requests.map((request) => this.toResponseDto(request));
  }

  // 보상 요청 승인
  async approveRewardRequest(requestId: string): Promise<RewardRequestResponseDto> {
    const request = await this.rewardRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('보상 요청을 찾을 수 없습니다.');
    }

    if (request.status !== REWARD_REQUEST_STATUS.PENDING) {
      throw new BadRequestException('대기 중인 요청만 승인할 수 있습니다.');
    }

    // 보상 수량 감소
    await this.rewardService.decreaseRewardQuantity(request.rewardId);

    // 상태 업데이트
    const updatedRequest = await this.rewardRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          status: REWARD_REQUEST_STATUS.APPROVED,
          processedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    return this.toResponseDto(updatedRequest);
  }

  // 보상 요청 거절
  async rejectRewardRequest(requestId: string, updateDto: UpdateRewardRequestStatusDto): Promise<RewardRequestResponseDto> {
    const request = await this.rewardRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('보상 요청을 찾을 수 없습니다.');
    }

    if (request.status !== REWARD_REQUEST_STATUS.PENDING) {
      throw new BadRequestException('대기 중인 요청만 거절할 수 있습니다.');
    }

    // 상태 업데이트 및 메모 추가
    const updatedRequest = await this.rewardRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          status: REWARD_REQUEST_STATUS.REJECTED,
          processedAt: new Date(),
          notes: updateDto.notes,
        },
        { new: true },
      )
      .exec();

    return this.toResponseDto(updatedRequest);
  }

  // 내부 유틸리티 메서드: RewardRequestDocument를 RewardRequestResponseDto로 변환
  private toResponseDto(request: RewardRequestDocument): RewardRequestResponseDto {
    return {
      rewardRequestId: request._id.toString(),
      userId: request.userId,
      eventId: request.eventId,
      rewardId: request.rewardId,
      status: request.status,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      claimedAt: request.claimedAt,
      notes: request.notes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
