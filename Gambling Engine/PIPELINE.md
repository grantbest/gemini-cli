# Reusable GitOps Pipeline Blueprint

This document describes the standardized GitOps pipeline and infrastructure architecture implemented in this project. This blueprint is designed to be extracted and reused across any containerized application to provide automated, environment-aware CI/CD.

## 1. Core Architecture Principles

*   **Build Once, Run Anywhere:** Docker images are built and tagged once with a unique SHA and branch name (e.g., `dev` or `prod`). The same image is used in all environments, with behavior modified via runtime environment variables.
*   **Branch-to-Environment Mapping:** 
    *   `dev` branch -> Development Environment (Mock APIs, debug logging).
    *   `main` branch -> Production Environment (Live APIs, high availability).
*   **Runtime Configuration (Bypassing Build-time Inlining):** To avoid the Next.js/React pitfall of inlining environment variables during the build, we use a "Runtime Config API" that serves environment-specific data to the client at execution time.

## 2. Pipeline Workflow (`.github/workflows/ci-cd.yml`)

The pipeline is split into two primary jobs:

### Job 1: Build & Push
*   **Trigger:** Push to `dev` or `main`.
*   **Registry:** GitHub Container Registry (GHCR).
*   **Tagging Strategy:**
    *   `sha-<short-sha>`: Precise version tracking.
    *   `dev`: Latest development build.
    *   `prod` / `latest`: Latest production build.
*   **Multi-Service Build:** Uses a strategy matrix to build `engine`, `frontend`, and supporting services in parallel.

### Job 2: Secure Deployment
*   **Environment-Specific Actions:** Uses GitHub Environments (`development`, `production`) to scope secrets.
*   **SSH-based GitOps:** Connects to the remote server, pulls the latest code, and executes a targeted `docker compose up -d --pull always`.
*   **Compose Overrides:** Combines the base `docker-compose.yml` with environment-specific overrides (`.dev.yml` or `.prod.yml`).

## 3. Configuration Management

### Local Development (`docker-compose.dev.yml`)
Standardizes the local experience to mirror the cloud development environment.
*   Includes a `mock_api` service.
*   Points `DEV_URL` and `PROD_URL` to local ports (3000/3001) for testing.

### Production Readiness (`docker-compose.prod.yml`)
Focuses on stability and scale.
*   `restart: always` policies.
*   Connects to live infrastructure and secure databases.

## 4. The Runtime Config Pattern
... (previous content) ...

## 6. Seeding Data for Testing

To visualize the solution with sample data (e.g., on a fresh dev deploy), use the included seeding script:

1.  **Local:** `python scripts/seed_db.py`
2.  **Remote (SSH):**
    ```bash
    ssh user@dev.bestfam.us "cd ~/apps/gambling-engine && docker compose exec engine python scripts/seed_db.py"
    ```
    *Note: Ensure the `DB_HOST` in the script matches the service name in your compose file (usually `db`).*

---
*Created by Do Something Inc.*
