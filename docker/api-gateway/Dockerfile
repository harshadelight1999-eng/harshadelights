# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY api-gateway/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY api-gateway/ .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apigateway -u 1001

# Production stage
FROM node:18-alpine AS production

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy built application and user info
COPY --from=builder /app .
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Create logs directory
RUN mkdir -p /app/logs && chown -R apigateway:nodejs /app

# Switch to non-root user
USER apigateway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Expose port
EXPOSE 4000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]