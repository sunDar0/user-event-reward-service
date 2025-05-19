# 공통 의존성을 위한 기본 스테이지
FROM node:18-slim AS base

# pnpm 특정 버전 설치
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# 작업 디렉토리 설정
WORKDIR /app

# 워크스페이스 설정 파일 복사
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# package.json 파일 복사
COPY apps/*/package.json ./apps/

# 모든 의존성 설치
RUN pnpm install

# 소스 코드 복사
COPY . .

# 공통 라이브러리 빌드 스테이지
FROM base AS common-builder
RUN pnpm run build:common

# 각 서비스별 빌드 스테이지
FROM common-builder AS service-builder
ARG SERVICE_NAME
RUN pnpm run build:${SERVICE_NAME}

# 프로덕션 스테이지
FROM node:18-slim AS production

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# 작업 디렉토리 설정
WORKDIR /app

# 워크스페이스 설정 및 의존성 파일 복사
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps ./apps
COPY --from=service-builder /app/dist ./dist
COPY --from=common-builder /app/dist/libs/common ./dist/libs/common

# 프로덕션 의존성만 설치
RUN pnpm install --prod

# 환경 변수 설정
ENV NODE_ENV=production
ARG PORT
ENV PORT=${PORT}

# 포트 노출
EXPOSE ${PORT}

# 애플리케이션 실행
CMD ["node", "dist/apps/${SERVICE_NAME}/main"] 