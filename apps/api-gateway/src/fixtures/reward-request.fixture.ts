import { CreateRewardRequestDto } from '@app/common';
import { CompareData } from '@app/common/interfaces';
import { Types } from 'mongoose';

export const REWARD_REQUEST_FIXTURE = {
  LOGIN_STREAK_REWARD_REQUEST: {
    value: {
      eventId: Types.ObjectId.createFromHexString('664664646464646464646464').toString(),
      completedInfo: {
        loginDates: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
      } satisfies CompareData,
    } satisfies CreateRewardRequestDto,
  },
  QUEST_REWARD_REQUEST: {
    value: {
      eventId: Types.ObjectId.createFromHexString('664664646464646464646464').toString(),
      completedInfo: {
        clearedQuests: ['1', '2', '3'],
      } satisfies CompareData,
    } satisfies CreateRewardRequestDto,
  },
  MONSTER_KILL_REWARD_REQUEST: {
    value: {
      eventId: Types.ObjectId.createFromHexString('664664646464646464646464').toString(),
      completedInfo: {
        killedMonsters: [{ monsterId: '1', count: 10 }],
      } satisfies CompareData,
    } satisfies CreateRewardRequestDto,
  },
  RECOMMEND_COUNT_REWARD_REQUEST: {
    value: {
      eventId: Types.ObjectId.createFromHexString('664664646464646464646464').toString(),
      completedInfo: {
        recommendCount: 10,
      } satisfies CompareData,
    } satisfies CreateRewardRequestDto,
  },
  PURCHASE_COUNT_REWARD_REQUEST: {
    value: {
      eventId: Types.ObjectId.createFromHexString('664664646464646464646464').toString(),
      completedInfo: {
        purchaseCount: 10,
      } satisfies CompareData,
    } satisfies CreateRewardRequestDto,
  },
};
