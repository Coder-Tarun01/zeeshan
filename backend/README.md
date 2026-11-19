# ZEESHAN Admin API

FastAPI service that protects **`/admin`** on the website. Admin accounts live in
**PostgreSQL**; the browser signs in with a username + password and receives a signed JWT.

```
frontend (Vite/React)  ──POST /api/auth/login──▶  FastAPI  ──▶  PostgreSQL (admin_users)
        │                                            │
        └──────── Authorization: Bearer <jwt> ───────┘
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{username, password}` → `{access_token, expires_in, user}` |
| `GET` | `/api/auth/me` | Current admin (requires the bearer token) |
| `POST` | `/api/auth/logout` | 204 — the client drops its token |
| `POST` | `/api/auth/change-password` | `{current_password, new_password}` → 204 |
| `GET` | `/api/health` | `{status, database, environment}` |

Interactive docs: **`http://127.0.0.1:8000/api/docs`**

## Why these choices

| Concern | Implementation |
| --- | --- |
| Password storage | `hashlib.scrypt` (N=2¹⁴, r=8, p=1) with a 16-byte salt, stored as `scrypt$n$r$p$salt$hash`. Constant-time compare. No compiled dependencies. |
| Sessions | JWTs (HS256) signed with `JWT_SECRET`, carrying `sub`, `username`, `role`, `iss`, `iat`, `exp`. Default lifetime 8 h. |
| Brute force | 5 failed attempts per IP+username in 5 minutes → `429` with `Retry-After`. |
| User enumeration | Unknown usernames are still verified against a real dummy hash, and both cases return the same message. |
| Deactivation | `is_active` is checked on login **and** on every authenticated request. |
| Production safety | The app refuses to boot with `ENVIRONMENT=production` if `JWT_SECRET` is missing, default, or shorter than 32 characters. |
| CORS | Only the origins in `CORS_ORIGINS` may call the API. |

## Local setup (no Postgres needed)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
copy .env.example .env          # then edit JWT_SECRET

# create the first admin (prompts for the password)
python -m app.cli create-admin --username owner --display-name "Shop Owner" --role owner

# run the API
uvicorn app.main:app --reload --port 8000
```

`.env.example` points `DATABASE_URL` at `sqlite:///./dev-admin.db` so you can work without a
database server. Swap it for a PostgreSQL URL to use the real thing.

## Docker

The whole platform (Postgres + this API + the site) runs from the repository root:

```bash
cp .env.example .env      # root env file: POSTGRES_*, JWT_SECRET, CORS_ORIGINS, ports
docker compose up -d --build
docker compose logs -f api
```

Inside the container the API listens on `0.0.0.0:8000`; `docker-compose.yml` publishes it on
`${API_PORT:-8000}`. The image runs as a non-root user (`uid 10001`) and has a `/api/health`
healthcheck. See the root README for the full command list and the port-conflict note.

## PostgreSQL in production

```bash
# 1. a database + user
createdb zeeshan
psql -c "CREATE USER zeeshan WITH PASSWORD '…';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE zeeshan TO zeeshan;"

# 2. backend/.env
ENVIRONMENT=production
DATABASE_URL=postgresql://zeeshan:…@db-host:5432/zeeshan
JWT_SECRET=<output of: python -c "import secrets; print(secrets.token_urlsafe(48))">
CORS_ORIGINS=https://your-live-site.com
BOOTSTRAP_USERNAME=owner
BOOTSTRAP_PASSWORD=<a strong password>

# 3. create tables + first admin
python -m app.cli create-admin --username owner --role owner

# 4. serve it
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The table is created automatically on boot (`CREATE TABLE IF NOT EXISTS`). For a managed Postgres
(Render, Railway, Fly, Supabase, Neon) paste its connection string into `DATABASE_URL`.

## Admin CLI

```bash
python -m app.cli create-admin --username owner --display-name "Shop Owner" --role owner
python -m app.cli reset-password --username owner
python -m app.cli list-admins
python -m app.cli deactivate --username old-admin     # keeps the audit trail
```

Passwords must be **10+ characters** with at least 5 distinct characters, and cannot equal the
username. The same rules apply to `/api/auth/change-password`.

## Tests

```bash
python -m unittest discover -s tests -v
```

13 tests cover: login success/failure, identical errors for unknown users, inactive accounts,
token validation (missing/garbage/forged), `/me`, logout, password change, rate limiting,
payload validation, repeated `/me` calls, and cross-thread connection closing.

## Files

```
backend/
  app/
    main.py          FastAPI app, CORS, lifespan (schema + optional bootstrap), health
    config.py        environment settings (pydantic-settings)
    db.py            connections + schema (PostgreSQL via psycopg, SQLite for dev)
    security.py      scrypt hashing, JWT issue/verify
    repository.py    admin_users queries
    schemas.py       request/response models + password policy
    deps.py          get_db / get_current_user
    routers/auth.py  login (throttled), me, logout, change-password
    cli.py           create-admin / reset-password / list-admins / deactivate
  tests/test_auth.py
  requirements.txt
  .env.example
```
