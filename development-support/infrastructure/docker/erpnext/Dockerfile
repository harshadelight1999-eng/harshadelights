# =====================================================================================
# HARSHA DELIGHTS - ERPNEXT CUSTOM DOCKER IMAGE
# =====================================================================================
# Multi-stage build for production-ready ERPNext with Harsha Delights customizations
# Includes security hardening, performance optimizations, and monitoring
# =====================================================================================

# Stage 1: Base ERPNext Image with Security Hardening
# =====================================================================================
FROM frappe/erpnext:v14 as base

# Switch to root for system-level installations
USER root

# Install additional system dependencies and security tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    # System monitoring and debugging tools
    htop \
    iotop \
    netcat \
    procps \
    curl \
    wget \
    jq \

    # Security and logging tools
    fail2ban \
    logrotate \

    # Development and debugging tools
    vim \
    git \
    tree \

    # Performance monitoring
    sysstat \

    # Database client tools
    default-mysql-client \
    postgresql-client \

    # Python development tools
    python3-dev \
    python3-pip \
    build-essential \

    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Install additional Python packages for customizations
RUN pip3 install --no-cache-dir \
    # API and integration libraries
    requests-oauthlib \
    python-jose[cryptography] \

    # Data processing and analytics
    pandas \
    numpy \
    xlsxwriter \
    openpyxl \

    # Image processing for product catalogs
    Pillow \

    # Queue and background processing
    celery \

    # Monitoring and logging
    prometheus-client \
    structlog \

    # Security
    cryptography \
    bcrypt \

    # Testing
    pytest \
    coverage

# Stage 2: Customization Layer
# =====================================================================================
FROM base as customization

# Create custom application directories
RUN mkdir -p /home/frappe/frappe-bench/apps/harsha_customizations

# Copy custom applications configuration
COPY --chown=frappe:frappe ./apps.txt /home/frappe/frappe-bench/sites/
# Note: harsha_customizations will be mounted as volume at runtime

# Switch to frappe user for application setup
USER frappe

# Install custom applications
WORKDIR /home/frappe/frappe-bench

# Install the custom app
# Custom app installation will be handled in startup script after volume mount

# Stage 3: Production Configuration
# =====================================================================================
FROM customization as production

# Switch back to root for final system configuration
USER root

# Configure log rotation
COPY --chown=root:root ./logrotate.conf /etc/logrotate.d/erpnext

# Configure fail2ban for security
COPY --chown=root:root ./fail2ban.conf /etc/fail2ban/jail.d/erpnext.conf

# Create healthcheck script
COPY --chown=root:root ./healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Create backup script
COPY --chown=root:root ./backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Create monitoring script
COPY --chown=root:root ./monitor.sh /usr/local/bin/monitor.sh
RUN chmod +x /usr/local/bin/monitor.sh

# Configure custom ERPNext settings
COPY --chown=frappe:frappe ./site_config.json /home/frappe/frappe-bench/sites/common_site_config.json

# Set up custom startup script
COPY --chown=frappe:frappe ./startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Create log directories with proper permissions
RUN mkdir -p /home/frappe/frappe-bench/logs \
    && mkdir -p /var/log/erpnext \
    && chown -R frappe:frappe /home/frappe/frappe-bench/logs \
    && chown -R frappe:frappe /var/log/erpnext

# Create performance monitoring directories
RUN mkdir -p /var/lib/erpnext/metrics \
    && chown -R frappe:frappe /var/lib/erpnext

# Security hardening
RUN echo "frappe soft nofile 65536" >> /etc/security/limits.conf \
    && echo "frappe hard nofile 65536" >> /etc/security/limits.conf \
    && echo "frappe soft nproc 32768" >> /etc/security/limits.conf \
    && echo "frappe hard nproc 32768" >> /etc/security/limits.conf

# Configure sysctl for performance
RUN echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf \
    && echo "net.ipv4.tcp_max_syn_backlog = 1024" >> /etc/sysctl.conf \
    && echo "vm.max_map_count = 262144" >> /etc/sysctl.conf

# Switch back to frappe user
USER frappe

# Set working directory
WORKDIR /home/frappe/frappe-bench

# Expose ports
EXPOSE 8000 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    DEBIAN_FRONTEND=noninteractive

# Labels for image metadata
LABEL maintainer="Harsha Delights Development Team" \
      description="ERPNext with Harsha Delights customizations for confectionery business" \
      version="1.0.0" \
      vendor="Harsha Delights" \
      org.opencontainers.image.title="Harsha Delights ERPNext" \
      org.opencontainers.image.description="Customized ERPNext for confectionery business operations" \
      org.opencontainers.image.vendor="Harsha Delights" \
      org.opencontainers.image.version="1.0.0"

# Use custom startup script
ENTRYPOINT ["/usr/local/bin/startup.sh"]
CMD ["bench", "start"]