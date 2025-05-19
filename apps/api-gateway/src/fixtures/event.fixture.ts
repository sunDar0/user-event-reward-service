import { CreateEventDto } from '@app/common';
import { EVENT_CONDITION_TYPE, EVENT_STATUS } from '@app/common/events/event.constants';

export const EVENT_FIXTURE = {
  LOGIN_STREAK: {
    value: {
      title: '로그인 연속 7일 이벤트',
      description: '로그인 연속 7일 이벤트',
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      status: EVENT_STATUS.ACTIVE,
      conditions: {
        type: EVENT_CONDITION_TYPE.LOGIN_STREAK,
        details: {
          targetCount: 7,
        },
      },
    } satisfies CreateEventDto,
  },
  QUEST_CLEAR: {
    value: {
      title: '퀘스트 클리어 이벤트',
      description: '퀘스트 클리어 이벤트',
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      status: EVENT_STATUS.ACTIVE,
      conditions: {
        type: EVENT_CONDITION_TYPE.QUEST_CLEAR,
        details: {
          questId: 'aabbccdd1234',
        },
      },
    } satisfies CreateEventDto,
  },
  RECOMMEND_COUNT: {
    value: {
      title: '추천 누적 10명 이벤트',
      description: '추천 누적 10명 이벤트',
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      status: EVENT_STATUS.ACTIVE,
      conditions: {
        type: EVENT_CONDITION_TYPE.RECOMMEND_COUNT,
        details: {
          targetCount: 10,
        },
      },
    } satisfies CreateEventDto,
  },
  PURCHASE_COUNT: {
    value: {
      title: '구매 10건 달성 이벤트',
      description: '구매 10건 달성 이벤트',
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      status: EVENT_STATUS.ACTIVE,
      conditions: {
        type: EVENT_CONDITION_TYPE.PURCHASE_COUNT,
        details: {
          targetCount: 10,
        },
      },
    } satisfies CreateEventDto,
  },
  MONSTER_KILL: {
    value: {
      title: '특정 몬스터 10 마리 처치 이벤트',
      description: '특정 몬스터 10 마리 처치 이벤트',
      startDate: '2025-01-01',
      endDate: '2025-10-01',
      status: EVENT_STATUS.ACTIVE,
      conditions: {
        type: EVENT_CONDITION_TYPE.MONSTER_KILL,
        details: {
          monsterId: 'aabbccdd1234',
          targetCount: 10,
        },
      },
    } satisfies CreateEventDto,
  },
};
