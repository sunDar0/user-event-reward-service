import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRewardRequestWithEventDto, GetRewardRequestsQueryDto, RewardRequestResponseDto } from '../dtos/reward-request.dto';
import { RewardRequest, RewardRequestDocument } from './reward-request.schema';
import { REWARD_REQUEST_STATUS } from './reward.constants';
import { RewardService } from './reward.service';

@Injectable()
export class RewardRequestService {
  private readonly logger = new Logger(RewardRequestService.name);

  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    private readonly rewardService: RewardService,
  ) {}

  /**
   * 이벤트에 대한 보상 요청 생성
   * @param {string} userId 사용자 ID
   * @param {CreateRewardRequestWithEventDto} dto 보상 요청 DTO
   * @returns {RewardRequestResponseDto[]} 보상 요청 응답 DTO 배열
   */
  async createRewardRequestWithEvent(userId: string, dto: CreateRewardRequestWithEventDto): Promise<RewardRequestResponseDto[]> {
    // 해당 이벤트에 대한 기존 요청이 있는지 확인
    const existingRequest = await this.rewardRequestModel
      .findOne({
        userId,
        eventId: dto.eventId,
        status: { $in: [REWARD_REQUEST_STATUS.PENDING, REWARD_REQUEST_STATUS.APPROVED, REWARD_REQUEST_STATUS.CLAIMED] },
      })
      .exec();

    if (existingRequest) throw new BadRequestException('이미 해당 이벤트에 대한 보상 요청이 존재합니다.');

    // 트랜잭션 시작
    const session = await this.rewardRequestModel.startSession();
    let result: RewardRequestResponseDto[] = [];

    try {
      await session.withTransaction(async () => {
        // 각 보상에 대한 요청 생성 및 처리
        const rewardRequests = await Promise.all(
          dto.rewards.map(async (reward) => {
            // 보상 수량 검증
            const isRewardAvailable = await this.rewardService.validateRewardQuantity(reward.rewardId);

            if (!isRewardAvailable) {
              // 수량 부족 시 실패 요청 생성 및 리턴
              return this.rewardRequestModel.create(
                [
                  {
                    userId,
                    eventId: dto.eventId,
                    rewardId: reward.rewardId,
                    status: REWARD_REQUEST_STATUS.FAILED_NO_REMAINING_REWARD,
                    requestedAt: new Date(),
                    completedInfo: dto.completedInfo,
                  },
                ],
                { session },
              );
            }

            // 보상 수량 차감
            await this.rewardService.decreaseRewardQuantity(reward.rewardId, session);

            // 승인된 요청 생성
            return this.rewardRequestModel.create(
              [
                {
                  userId,
                  eventId: dto.eventId,
                  rewardId: reward.rewardId,
                  status: REWARD_REQUEST_STATUS.APPROVED,
                  requestedAt: new Date(),
                  processedAt: new Date(),
                  completedInfo: dto.completedInfo,
                },
              ],
              { session },
            );
          }),
        );

        result = rewardRequests.map((request) => this.toResponseDto(request[0]));
      });

      return result;
    } catch (error) {
      // 트랜잭션 실패 시 로깅
      this.logger.error(`error reward request: ${error.message}`, error.stack);
      throw new InternalServerErrorException('보상 요청 생성 중 오류가 발생했습니다.');
    } finally {
      await session.endSession();
    }
  }

  /**
   * userId 기준 보상 요청 목록 조회
   * @param {string} userId 사용자 ID
   * @returns {RewardRequestResponseDto[]} 보상 요청 응답 DTO 배열
   */
  async getRewardRequestsByUserId(userId: string): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return requests.map((request) => this.toResponseDto(request));
  }

  /**
   * 전체 또는 필터링된 보상 요청 목록 조회
   * @param {GetRewardRequestsQueryDto} queryDto 쿼리 DTO
   * @returns {RewardRequestResponseDto[]} 보상 요청 응답 DTO 배열
   */
  async getAllRewardRequests(queryDto: GetRewardRequestsQueryDto): Promise<RewardRequestResponseDto[]> {
    const filter: Record<string, any> = {};

    // ID 필터링
    if (queryDto.userId) filter.userId = queryDto.userId;
    if (queryDto.eventId) filter.eventId = queryDto.eventId;
    if (queryDto.rewardId) filter.rewardId = queryDto.rewardId;
    if (queryDto.status) filter.status = queryDto.status;

    // 날짜 범위 필터링
    if (queryDto.requestedAtStart || queryDto.requestedAtEnd) {
      filter.requestedAt = {};
      if (queryDto.requestedAtStart) filter.requestedAt.$gte = queryDto.requestedAtStart;
      if (queryDto.requestedAtEnd) filter.requestedAt.$lte = queryDto.requestedAtEnd;
    }

    if (queryDto.processedAtStart || queryDto.processedAtEnd) {
      filter.processedAt = {};
      if (queryDto.processedAtStart) filter.processedAt.$gte = queryDto.processedAtStart;
      if (queryDto.processedAtEnd) filter.processedAt.$lte = queryDto.processedAtEnd;
    }

    if (queryDto.claimedAtStart || queryDto.claimedAtEnd) {
      filter.claimedAt = {};
      if (queryDto.claimedAtStart) filter.claimedAt.$gte = queryDto.claimedAtStart;
      if (queryDto.claimedAtEnd) filter.claimedAt.$lte = queryDto.claimedAtEnd;
    }

    // 메모 검색 (부분 일치)
    if (queryDto.notes) {
      filter.notes = { $regex: queryDto.notes, $options: 'i' };
    }

    const requests = await this.rewardRequestModel.find(filter).sort({ createdAt: -1 }).exec();
    return requests.map((request) => this.toResponseDto(request));
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
