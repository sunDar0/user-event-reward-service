export enum REWARD_REQUEST_STATUS {
  PENDING = 'PENDING', // 대기
  APPROVED = 'APPROVED', // 승인
  REJECTED = 'REJECTED', // 거절
  CLAIMED = 'CLAIMED', // 수령 완료
  FAILED_CONDITION_NOT_MET = 'FAILED_CONDITION_NOT_MET', // 조건 미충족으로 실패
  FAILED_NO_REMAINING_REWARD = 'FAILED_NO_REMAINING_REWARD', // 남은 보상 수량 없음으로 실패
  FAILED_ALREADY_CLAIMED = 'FAILED_ALREADY_CLAIMED', // 이미 수령한 보상이어서 실패
}

export enum REWARD_TYPE {
  CASH = 'CASH', // 현금
  GOLD = 'GOLD', // 골드
  ITEM = 'ITEM', // 아이템
  COUPON = 'COUPON', // 쿠폰
}
