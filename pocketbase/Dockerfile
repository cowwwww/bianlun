# Use pre-built PocketBase image to avoid Docker Hub issues
FROM ghcr.io/muchobien/pocketbase:0.26.5

# Copy local database (includes all collections and data)  
COPY pb_data/ /pb_data/
COPY pb_migrations/ /pb_migrations/

# Expose port
EXPOSE 8090

# Start PocketBase with our data
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--migrationsDir=/pb_migrations"]



