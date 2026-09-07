# Multi-stage Dockerfile for SonuTechHub (Node.js 22 + OpenJDK 21)
FROM node:22-bookworm-slim AS build-stage

# Install OpenJDK 21 and compiler tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-21-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package.json and workspace package configs
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source codes
COPY backend ./backend
COPY frontend ./frontend

# Build frontend production bundle
RUN cd frontend && npm run build

# Production Environment Stage
FROM node:22-bookworm-slim AS production-stage

# Install OpenJDK 21 Runtime and JDK Compiler (javac & java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-21-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy production node_modules and builds from build stage
COPY --from=build-stage /app/backend/package.json ./backend/
COPY --from=build-stage /app/backend/node_modules ./backend/node_modules
COPY --from=build-stage /app/backend ./backend
COPY --from=build-stage /app/frontend/dist ./frontend/dist

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
