# Multi-stage build for Next.js frontend applications
FROM node:18-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies for all frontend apps
COPY frontend-applications/package*.json ./
COPY frontend-applications/shared/package*.json ./shared/
COPY frontend-applications/01-public-website/package*.json ./01-public-website/
COPY frontend-applications/02-b2c-ecommerce/package*.json ./02-b2c-ecommerce/
COPY frontend-applications/03-b2b-portal/package*.json ./03-b2b-portal/

RUN npm ci --only=production

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend-applications/ .

# Build all applications
RUN npm run build:all

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server.js"]