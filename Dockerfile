# Production Dockerfile using official Eclipse Temurin JDK 21 base image
FROM eclipse-temurin:21-jdk-jammy AS build-stage

# Install Node.js 22 LTS
RUN apt-get update && apt-get install -y curl --no-install-recommends \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package configurations
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install root, backend, and frontend dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source files
COPY backend ./backend
COPY frontend ./frontend

# Build frontend production bundle
RUN cd frontend && npm run build

# Production Stage
FROM eclipse-temurin:21-jdk-jammy AS production-stage

# Install Node.js 22 LTS in production runner
RUN apt-get update && apt-get install -y curl --no-install-recommends \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy production files and built frontend from build-stage
COPY --from=build-stage /app/backend/package.json ./backend/
COPY --from=build-stage /app/backend/node_modules ./backend/node_modules
COPY --from=build-stage /app/backend ./backend
COPY --from=build-stage /app/frontend/dist ./frontend/dist

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
