# 메이플스토리 이벤트/보상 관리 플랫폼

## 프로젝트 개요

이 프로젝트는 메이플스토리 PC 웹 백엔드 엔지니어 과제로, 이벤트와 보상을 관리하는 마이크로서비스 아키텍처(MSA) 기반의 플랫폼입니다. 이벤트 조건 검증 자동화, 보상 지급 관리, 그리고 역할 기반 접근 제어(RBAC)를 핵심 기능으로 제공합니다.

## 시스템 아키텍처

### 마이크로서비스 구성

시스템은 다음과 같은 3개의 독립적인 서버로 구성됩니다:

1. **Gateway Server**
   - 모든 API 요청의 단일 진입점
   - JWT 기반 인증 및 역할 기반 접근 제어
   - 요청 라우팅 처리

2. **Auth Server**
   - 사용자 관리 (가입, 로그인, 정보 조회)
   - JWT 토큰 발급 및 관리
   - 역할(Role) 관리

3. **Event Server**
   - 이벤트 CRUD 관리
   - 보상 정의 및 관리
   - 보상 요청 처리 및 조건 검증
   - 보상 지급 상태 관리

### 기술 스택

- **Backend**: Node.js 18, NestJS
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Access Token + Refresh Token)
- **Language**: TypeScript
- **Container**: Docker & Docker Compose

## 실행 방법

### 사전 요구사항

- Docker
- Docker Compose
- Node.js 18 (로컬 개발용)

### 로컬 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd maplestory-msa
```

2. 환경 변수 설정
```bash
# 각 서비스 디렉토리에 .env 파일 생성
cp apps/gateway/.env.example apps/gateway/.env
cp apps/auth-server/.env.example apps/auth-server/.env
cp apps/event-server/.env.example apps/event-server/.env
```

3. Docker Compose로 실행
```bash
docker-compose up --build
```

서비스가 다음 포트로 실행됩니다:
- Gateway Server: http://localhost:3000
- Auth Server: http://localhost:3001
- Event Server: http://localhost:3002
- MongoDB: mongodb://localhost:27017

## API 문서

### 인증 API (Auth Server)

#### 사용자 관리
- `POST /api/v1/auth/register`: 사용자 가입
- `POST /api/v1/auth/login`: 로그인
- `POST /api/v1/auth/refresh`: 토큰 갱신

### 이벤트 관리 API (Event Server)

#### 이벤트 관리
- `POST /api/v1/events`: 이벤트 생성 (OPERATOR, ADMIN)
- `GET /api/v1/events`: 이벤트 목록 조회 (OPERATOR, ADMIN)
- `GET /api/v1/events/:id`: 이벤트 상세 조회 (OPERATOR, ADMIN)

#### 보상 관리
- `POST /api/v1/events/:eventId/rewards`: 보상 등록 (OPERATOR, ADMIN)
- `GET /api/v1/events/:eventId/rewards`: 보상 목록 조회 (모든 사용자)
- `PUT /api/v1/events/:eventId/rewards/:rewardId`: 보상 수정 (OPERATOR, ADMIN)
- `DELETE /api/v1/events/:eventId/rewards/:rewardId`: 보상 삭제 (ADMIN)

#### 보상 요청
- `POST /api/v1/reward-requests`: 보상 요청 생성 (USER)
- `GET /api/v1/reward-requests/me`: 내 보상 요청 내역 조회 (USER)
- `GET /api/v1/reward-requests`: 전체 보상 요청 내역 조회 (OPERATOR, AUDITOR, ADMIN)
- `PUT /api/v1/reward-requests/:requestId/approve`: 보상 요청 승인 (OPERATOR, ADMIN)
- `PUT /api/v1/reward-requests/:requestId/reject`: 보상 요청 거절 (OPERATOR, ADMIN)

## 이벤트 조건 설계

### 지원하는 이벤트 조건 타입

1. **로그인 스트릭 (LOGIN_STREAK)**
   - 연속 로그인 일수 기반 보상
   - 예: 7일 연속 로그인 시 보상 지급

2. **퀘스트 클리어 (QUEST_CLEAR)**
   - 특정 퀘스트 완료 기반 보상
   - 예: 특정 퀘스트 ID 클리어 시 보상 지급

### 조건 검증 프로세스

1. 이벤트 기간 및 상태 확인
2. 사용자별 이벤트 진행 상황 조회
3. 조건 타입별 검증 로직 실행
4. 보상 수량 확인 및 지급 처리

## 프로젝트 구조

```
maplestory-msa/
├── apps/
│   ├── gateway/           # API Gateway 서버
│   ├── auth-server/       # 인증 서버
│   └── event-server/      # 이벤트/보상 서버
├── libs/
│   └── common/           # 공통 모듈 (DTO, 인터페이스, 유틸리티)
├── docker/
│   ├── gateway/
│   ├── auth-server/
│   └── event-server/
├── docker-compose.yml
└── package.json
```

## 보안 고려사항

- 모든 API 요청은 JWT 토큰 검증
- 비밀번호는 bcrypt로 해싱
- 역할 기반 접근 제어(RBAC) 구현
- MongoDB 트랜잭션을 통한 데이터 정합성 보장

## 모니터링 및 로깅

- Winston을 사용한 구조화된 로깅
- 주요 비즈니스 로직 처리 과정 기록
- 에러 및 예외 상황 추적
- API 요청/응답 로깅