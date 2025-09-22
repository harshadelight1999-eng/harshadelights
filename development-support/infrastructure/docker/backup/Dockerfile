# =====================================================================================
# HARSHA DELIGHTS - BACKUP SERVICE DOCKER IMAGE
# =====================================================================================
# Automated backup solution for databases and application data
# =====================================================================================

FROM alpine:3.18

# Install required packages
RUN apk add --no-cache \
    bash \
    curl \
    mysql-client \
    postgresql-client \
    redis \
    tar \
    gzip \
    aws-cli \
    rclone \
    dcron \
    logrotate \
    python3 \
    py3-pip

# Install additional Python packages for backup operations
RUN pip3 install --no-cache-dir \
    boto3 \
    psycopg2-binary \
    PyMySQL \
    redis \
    python-dateutil

# Create backup user and directories
RUN adduser -D -s /bin/bash backup && \
    mkdir -p /backups /scripts /logs /config && \
    chown -R backup:backup /backups /scripts /logs /config

# Copy backup scripts
COPY scripts/ /scripts/
COPY config/ /config/

# Make scripts executable
RUN chmod +x /scripts/*.sh

# Set up cron for automated backups
COPY crontab /etc/crontabs/backup
RUN chmod 0644 /etc/crontabs/backup

# Switch to backup user
USER backup

# Working directory
WORKDIR /backups

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /scripts/healthcheck.sh

# Set environment variables
ENV BACKUP_RETENTION_DAYS=30 \
    BACKUP_COMPRESSION=true \
    BACKUP_ENCRYPTION=false \
    LOG_LEVEL=INFO

# Default command
CMD ["/scripts/backup-daemon.sh"]