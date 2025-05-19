import { EVENT_CONDITION_TYPE } from '../events/event.constants';

export interface EventConditionDetails {
  [EVENT_CONDITION_TYPE.LOGIN_STREAK]: {
    targetCount: number;
  };
  [EVENT_CONDITION_TYPE.QUEST_CLEAR]: {
    questId: string;
  };
  [EVENT_CONDITION_TYPE.MONSTER_KILL]: {
    monsterId: string;
    targetCount: number;
  };
  [EVENT_CONDITION_TYPE.RECOMMEND_COUNT]: {
    targetCount: number;
  };
  [EVENT_CONDITION_TYPE.PURCHASE_COUNT]: {
    targetCount: number;
  };
}

export interface EventCondition<T extends EVENT_CONDITION_TYPE = EVENT_CONDITION_TYPE> {
  type: T;
  details: EventConditionDetails[T];
}

export interface CompareData {
  loginDates?: string[];
  clearedQuests?: string[];
  killedMonsters?: { monsterId: string; count: number }[];
  recommendCount?: number;
  purchaseCount?: number;
}
