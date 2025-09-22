# =====================================================================================
# HARSHA DELIGHTS - NGINX REVERSE PROXY DOCKER IMAGE
# =====================================================================================
# Production-ready Nginx reverse proxy with SSL, security, and load balancing
# =====================================================================================

FROM nginx:1.25-alpine

# Install additional tools
RUN apk add --no-cache \
    curl \
    wget \
    openssl \
    certbot \
    certbot-nginx

# Create necessary directories
RUN mkdir -p /var/log/nginx \
    /etc/nginx/ssl \
    /var/cache/nginx \
    /var/www/html

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create SSL certificate directory and generate self-signed cert for development
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/harshadelights.key \
    -out /etc/nginx/ssl/harshadelights.crt \
    -subj "/C=IN/ST=State/L=City/O=Harsha Delights/CN=harshadelights.local"

# Create health check endpoint
RUN echo "OK" > /var/www/html/health

# Set proper permissions
RUN chown -R nginx:nginx /var/log/nginx /var/cache/nginx /var/www/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]