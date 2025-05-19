export enum EVENT_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ENDED = 'ENDED',
}

export enum EVENT_CONDITION_TYPE {
  LOGIN_STREAK = 'LOGIN_STREAK', // 로그인 연속 일수
  RECOMMEND_COUNT = 'RECOMMEND_COUNT', // 추천 누적 n개 달성
  PURCHASE_COUNT = 'PURCHASE_COUNT', // 구매 누적 n개 달성
  MONSTER_KILL = 'MONSTER_KILL', // 모든 몬스터 n마리 잡기
  QUEST_CLEAR = 'QUEST_CLEAR', // 퀘스트 클리어
}
