export enum REWARD_REQUEST_STATUS {
  PENDING = 'PENDING', // 대기
  APPROVED = 'APPROVED', // 승인
  REJECTED = 'REJECTED', // 거절
  CLAIMED = 'CLAIMED', // 수령 완료
}

export enum REWARD_TYPE {
  CASH = 'CASH', // 현금
  GOLD = 'GOLD', // 골드
  ITEM = 'ITEM', // 아이템
  COUPON = 'COUPON', // 쿠폰
}
