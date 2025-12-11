FROM alpine:latest

ARG PB_VERSION=0.22.0

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zip \
    curl

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Create data directory
RUN mkdir -p /pb_data

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8090/api/health || exit 1

# Start PocketBase
CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"]

