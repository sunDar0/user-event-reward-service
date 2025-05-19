# Base stage for common dependencies
FROM node:18-slim AS base

# Install build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files for proper dependency resolution
COPY apps/*/package.json ./apps/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage for common library
FROM base AS common-builder
RUN pnpm run build:common

# Build stage for each service
FROM common-builder AS service-builder
ARG SERVICE_NAME
RUN pnpm run build:${SERVICE_NAME}

# Production stage
FROM node:18-slim AS production

# Install build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration and dependencies
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps ./apps
COPY --from=service-builder /app/dist ./dist
COPY --from=common-builder /app/dist/libs/common ./dist/libs/common

# Install production dependencies
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ARG PORT
ENV PORT=${PORT}

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/apps/${SERVICE_NAME}/main"] 