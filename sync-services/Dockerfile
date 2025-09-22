# =====================================================================================
# HARSHA DELIGHTS - SYNC SERVICES DOCKER IMAGE
# =====================================================================================
# Multi-stage build for production-ready TypeScript sync services
# Handles real-time data synchronization between ERPNext, Medusa, and EspoCRM
# =====================================================================================

# Stage 1: Base Node.js Image with TypeScript Support
# =====================================================================================
FROM node:18-alpine AS base

# Install system dependencies and security tools
RUN apk add --no-cache \
    # Basic system tools
    curl \
    wget \
    netcat-openbsd \
    htop \
    # Build tools (needed for native modules)
    python3 \
    make \
    g++ \
    # Security tools
    dumb-init \
    # Performance monitoring
    procps && \
    # Clean up
    rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S harsha -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Stage 2: Dependencies Installation
# =====================================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm install && npm cache clean --force

# Stage 3: Build Stage
# =====================================================================================
FROM dependencies AS builder

# Copy source code
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build && \
    # Verify build output
    ls -la dist/

# Stage 4: Development Environment
# =====================================================================================
FROM base AS development

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code
COPY --chown=harsha:nodejs src/ ./src/

# Create necessary directories
RUN mkdir -p logs tmp uploads && \
    chown -R harsha:nodejs /app

# Install development tools globally
RUN npm install -g nodemon@3.0.2 ts-node@10.9.1

# Expose ports (main service + metrics)
EXPOSE 3005 9090

# Switch to non-root user
USER harsha

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Stage 5: Production Environment
# =====================================================================================
FROM base AS production

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3005 \
    METRICS_PORT=9090 \
    NODE_OPTIONS="--max-old-space-size=1024 --enable-source-maps" \
    UV_THREADPOOL_SIZE=32

# Copy package files for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p logs tmp uploads backups && \
    chown -R harsha:nodejs /app

# Copy configuration files
COPY --chown=harsha:nodejs .env.example ./.env.example

# Install PM2 for process management
RUN npm install -g pm2@5.3.0 && npm cache clean --force

# Create PM2 ecosystem configuration
RUN echo 'module.exports = {\
  apps: [{\
    name: "harsha-sync-services",\
    script: "./dist/index.js",\
    instances: 2,\
    exec_mode: "cluster",\
    max_memory_restart: "1G",\
    error_file: "./logs/err.log",\
    out_file: "./logs/out.log",\
    log_file: "./logs/combined.log",\
    time: true,\
    env: {\
      NODE_ENV: "production",\
      PORT: 3005\
    }\
  }]\
}' > ecosystem.config.js && \
    chown harsha:nodejs ecosystem.config.js

# Security: Remove package managers
RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx

# Switch to non-root user
USER harsha

# Expose ports (main service + metrics)
EXPOSE 3005 9090

# Health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Labels for image metadata
LABEL maintainer="Harsha Delights Development Team" \
      description="Real-time sync services for Harsha Delights ecosystem" \
      version="1.0.0" \
      vendor="Harsha Delights" \
      org.opencontainers.image.title="Harsha Delights Sync Services" \
      org.opencontainers.image.description="TypeScript microservice for data synchronization" \
      org.opencontainers.image.vendor="Harsha Delights" \
      org.opencontainers.image.version="1.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Production command with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]