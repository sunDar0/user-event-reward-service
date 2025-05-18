import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { Reward, RewardSchema } from './reward.schema';
import { RewardService } from './reward.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    MongooseModule.forFeature([{ name: RewardRequest.name, schema: RewardRequestSchema }]),
  ],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
