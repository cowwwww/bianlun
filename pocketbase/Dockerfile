# Use pre-built PocketBase image to avoid Docker Hub issues
FROM ghcr.io/muchobien/pocketbase:0.26.5

# Copy local database to a different path (to avoid volume override)  
COPY pb_data/ /app/data/
COPY pb_migrations/ /app/migrations/

# Expose port
EXPOSE 8090

# Start PocketBase with our data from /app path
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/data", "--migrationsDir=/app/migrations"]



