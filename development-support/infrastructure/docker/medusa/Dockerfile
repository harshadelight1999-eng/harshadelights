# =====================================================================================
# HARSHA DELIGHTS - MEDUSA.JS E-COMMERCE DOCKER IMAGE
# =====================================================================================
# Multi-stage build for production-ready Medusa.js e-commerce backend
# Includes security hardening, performance optimizations, and monitoring
# =====================================================================================

# Stage 1: Base Node.js Image
# =====================================================================================
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    # Basic system tools
    curl \
    wget \
    netcat-openbsd \
    htop \

    # Build tools for native modules
    python3 \
    make \
    g++ \
    git \

    # Image processing libraries (for product images)
    vips-dev \
    vips-tools \

    # Security tools
    dumb-init \

    # Performance monitoring
    procps

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Stage 2: Dependencies Installation
# =====================================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Install development dependencies separately for development stage
COPY package*.json ./
RUN npm install && npm cache clean --force

# Stage 3: Development Environment
# =====================================================================================
FROM base AS development

# Copy all dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p uploads logs tmp .medusa && \
    chown -R nodejs:nodejs /app

# Install development tools globally
RUN npm install -g @medusajs/medusa-cli@latest pm2@5.3.0

# Expose ports
EXPOSE 9000 7000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Stage 4: Build Stage
# =====================================================================================
FROM dependencies AS build

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to nodejs user for build
USER nodejs

# Build the application
RUN npm run build

# Stage 5: Production Environment
# =====================================================================================
FROM base AS production

# Copy only production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/package.json ./
COPY --from=build --chown=nodejs:nodejs /app/medusa-config.js ./
COPY --from=build --chown=nodejs:nodejs /app/ecosystem.config.js ./

# Copy other necessary files
COPY --chown=nodejs:nodejs ./src ./src
COPY --chown=nodejs:nodejs ./data ./data

# Create necessary directories
RUN mkdir -p uploads logs tmp .medusa static && \
    chown -R nodejs:nodejs /app

# Install PM2 for process management
RUN npm install -g pm2@5.3.0 && npm cache clean --force

# Remove package managers for security
RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx

# Expose ports
EXPOSE 9000 7000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=1024 --enable-source-maps" \
    NPM_CONFIG_LOGLEVEL=warn \
    MEDUSA_ENV=production

# Labels for image metadata
LABEL maintainer="Harsha Delights Development Team" \
      description="Medusa.js E-commerce Backend for Harsha Delights" \
      version="1.0.0" \
      vendor="Harsha Delights" \
      org.opencontainers.image.title="Harsha Delights Medusa Backend" \
      org.opencontainers.image.description="E-commerce backend service for confectionery business" \
      org.opencontainers.image.vendor="Harsha Delights" \
      org.opencontainers.image.version="1.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Production command with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]