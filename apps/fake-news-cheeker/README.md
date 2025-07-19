---
title: Fake News Cheeker
emoji: 💬
colorFrom: yellow
colorTo: purple
sdk: gradio
sdk_version: 5.0.1
app_file: main.py
pinned: false
license: mit
short_description: Fake News Checker is an advanced Natural Language Processing
---

# Fake News Checker

## Dockerized Setup

### Prerequisites
- Docker and Docker Compose installed
- `.env` file with all required environment variables (see `.env.example`)

### Services
- **backend**: Production-ready Python server using Gunicorn
- **backend-dev**: Development server with hot-reload and code volume mount
- **db**: PostgreSQL 14 database

### Usage

#### 1. Build and Run Production
```bash
docker compose up --build backend db
```
- Runs the app with Gunicorn (recommended for production)
- No code volume mount (container is immutable)

#### 2. Development Mode (with hot-reload)
```bash
docker compose up --build backend-dev db
```
- Mounts code for live editing
- Uses Flask's development server with `--reload`

#### 3. Environment Variables
- Place all secrets and config in a `.env` file at the project root
- Example:
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/verinews
HF_TOKEN=your_hf_token
DEEPSEEK_MODEL=bespokelabs/Bespoke-MiniCheck-7B
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_cx
USE_GPU=1
BATCH_SIZE=4
```

#### 4. Database Persistence
- Data is stored in the `pgdata` Docker volume

#### 5. Healthchecks
- (Optional) Implement a `healthcheck.sh` script and uncomment the healthcheck section in `docker-compose.yml` for production monitoring.

---

For more details, see the code and comments in `Dockerfile` and `docker-compose.yml`.
