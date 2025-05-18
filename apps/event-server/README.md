# event & reward service

## 이벤트 관리 API

### 이벤트 생성
- **Endpoint**: POST /api/v1/events
- **권한**: OPERATOR, ADMIN
- **기능**: 새로운 이벤트를 생성합니다.

### 이벤트 목록 조회
- **Endpoint**: GET /api/v1/events
- **권한**: OPERATOR, ADMIN
- **기능**: 모든 이벤트 목록을 조회합니다.

### 이벤트 상세 조회
- **Endpoint**: GET /api/v1/events/:id
- **권한**: OPERATOR, ADMIN
- **기능**: 특정 이벤트의 상세 정보를 조회합니다.

## 보상 관리 API

### 보상 등록
- **Endpoint**: POST /api/v1/events/:eventId/rewards
- **권한**: OPERATOR, ADMIN
- **기능**: 특정 이벤트에 보상을 등록합니다.

### 보상 목록 조회
- **Endpoint**: GET /api/v1/events/:eventId/rewards
- **권한**: 모든 사용자
- **기능**: 특정 이벤트의 보상 목록을 조회합니다.

### 보상 수정
- **Endpoint**: PUT /api/v1/events/:eventId/rewards/:rewardId
- **권한**: OPERATOR, ADMIN
- **기능**: 특정 보상의 정보를 수정합니다.

### 보상 삭제
- **Endpoint**: DELETE /api/v1/events/:eventId/rewards/:rewardId
- **권한**: ADMIN
- **기능**: 특정 보상을 삭제합니다.

## 보상 요청 API

### 보상 요청 생성
- **Endpoint**: POST /api/v1/reward-requests
- **권한**: USER
- **기능**: 사용자가 이벤트 보상을 요청합니다.

### 내 보상 요청 내역 조회
- **Endpoint**: GET /api/v1/reward-requests/me
- **권한**: USER
- **기능**: 자신의 보상 요청 내역을 조회합니다.

### 전체 보상 요청 내역 조회
- **Endpoint**: GET /api/v1/reward-requests
- **권한**: OPERATOR, AUDITOR, ADMIN
- **기능**: 전체 또는 필터링된 보상 요청 내역을 조회합니다.

### 보상 요청 승인
- **Endpoint**: PUT /api/v1/reward-requests/:requestId/approve
- **권한**: OPERATOR, ADMIN
- **기능**: 보상 요청을 승인합니다.

### 보상 요청 거절
- **Endpoint**: PUT /api/v1/reward-requests/:requestId/reject
- **권한**: OPERATOR, ADMIN
- **기능**: 보상 요청을 거절합니다.
