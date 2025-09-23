# ============================================================================
# Harsha Delights API Gateway - Multi-stage Docker Build
# ============================================================================

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm install --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    tini

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create required directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Health check - use port 10000 to match Render configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:10000/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port 10000 to match Render PORT environment variable
EXPOSE 10000

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "src/server.js"]

# Labels for metadata
LABEL \
    org.opencontainers.image.title="Harsha Delights API Gateway" \
    org.opencontainers.image.description="API Gateway for Harsha Delights confectionery system" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.vendor="Harsha Delights" \
    org.opencontainers.image.source="https://github.com/harshadelights/api-gateway" \
    org.opencontainers.image.documentation="https://api.harshadelights.com/docs" \
    maintainer="dev@harshadelights.com"