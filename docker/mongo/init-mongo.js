// MongoDB 초기화 스크립트
db = db.getSiblingDB('admin');
db.auth('admin', '12121212');

// 데이터베이스 생성 및 전환
db = db.getSiblingDB('user-event-reward-service-msa');

// 사용자 생성
db.createUser({
  user: 'user-1',
  pwd: 'user-1-password',
  roles: [
    {
      role: 'readWrite',
      db: 'user-event-reward-service-msa',
    },
  ],
});
