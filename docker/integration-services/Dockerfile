# Integration Services Container
FROM node:18-alpine AS builder

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY integration-services/unified-business-operations/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY integration-services/unified-business-operations/ .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S integrationuser -u 1001

# Production stage
FROM node:18-alpine AS production

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy application
COPY --from=builder /app .
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Create logs directory
RUN mkdir -p /app/logs && chown -R integrationuser:nodejs /app

USER integrationuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:6000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

EXPOSE 6000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]