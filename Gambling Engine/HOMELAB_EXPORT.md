# Home Lab Migration Guide: WE do it inc. Betting Engine

Use this guide to move the infrastructure management of the Betting Engine into your centralized **Home Lab** repository. This allows you to manage shared services (Postgres, Redis, Ollama) independently.

## 1. Shared Infrastructure (Host this in `/shared-services`)

Your Home Lab should maintain a single, high-availability instance of these services.

```yaml
services:
  # Shared Database for all apps
  db:
    image: postgres:15-alpine
    container_name: homelab_postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Shared Message Bus
  redis:
    image: redis:7-alpine
    container_name: homelab_redis
    ports:
      - "6379:6379"

  # Shared AI Layer (Connecting to your Macbook Ollama)
  # Ensure your Macbook Ollama is listening on 0.0.0.0 or use a tunnel
  # On Linux/Docker, host.docker.internal works if configured.
```

## 2. Application Deployment (Host this in `/apps/betting-engine`)

Create a `docker-compose.yml` in your Home Lab repo that pulls the pre-built images from GHCR.

```yaml
services:
  engine:
    image: ghcr.io/grantbest/gambling-engine/engine:latest
    container_name: betting_engine
    environment:
      DB_HOST: homelab_postgres  # Or your server IP
      DB_NAME: mlb_engine_prod
      DB_USER: admin
      DB_PASS: your_secure_password
      REDIS_HOST: homelab_redis
      OLLAMA_BASE_URL: http://host.docker.internal:11434
    restart: always

  frontend:
    image: ghcr.io/grantbest/gambling-engine/frontend:latest
    container_name: betting_dashboard
    environment:
      DATABASE_URL: postgresql://admin:your_secure_password@homelab_postgres:5432/mlb_engine_prod
      APP_ENV: production
      DEV_URL: https://dev.bestfam.us
      PROD_URL: https://prod.bestfam.us
    ports:
      - "3001:3000"
    restart: always
```

## 3. Database Initialization

Once your Home Lab Postgres is up, run the following to create the specific database and apply the schema:

```bash
# Create the DB
docker exec -it homelab_postgres psql -U admin -c "CREATE DATABASE mlb_engine_prod;"

# Apply Schema (Run from the application repo or copy schema.sql)
DB_NAME=mlb_engine_prod DB_HOST=your_server_ip python init_db.py
```

## 4. Why this is better
*   **Decoupled:** You can update the Betting Engine code without touching your database or Redis containers.
*   **Scalable:** Your Home Lab can now host 10+ apps all sharing the same Postgres instance.
*   **Security:** Secrets are managed at the Home Lab level, not hardcoded in application logic.

---
*WE do it inc. Infrastructure Division*
