import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { RewardRequestService } from './reward-request.service';
import { Reward, RewardSchema } from './reward.schema';
import { RewardService } from './reward.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    MongooseModule.forFeature([{ name: RewardRequest.name, schema: RewardRequestSchema }]),
  ],
  providers: [RewardService, RewardRequestService],
  exports: [RewardService, RewardRequestService],
})
export class RewardModule {}
