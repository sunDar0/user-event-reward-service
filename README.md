# 이벤트/보상 관리 플랫폼

## 프로젝트 아키텍처 및 기술 선택 배경

### 마이크로서비스 통신 방식
기존 모노레포 구조에서 REST API 기반의 마이크로서비스 통신 대신, 이점이 있는 NestJS의 TCP 전송 계층과 MessagePattern을 활용한 구조를 채택했습니다.
- 성능면에서 더 가볍고 연결 유지로 빠른 통신이 가능
- 컴파일 시점에서 타입 체크 가능
- 확장에 용이함

### 공유 라이브러리 구조
`libs` 디렉토리 아래에 공통 모듈(user, event, reward)을 분리하였습니다.
- 코드 재사용성 향상
- 새로운 마이크로서비스 추가 시 즉시 활용 가능
- 일관된 비즈니스 로직 유지
- 타입 정의 공유

### 이벤트 조건 검증
Strategy 패턴을 활용하여 이벤트 조건 검증 로직을 구현했습니다:
- 각 조건 타입별 독립적인 검증 전략
- 새로운 조건 타입 추가가 용이
- 유지보수성 향상
- 테스트 용이성

> tcp 활용한 microService, mongodb 활용은 실무에서 경험해보지 못하여 어려웠지만 많은 공부가 되었습니다.

## 프로젝트 개요

이 프로젝트는 이벤트 조건 검증 자동화, 보상 지급, 그리고 역할 기반 접근 제어를 핵심 기능으로 제공합니다.

## 시스템 아키텍처

### 마이크로서비스 구성

시스템은 다음과 같은 3개의 독립적인 서버로 구성됩니다:

1. **Gateway Server**
   - 모든 API 요청의 단일 진입점
   - JWT 기반 인증 및 역할 기반 접근 제어
   - 요청 라우팅 처리
   - Swagger를 통한 API 문서화

2. **Auth Server**
   - 사용자 관리 (가입, 로그인, 정보 조회)
   - JWT 토큰 발급 및 관리 (Access Token + Refresh Token)
   - 역할(Role) 관리 (USER, OPERATOR, AUDITOR, ADMIN)
   - bcrypt를 사용한 비밀번호 해싱

3. **Event Server**
   - 이벤트 생성 / 조회
   - 이벤트 기준 보상 생성 / 조회
   - 보상 요청 처리 및 조건 검증
   - 보상 요청 전체 조회 / 유저 기준 보상 요청 조회
   - MongoDB 통한 보상 지급 관리

### 기술 스택

- **Backend**: 
  - Node.js 18
  - NestJS (최신 버전)
  - TypeScript
- **Database**: 
  - MongoDB (Mongoose)
- **Authentication**: 
  - JWT (Access Token + Refresh Token)
  - Passport
- **Validation**: 
  - class-validator
  - class-transformer
  - 커스텀 ObjectId 검증
- **Documentation**: 
  - Swagger/OpenAPI
- **Container**: 
  - Docker & Docker Compose
- **Package Manager**: 
  - pnpm (워크스페이스)

## 실행 방법

### 사전 요구사항

- Docker
- Docker Compose
- Node.js 18 (로컬 개발용)
- pnpm

### 로컬 실행

1. 저장소 클론
```bash
git clone {repository_url}
cd user-event-reward-service-msa
```

2. 의존성 설치
```bash
#pnpm 미설치된 경우 
npm install -g pnpm
#pnpm 설치된 경우
pnpm install
```

3. 환경 변수 설정 - 루트 경로에 .env 생성
```environment
# .env
TZ=Asia/Seoul
# 개발 환경 변수 파일
APP_NAME=event-platform
APP_ENV=dev
APP_VERSION=1.0.0

# API Gateway
API_GATEWAY_PORT=3000

# Auth Microservice
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=3001

# Event Microservice
EVENT_SERVICE_HOST=localhost
EVENT_SERVICE_PORT=3002

# JWT 설정
JWT_ACCESS_SECRET="user-event-reward-service_secret_key_!@#A()@*#"
JWT_REFRESH_SECRET="user-event-reward-service_secret_key_refresh_!@#A()@*#"
ACCESS_TOKEN_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d

# MongoDB
MONGO_URI=mongodb://dar:Asd1fgh2@localhost:27017/user-event-reward-service-msa?authSource=admin
```
4.1 로컬 실행 (mongodb가 로컬상에 설치되어있을 경우)
```bash
# api-gateway, auth-server, event-server 실행
pn start:all

```
4.2 Docker Compose로 실행
```bash
# api-gateway, auth-server, event-server, mongodb 컨테이너 실행
docker-compose up -d
```

서비스가 다음 포트로 실행됩니다:
- Gateway Server: http://localhost:3000
- Auth Server: http://localhost:3001
- Event Server: http://localhost:3002
- MongoDB: mongodb://localhost:27017

## API 문서

Swagger UI를 통해 API 문서를 확인할 수 있습니다:
- http://localhost:3000/api-docs

### 주요 API 엔드포인트

#### 인증 API (Auth Server)
- `POST /api/v1/auth/register`: 사용자 가입
- `POST /api/v1/auth/login`: 로그인 (Access Token + Refresh Token 발급)
- `POST /api/v1/auth/refresh`: 토큰 갱신
- `PUT /api/v1/users/:userId/roles`: 사용자 권한 수정 (ADMIN)

#### 이벤트 관리 API (Event Server)
- `POST /api/v1/events`: 이벤트 생성 (OPERATOR)
- `GET /api/v1/events`: 이벤트 목록 조회 (OPERATOR)
- `GET /api/v1/events/:id`: 이벤트 상세 조회 (OPERATOR)

#### 보상 관리 API (Event Server)
- `POST /api/v1/events/:eventId/rewards`: 보상 등록 (OPERATOR)
- `GET /api/v1/events/:eventId/rewards`: 보상 목록 조회 (AUDITOR)

#### 보상 요청 API (Event Server)
- `POST /api/v1/reward-requests`: 보상 요청 생성 (USER)
- `GET /api/v1/reward-requests/me`: 내 보상 요청 내역 조회 (USER)
- `GET /api/v1/reward-requests`: 전체 보상 요청 내역 조회 (AUDITOR)


## 이벤트 조건 설계

### 지원하는 이벤트 조건 타입

1. **연속 로그인 (LOGIN_STREAK)**
   - 연속 로그인 일수 기반 보상
   - 예: 7일 연속 로그인 시 보상 지급
   - 조건 검증: `CompareData` 클래스의 `loginDates` 배열 활용

2. **퀘스트 클리어 (QUEST_CLEAR)**
   - 특정 퀘스트 완료 기반 보상
   - 예: 특정 퀘스트 ID 클리어 시 보상 지급
   - 조건 검증: `CompareData` 클래스의 `completedQuests` 배열 활용

3. **몬스터 처치 (MONSTER_KILL)**
   - 특정 몬스터 n마리 처치 기반 보상
   - A 몬스터 10마리 처치 시 보상 지급
   - 조건 검증:  `CompareData` 클래스의 `killedMonsters` 객체 활용
4. **구매 n회 완료**
   - 아이템 구매나 캐시구매 n회 완료
   - 아이템 10회 구매 완료
   - 조건 검증:  `CompareData` 클래스의 `purchaseCount` 객체 활용
5. **추천 n회 받기**
   - 특정 몬스터 n마리 처치 기반 보상
   - A 몬스터 10마리 처치 시 보상 지급
   - 조건 검증:  `CompareData` 클래스의 `recommendCount` 객체 활용

### 조건 검증 프로세스
1. 이벤트 기간 및 상태 확인
   - 이벤트의 `startDate`, `endDate`, `status` 필드 검증
2. 조건 타입별 검증 로직 실행
   - Strategy 패턴을 활용한 조건별 검증 로직 실행
3. 보상 수량 확인 및 지급 처리
   - MongoDB 트랜잭션을 통한 안전한 보상 지급
   - `rewards.remainingQuantity` 자동 차감

## 프로젝트 구조

```
user-event-reward-service-msa/
├── apps/                      # 마이크로서비스 애플리케이션
│   ├── api-gateway/          # API 게이트웨이 서버
│   ├── auth-server/         # 인증 서버
│   └── event-server/        # 이벤트/보상 서버
├── libs/                     # 공통 라이브러리
│   └── common/              # 공유 모듈
│       ├── auth/           # 인증 관련 모듈
│       ├── dtos/           # 공통 DTO 정의
│       ├── events/         # 이벤트 관련 모듈
│       ├── interfaces/     # 공통 인터페이스
│       ├── reward/         # 보상 관련 모듈
│       └── user/           # 사용자 관련 모듈
├── docker/                  # Docker 관련 파일
├── docker-compose.yml      # Docker Compose 설정
└── package.json           # 프로젝트 의존성
```

## 보안

- **인증 및 인가**
  - JWT 기반 인증 (Access Token + Refresh Token)
  - 역할 기반 접근 제어(RBAC)
  - 비밀번호 bcrypt 해싱

- **데이터 보안**
  - MongoDB 트랜잭션을 통한 데이터 정합성 보장
  - ObjectId 검증을 통한 안전한 ID 처리
  - 입력값 검증 및 sanitization

- **API 보안**
  - Rate Limiting 적용
  - CORS 설정
  - Helmet을 통한 보안 헤더 설정

## 에러 처리
  - 전역 ExceptionFilter를 통한 일관된 에러 응답
  - 상세한 에러 메시지 및 코드
  - 개발/운영 환경별 에러 처리 분리

## 테스트
### 실행 방법
```bash
# 패스 유무 체크
pn t test
# 커버리지 확인
pn t test:cov
```
### 테스트 방식
- **단위 테스트**
  - Jest를 사용한 서비스 단위 테스트
  - 각 마이크로서비스별 독립적인 테스트
  - Mock을 활용한 의존성 격리
- **테스트 케이스**
  - api.gateway.controller
  - api.gateway.servcie