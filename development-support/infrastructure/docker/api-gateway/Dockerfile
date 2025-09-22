# =====================================================================================
# HARSHA DELIGHTS - API GATEWAY DOCKER IMAGE
# =====================================================================================
# Multi-stage build for production-ready Node.js API Gateway
# Includes security hardening, performance optimizations, and monitoring
# =====================================================================================

# Stage 1: Base Node.js Image
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
    procps

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Dependencies Installation
# =====================================================================================
FROM base AS dependencies

# Install all dependencies (including dev dependencies)
RUN npm ci --only=production && npm cache clean --force

# Install development dependencies separately
COPY package*.json ./
RUN npm ci --only=development && npm cache clean --force

# Stage 3: Development Environment
# =====================================================================================
FROM base AS development

# Copy all dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p logs tmp && \
    chown -R nodejs:nodejs /app

# Install development tools globally
RUN npm install -g nodemon@3.0.2 pm2@5.3.0

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Stage 4: Production Build
# =====================================================================================
FROM base AS production

# Copy only production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p logs tmp uploads && \
    chown -R nodejs:nodejs /app

# Remove development files
RUN rm -rf test/ docs/ *.md .git/

# Install PM2 for process management
RUN npm install -g pm2@5.3.0 && npm cache clean --force

# Security: Remove package managers
RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx

# Create PM2 ecosystem file
COPY --chown=nodejs:nodejs ./ecosystem.config.js ./

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Security and performance optimization
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=1024 --enable-source-maps" \
    UV_THREADPOOL_SIZE=32 \
    NPM_CONFIG_LOGLEVEL=warn

# Labels for image metadata
LABEL maintainer="Harsha Delights Development Team" \
      description="API Gateway for Harsha Delights microservices integration" \
      version="1.0.0" \
      vendor="Harsha Delights" \
      org.opencontainers.image.title="Harsha Delights API Gateway" \
      org.opencontainers.image.description="Node.js API Gateway for microservices orchestration" \
      org.opencontainers.image.vendor="Harsha Delights" \
      org.opencontainers.image.version="1.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Production command with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]