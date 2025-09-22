# Medusa.js E-commerce Backend
FROM node:18-alpine AS base

RUN apk update && apk upgrade && apk add --no-cache dumb-init python3 make g++

WORKDIR /app

# Copy package files
COPY ecommerce-backend/package*.json ./
COPY ecommerce-backend/yarn.lock* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY ecommerce-backend/ .

# Build Medusa
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medusa -u 1001

# Production stage
FROM node:18-alpine AS production

RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy application
COPY --from=base /app .
COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

# Set ownership
RUN chown -R medusa:nodejs /app

USER medusa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:9000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

EXPOSE 9000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]