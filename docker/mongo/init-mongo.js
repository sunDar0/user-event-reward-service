// MongoDB 초기화 스크립트
db = db.getSiblingDB('maplestory-msa');

// 사용자 생성
db.createUser({
  user: 'maplestory',
  pwd: 'maplestory123',
  roles: [
    {
      role: 'readWrite',
      db: 'maplestory-msa',
    },
  ],
});

// 인덱스 생성
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ nickname: 1 }, { unique: true });

db.events.createIndex({ startDate: 1, endDate: 1 });
db.events.createIndex({ status: 1 });

db.rewards.createIndex({ eventId: 1 });
db.rewards.createIndex({ remainingQuantity: 1 });

db.rewardRequests.createIndex({ userId: 1 });
db.rewardRequests.createIndex({ eventId: 1 });
db.rewardRequests.createIndex({ rewardId: 1 });
db.rewardRequests.createIndex({ status: 1 });
db.rewardRequests.createIndex({ createdAt: 1 });