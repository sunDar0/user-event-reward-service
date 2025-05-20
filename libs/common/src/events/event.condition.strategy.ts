// event.condition.strategy.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { CompareData, EventCondition } from '../interfaces/event.interface';
import { EVENT_CONDITION_TYPE } from './event.constants';

export interface EventConditionStrategy {
  validate(compareData: CompareData, condition: EventCondition): Promise<boolean>;
}

@Injectable()
export class LoginStreakStrategy implements EventConditionStrategy {
  async validate(compareData: CompareData, condition: EventCondition<EVENT_CONDITION_TYPE.LOGIN_STREAK>): Promise<boolean> {
    const { targetCount } = condition.details;
    const { loginDates = [] } = compareData;
    // 로그인 날짜가 없으면 예외 발생
    if (loginDates.length == 0) throw new BadRequestException('loginDates is required');
    // 연속 로그인 체크 로직
    const sortedDates = loginDates.map((date) => dayjs(date)).sort((a, b) => a.valueOf() - b.valueOf()); // 날짜 정렬
    let currentStreak = 1;
    let maxStreak = 1;

    // 연속 로그인 체크
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      // 날짜 차이 계산
      const diffDays = currDate.diff(prevDate, 'day');

      if (diffDays === 1) {
        // 연속 로그인 체크
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        // 연속 로그인 체크 초기화
        currentStreak = 1;
      }
    }

    return maxStreak >= targetCount;
  }
}

@Injectable()
export class QuestClearStrategy implements EventConditionStrategy {
  /**
   * 퀘스트 클리어 조건 검증
   * @param compareData 비교 데이터
   * @param condition 이벤트 조건
   * @returns 퀘스트 클리어 조건 검증 결과
   */
  async validate(compareData: CompareData, condition: EventCondition<EVENT_CONDITION_TYPE.QUEST_CLEAR>): Promise<boolean> {
    const { questId } = condition.details;
    const { clearedQuests = [] } = compareData;
    // 클리어한 퀘스트가 없으면 예외 발생
    if (clearedQuests.length == 0) throw new BadRequestException('clearedQuests is required');
    return clearedQuests.includes(questId);
  }
}

@Injectable()
export class MonsterKillStrategy implements EventConditionStrategy {
  /**
   * 몬스터 처치 조건 검증
   * @param compareData 비교 데이터
   * @param condition 이벤트 조건
   * @returns 몬스터 처치 조건 검증 결과
   */
  async validate(compareData: CompareData, condition: EventCondition<EVENT_CONDITION_TYPE.MONSTER_KILL>): Promise<boolean> {
    const { monsterId, targetCount } = condition.details;
    const { killedMonsters = [] } = compareData;
    // 몬스터 처지 정보가 없으면 예외 발생
    if (killedMonsters.length == 0) throw new BadRequestException('killedMonsters is required');
    // 몬스터 처치 횟수 조회
    const monsterKillCount = killedMonsters.find((monster) => monster.monsterId === monsterId)?.count ?? 0;
    // 몬스터 처치 횟수가 조건에 맞으면 true, 아니면 false 반환
    return monsterKillCount >= targetCount;
  }
}

@Injectable()
export class RecommendCountStrategy implements EventConditionStrategy {
  /**
   * 추천 조건 검증
   * @param compareData 비교 데이터
   * @param condition 이벤트 조건
   * @returns 추천 조건 검증 결과
   */
  async validate(compareData: CompareData, condition: EventCondition<EVENT_CONDITION_TYPE.RECOMMEND_COUNT>): Promise<boolean> {
    const { targetCount } = condition.details;
    const { recommendCount = 0 } = compareData;
    // 추천 횟수가 없으면 예외 발생
    if (recommendCount == 0) throw new BadRequestException('recommendCount is required');
    // 추천 횟수가 조건에 맞으면 true, 아니면 false 반환
    return recommendCount >= targetCount;
  }
}

@Injectable()
export class PurchaseCountStrategy implements EventConditionStrategy {
  /**
   * 구매 조건 검증
   * @param compareData 비교 데이터
   * @param condition 이벤트 조건
   * @returns 구매 조건 검증 결과
   */
  async validate(compareData: CompareData, condition: EventCondition<EVENT_CONDITION_TYPE.PURCHASE_COUNT>): Promise<boolean> {
    const { targetCount } = condition.details;
    const { purchaseCount = 0 } = compareData;
    // 구매 횟수가 없으면 예외 발생
    if (purchaseCount == 0) throw new BadRequestException('purchaseCount is required');
    return purchaseCount >= targetCount;
  }
}

@Injectable()
export class EventConditionStrategyFactory {
  private strategies: Map<EVENT_CONDITION_TYPE, EventConditionStrategy>;

  constructor(
    private readonly loginStreakStrategy: LoginStreakStrategy,
    private readonly questClearStrategy: QuestClearStrategy,
    private readonly monsterKillStrategy: MonsterKillStrategy,
    private readonly recommendCountStrategy: RecommendCountStrategy,
    private readonly purchaseCountStrategy: PurchaseCountStrategy,
  ) {
    this.strategies = new Map<EVENT_CONDITION_TYPE, EventConditionStrategy>([
      [EVENT_CONDITION_TYPE.LOGIN_STREAK, this.loginStreakStrategy],
      [EVENT_CONDITION_TYPE.MONSTER_KILL, this.monsterKillStrategy],
      [EVENT_CONDITION_TYPE.QUEST_CLEAR, this.questClearStrategy],
      [EVENT_CONDITION_TYPE.RECOMMEND_COUNT, this.recommendCountStrategy],
      [EVENT_CONDITION_TYPE.PURCHASE_COUNT, this.purchaseCountStrategy],
    ]);
  }

  /**
   * 이벤트 조건 전략 반환
   * @param {EVENT_CONDITION_TYPE} type 이벤트 조건 타입
   * @returns {EventConditionStrategy} 이벤트 조건 전략
   */
  getStrategy(type: EVENT_CONDITION_TYPE): EventConditionStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown event condition type: ${type}`);

    return strategy;
  }
}
