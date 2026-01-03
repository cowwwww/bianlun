# Simple PocketBase Dockerfile for Render.com
FROM alpine:3.19

ARG PB_VERSION=0.26.5

# Install minimal dependencies
RUN apk add --no-cache ca-certificates curl

# Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /usr/local/bin/ && rm /tmp/pb.zip && chmod +x /usr/local/bin/pocketbase

# Create data directory and copy local database
WORKDIR /app
COPY pb_data/ ./data/
COPY pb_migrations/ ./migrations/

# Expose port
EXPOSE 8090

# Start PocketBase with embedded data
CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/data", "--migrationsDir=/app/migrations"]
