FROM alpine:latest

ARG PB_VERSION=0.26.5

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zip \
    curl \
    tzdata

# Set timezone
ENV TZ=Asia/Shanghai

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Create directories
RUN mkdir -p /pb_data /pb_migrations /pb_hooks

# Copy the existing database with all collections and data
COPY pb_data/ /pb_data/

# Copy migrations to container
COPY pb_migrations/ /pb_migrations/

# Copy hooks if they exist
COPY pb_hooks/ /pb_hooks/

# Create a startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Starting PocketBase with existing data..."' >> /start.sh && \
    echo 'exec /usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data --migrationsDir=/pb_migrations --hooksDir=/pb_hooks' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:8090/api/health || exit 1

# Start PocketBase
CMD ["/start.sh"]



