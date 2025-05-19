import { CreateRewardDto, REWARD_TYPE } from '@app/common';

export const REWARD_FIXTURE = {
  CASH: {
    value: {
      type: REWARD_TYPE.CASH,
      name: '1000원 캐시',
      details: {
        amount: 1000,
      },
      quantity: 1,
    } satisfies CreateRewardDto,
  },
  ITEM: {
    value: {
      type: REWARD_TYPE.ITEM,
      name: '레어 검',
      details: {
        itemId: 'rare-sword-123',
      },
      quantity: 2,
    } satisfies CreateRewardDto,
  },
  GOLD: {
    value: {
      type: REWARD_TYPE.GOLD,
      name: '50000 골드',
      details: {
        amount: 50000,
      },
      quantity: 1,
    } satisfies CreateRewardDto,
  },
  COUPON: {
    value: {
      type: REWARD_TYPE.COUPON,
      name: 'VIP 할인 쿠폰',
      details: {
        couponCode: 'VIP-DISCOUNT-30',
        expirationDays: 30,
      },
      quantity: 1,
    } satisfies CreateRewardDto,
  },
};
