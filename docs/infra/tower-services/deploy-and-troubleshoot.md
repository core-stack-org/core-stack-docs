---
title: Deploy, update, and troubleshoot
description: How to put a new Tower Service on the IITD cluster, how to update one, and the proxy / Docker / Nginx fixes that usually unblock you.
---

# Deploy, update, and troubleshoot

This page is for **students, researchers, and individuals** who package an app for the Tower Services cluster (`act4dws5`, Dell Pro Max Tower) — and for the person who starts or updates that container on the host.

Package the app first: [Cluster Docker Services](../../server/cluster-docker-services.md) and [Cluster Service Checklist](../../server/cluster-service-checklist.md). Live URLs: [Deployed Architecture](deployed-architecture.md).

On this host the Compose CLI is **`docker-compose`** (with a hyphen). `docker compose` (v2 plugin) is not what the tower uses.

---

## 0. Quick reference

| Item | Value |
| --- | --- |
| Public site | `https://www.cse.iitd.ernet.in/act4dws5/…` (also `act4dws5`, `uat.core-stack.org`) |
| IITD HTTP proxy | `http://proxy21.iitd.ac.in:3128/` |
| Shared Docker network | `corestack-network` (**external** — create once) |
| Docker DNS for Nginx | `127.0.0.11` |
| Airflow container | `corestac-stacd-airflow` |
| Airflow API base (from other containers) | `http://corestac-stacd-airflow:8080/act4dws5/airflow` |
| Central Postgres | `corestackpostgres:5432` |
| Container clock | **UTC** (IST = UTC + 5:30) |

**Standard `NO_PROXY` / `no_proxy`** — put every **internal** hostname here. If you add a new service, add its hostname to `NO_PROXY` in **every** container that talks to it:

```text
localhost,127.0.0.1,::1,corestackpostgres,corestac-stacd-airflow,corestack-treecrown-api,geoserver,core-stack,core-stack-fileserver,dpm-dashboard,dpm-titiler,host.docker.internal,.iitd.ac.in,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

Set **both** `NO_PROXY` and `no_proxy` (some libraries only read lowercase).

---

## 1. Deploy a new service { #deploy-a-new-service }

Do this **after** the checklist is ticked and a maintainer has agreed on a public path (for example `/my-app`).

### 1.1 What you must have ready

| Piece | Ready means |
| --- | --- |
| Image | Pinned tag on GHCR or Docker Hub; README has the exact `docker pull` line |
| Host folders | `code/`, `models/`, `data/` (and `data/logs/<app-name>/`) on the tower |
| `.env` | Secrets only on the host — proxy, `NO_PROXY`, Airflow, Google SSO, Postgres |
| Postgres (if needed) | DB + user on **`corestackpostgres`** — see [§7](#7-postgres-corestackpostgres) |
| Airflow DAG (if used) | Uploaded via STACD; `AIRFLOW_API_BASE` and `AIRFLOW_DAG_ID` set |
| Google Sign-In | Client ID origins include the public host — [runbook §12](../../server/cluster-docker-services.md#12-google-sign-in-setup) |
| Nginx path | Agreed with the maintainer (`/my-app`, `/my-app/api/`, …) |

### 1.2 One-time host pieces (ask a maintainer if unsure)

```bash
# Shared network — "already exists" is fine
docker network create corestack-network
docker network inspect corestack-network
```

Confirm the Docker **daemon** can pull images through the IITD proxy: [Tower Services — Docker pull](index.md#docker-pull-behind-the-iit-delhi-proxy).

### 1.3 Place files on the tower

Typical layout (names vary by project):

```text
~/deployment/<your-app>/
  docker-compose.yml      # or docker-compose.hub.prod.yml
  .env                    # real secrets — never commit
  code/                   # git checkout → mounts at /app
  models/                 # weights
  data/                   # inputs, outputs, logs
```

```bash
cd ~/deployment/<your-app>
git clone <your-repo-url> code
# copy models into models/
cp .env.example .env      # then edit .env on the host
```

In `.env` (minimum ideas — use the names your app documents):

```dotenv
# Registry image
IMAGE=your-user/your-app:1.0.0

# Airflow on this cluster (leave empty only for local laptop tests)
AIRFLOW_API_BASE=http://corestac-stacd-airflow:8080/act4dws5/airflow
AIRFLOW_DAG_ID=your_dag_id
AIRFLOW_USERNAME=...
AIRFLOW_PASSWORD=...

# Proxy — outbound internet
HTTP_PROXY=http://proxy21.iitd.ac.in:3128/
HTTPS_PROXY=http://proxy21.iitd.ac.in:3128/
http_proxy=http://proxy21.iitd.ac.in:3128/
https_proxy=http://proxy21.iitd.ac.in:3128/
NO_PROXY=localhost,127.0.0.1,::1,corestackpostgres,corestac-stacd-airflow,corestack-treecrown-api,geoserver,core-stack,core-stack-fileserver,host.docker.internal,.iitd.ac.in,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
no_proxy=localhost,127.0.0.1,::1,corestackpostgres,corestac-stacd-airflow,corestack-treecrown-api,geoserver,core-stack,core-stack-fileserver,host.docker.internal,.iitd.ac.in,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16

# Google Sign-In
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Central Postgres (URL-encode special characters in the password)
DATABASE_URL=postgresql://USER:PASSWORD@corestackpostgres:5432/DBNAME
```

Compose must join the shared network:

```yaml
services:
  api:   # ← this key is what docker-compose commands use (not container_name)
    image: ${IMAGE}
    container_name: my-app-api   # optional human name
    restart: unless-stopped
    env_file: .env
    environment:
      HTTP_PROXY: ${HTTP_PROXY}
      HTTPS_PROXY: ${HTTPS_PROXY}
      http_proxy: ${http_proxy}
      https_proxy: ${https_proxy}
      NO_PROXY: ${NO_PROXY}
      no_proxy: ${no_proxy}
    volumes:
      - ./code:/app
      - ./models:/app/models
      - ./data:/app/data
    networks:
      - corestack-network
    # Prefer a health path your app implements, e.g. /livez or /health
    command: >
      uvicorn app.main:app --host 0.0.0.0 --port 8000
      --proxy-headers --forwarded-allow-ips='*'

networks:
  corestack-network:
    external: true
```

`--proxy-headers` / `--forwarded-allow-ips='*'` matter when Nginx sits in front (correct scheme and client IP).

!!! tip "Service key vs container name"
    `docker-compose … up -d api` uses the **service key** (`api`).  
    `ERROR: No such service: my-app-api` means you passed `container_name` by mistake. List keys with `docker-compose -f <file>.yml config --services`.

### 1.4 Pull and start

```bash
cd ~/deployment/<your-app>
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.yml ps
docker logs <container> --tail 100
```

If the container is not on the network:

```bash
docker network connect corestack-network <container>
```

### 1.5 Ask for an Nginx route

Public traffic enters **one** Nginx. A maintainer adds a `location` for your path. Pattern that works for APIs (trailing slashes strip the prefix):

```nginx
resolver 127.0.0.11 valid=30s;

location /my-app/api/ {
    proxy_pass http://<your-container-hostname>:8000/;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade           $http_upgrade;
    proxy_set_header Connection        "upgrade";
}
```

If `proxy_pass` uses a **variable**, Nginx will **not** strip the `/my-app/api/` prefix unless you `rewrite` — see [path prefix](#path-prefix-arrives-wrong-at-the-app).

After reload: `nginx -t && nginx -s reload` (inside the Nginx container or on the host, depending on how Nginx is run).

### 1.6 Smoke-test

```bash
# From another container on corestack-network — bypass Squid for Docker DNS names
docker exec -it <your-container> curl --noproxy '*' -v http://127.0.0.1:8000/health

# Through Nginx (from a browser or the host)
curl -I https://www.cse.iitd.ernet.in/act4dws5/my-app/
```

Then: Google Sign-In → start one small job → confirm files under `data/<app>/` → open [FileBrowser](https://www.cse.iitd.ernet.in/act4dws5/file/).

### 1.7 Tell people it exists

Update [Deployed Architecture](deployed-architecture.md) (path, one-line description, GitHub repo) when the service is public.

---

## 2. Update a service { #update-a-service }

Pick the smallest change that matches what you shipped.

### 2.1 Code-only change (deps-only image)

`code/` is mounted. On the tower:

```bash
cd ~/deployment/<your-app>/code
git pull
docker-compose -f ../docker-compose.yml restart <service-key>
# or recreate if the process does not reload:
docker-compose -f ../docker-compose.yml up -d --force-recreate <service-key>
```

### 2.2 New image tag (dependency or base change)

1. Bump `VERSION` / image tag in the repo; push the image.
2. On the tower, set `IMAGE=…:new-tag` in `.env`.
3. Pull and recreate:

```bash
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d --force-recreate <service-key>
docker exec <container> env | grep -E 'IMAGE|VERSION|AIRFLOW|NO_PROXY'   # sanity
```

!!! warning "`docker restart` does not reload `.env`"
    After any env change, use `up -d --force-recreate <service>`. Then `docker exec <container> env | grep …` to confirm.

### 2.3 Models or data only

Copy into `models/` or `data/` on the host. Restart only if the app caches files at startup.

### 2.4 Schema migrations (Postgres)

`create_all()` does **not** add new columns to existing tables. Run your migrator against central Postgres, for example:

```bash
docker-compose -f docker-compose.yml run --rm api alembic upgrade head
```

Keep the revision argument on **one line** (or use `\` line breaks). A wrapped `head` makes Alembic say the revision is missing.

### 2.5 Airflow DAG / STACD YAML change

Update YAMLs through the STACD UI (or re-upload). Do not hand-edit generated Airflow `.py` on the cluster. Unpause the DAG after deploy.

### 2.6 Google Sign-In or public URL change

Add the new JavaScript origin / redirect URI in Google Cloud, wait a few minutes, recreate the app container so env is current. Details: [Google Sign-In](../../server/cluster-docker-services.md#12-google-sign-in-setup).

### 2.7 Orphans and cleanups

```text
WARNING: Found orphan containers (…)
```

Old Compose layouts leave containers behind. Confirm nothing still points at them (especially a private DB), then:

```bash
docker-compose -f docker-compose.yml up -d --remove-orphans
```

---

## 3. Proxy issues (the #1 cause of failures) { #proxy }

The tower has **no direct internet**. Containers use Squid (`proxy21`). Squid **cannot** resolve Docker hostnames such as `corestac-stacd-airflow`.

### 3.1 Squid `503` / `ERR_DNS_FAIL` for an internal name

**Symptom**

```text
HTTP/1.0 503 Service Unavailable
Server: squid
X-Squid-Error: ERR_DNS_FAIL 0
```

**Cause** — `http_proxy` is set, so the call to a Docker hostname went to Squid.

**Fix**

- One-off: `curl --noproxy '*' http://corestac-stacd-airflow:8080/`
- Permanent: add the hostname to **both** `NO_PROXY` and `no_proxy`, then **recreate** the container.

**Rule:** if the response header is `Server: squid`, it is a proxy / `NO_PROXY` problem — not “Airflow is down”.

### 3.2 Docker build cannot reach apt / pip

Builds do not inherit your shell proxy; `sudo` may strip env.

```bash
sudo docker-compose build \
  --build-arg http_proxy="http://proxy21.iitd.ac.in:3128/" \
  --build-arg https_proxy="http://proxy21.iitd.ac.in:3128/" \
  --build-arg no_proxy="localhost,127.0.0.1"
```

In the Dockerfile, **before** `RUN apt-get` / `pip`:

```dockerfile
ARG http_proxy
ARG https_proxy
ARG no_proxy
```

Use `ARG`, not `ENV`, so the running container is not forced to proxy everything.

### 3.3 Google OAuth through the proxy { #google-oauth-through-the-proxy }

**Symptom** — `ProxyError … Tunnel connection failed: 302` for `oauth2.googleapis.com:443`, then HTTP 500.

Try, in order:

1. Leave `*.googleapis.com` / `accounts.google.com` **out** of `NO_PROXY` so Squid handles HTTPS CONNECT.
2. If the container can reach Google directly, add those hosts to `NO_PROXY`.
3. If Squid blocks CONNECT to Google, ask the IITD network team to allow it.

```bash
docker exec -it <container> env | grep -i proxy
docker exec -it <container> curl -v https://oauth2.googleapis.com/token
```

### 3.4 Compose proxy template

```yaml
services:
  myservice:
    environment:
      HTTP_PROXY: http://proxy21.iitd.ac.in:3128/
      HTTPS_PROXY: http://proxy21.iitd.ac.in:3128/
      http_proxy: http://proxy21.iitd.ac.in:3128/
      https_proxy: http://proxy21.iitd.ac.in:3128/
      NO_PROXY: "localhost,127.0.0.1,::1,corestackpostgres,corestac-stacd-airflow,…"
      no_proxy: "localhost,127.0.0.1,::1,corestackpostgres,corestac-stacd-airflow,…"
      # TiTiler / rasterio / GDAL
      GDAL_HTTP_PROXY: http://proxy21.iitd.ac.in:3128/
```

Daemon-level pull proxy (image pulls): [index](index.md#docker-pull-behind-the-iit-delhi-proxy). Do **not** put `registry-1.docker.io` or `auth.docker.io` in daemon `NO_PROXY`.

---

## 4. Docker networking { #docker-networking }

### 4.1 Containers cannot see each other / Nginx 502

Every service that talks to another must be on `corestack-network`:

```bash
docker network create corestack-network
docker network inspect corestack-network
docker network connect corestack-network <container>
```

### 4.2 Env not applied / bind-mount overrides image code

- Recreate after `.env` changes (`--force-recreate`).
- `env_file:` passes values **literally** — `${VAR}` inside a `.env` file is **not** expanded. Put interpolated values under compose `environment:`.
- A bind mount `- .:/app` **hides** the code inside a pulled image. On the cluster, mount **`code/`**, **`models/`**, **`data/`** separately so deps stay in the image.

### 4.3 Containers or images “disappearing”

```bash
docker events --filter type=container --filter type=image
crontab -l; ls /etc/cron.d/; systemctl list-timers
docker system df; df -h
journalctl -u docker --since "1 hour ago"
```

Common causes: prune / Watchtower, a script running `docker-compose down --rmi`, GPU start failure + supervisor rebuild, or two `up` commands fighting over a fixed `container_name`.

---

## 5. Nginx reverse proxy { #nginx }

### 5.1 Routing table (today)

| Public path | Upstream (Docker DNS) |
| --- | --- |
| `/geoserver` | `geoserver:8080/geoserver` |
| `/corestack/` | `core-stack:8000/` |
| `/airflow/` | `corestac-stacd-airflow:8080/airflow/` |
| `/file` | `core-stack-fileserver:80` |
| `/drone/api/` | `corestack-treecrown-api:8000/` |
| `/nginx-health` | Nginx itself |

`server_name act4dws5 uat.core-stack.org _;`

### 5.2 Curl to upstream works, Nginx returns 404

Nginx does not use your shell `no_proxy`. Add Docker DNS:

```nginx
resolver 127.0.0.11 valid=30s;
```

Then `nginx -t && nginx -s reload`. If still wrong, `nginx -T` — the location may live in another file, or reload never ran.

### 5.3 Path prefix arrives wrong at the app { #path-prefix-arrives-wrong-at-the-app }

**Symptom** — browser calls `/drone/api/livez`, app sees `GET /` or a path that 404s.

**Cause** — `proxy_pass` with a **variable** disables prefix stripping.

**Fix (static upstream)** — trailing slash on both sides:

```nginx
location /drone/api/ {
    proxy_pass http://corestack-treecrown-api:8000/;
    # proxy_set_header … as above
}
```

**Fix (variable + rewrite)**

```nginx
location /drone/api/ {
    resolver 127.0.0.11 valid=30s;
    set $drone_upstream http://corestack-treecrown-api:8000;
    rewrite ^/drone/api/(.*)$ /$1 break;
    proxy_pass $drone_upstream;
}
```

### 5.4 SPA under `/drone/` — blank page or asset 404

Prefix stripping fixes HTML, but absolute `/static/...` URLs miss the location. Build the frontend with a **base path**, or serve assets under the same prefix.

### 5.5 Read the status code

| You see | Meaning |
| --- | --- |
| `Server: squid` | `NO_PROXY` / proxy misconfigured |
| Nginx **502** | Upstream down or unreachable (network / wrong name) |
| App **404** (uvicorn/gunicorn) | Path / prefix problem |
| App **500** | Application or OAuth / DB error — read `docker logs` |

```bash
docker ps | grep <upstream>
docker logs <upstream> --tail 50
docker exec -it <nginx> curl --noproxy '*' -v http://corestack-treecrown-api:8000/livez
```

Other fixes already applied on this host: `X-Forwarded-For` spelling, WebSocket `Upgrade` headers for Airflow logs, larger buffers for GeoServer, `events {}` in a standalone `nginx.conf`, do not rate-limit static assets.

---

## 6. Airflow { #airflow }

### 6.1 UI under `/airflow`

```dotenv
AIRFLOW__WEBSERVER__BASE_URL=http://act4dws5/airflow
```

Recreate after changing it. Expect a redirect to `/airflow/home`:

```bash
docker exec -it corestac-stacd-airflow bash -c 'env | grep -i AIRFLOW__WEBSERVER'
curl --noproxy '*' -I http://corestac-stacd-airflow:8080/airflow/
```

### 6.2 API base from other apps (for example TreeCrown)

```dotenv
AIRFLOW_API_BASE=http://corestac-stacd-airflow:8080/act4dws5/airflow
# some apps use TCP_AIRFLOW_BASE_URL — same value
```

A JSON **401** from `/api/v1/dags/.../dagRuns` means the **path is right**; send basic auth (`AIRFLOW_USERNAME` / `AIRFLOW_PASSWORD`). Add `corestac-stacd-airflow` to `NO_PROXY`.

### 6.3 First-run DB files

SQLite paths must be **files** before mount (otherwise “not a directory”):

```bash
mkdir -p ~/deployment/stacd/{stacd_catalog_data,airflow_db}
touch ~/deployment/stacd/airflow_db/{airflow.db,stacd_database.db}
docker exec stacd-airflow bash -c "airflow db migrate"
```

### 6.4 Cron at the wrong time

Container clock is UTC. Prefer:

```cron
CRON_TZ=Asia/Kolkata
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
no_proxy=localhost,127.0.0.1,corestac-stacd-airflow
NO_PROXY=localhost,127.0.0.1,corestac-stacd-airflow

0 2 * * * /bin/bash /app/scripts/trigger_airflow_forecast.sh >> /var/log/airflow_forecast_trigger.log 2>&1
```

If `CRON_TZ` is ignored, schedule in UTC (`30 20 * * *` ≈ 02:00 IST).

---

## 7. Postgres (`corestackpostgres`) { #7-postgres-corestackpostgres }

### 7.1 Create an app database

```bash
docker exec -i corestackpostgres psql -U postgres <<'EOF'
CREATE USER treecrown WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE treecrown OWNER treecrown;
EOF
```

- `GRANT … TO` takes a **role name**, never the password.
- `OWNER` already has full rights on that database.
- Re-run fails with “already exists”; use `ALTER USER … WITH PASSWORD` to rotate.

### 7.2 Passwords in URLs

URL-encode: `@` → `%40`, `#` → `%23`, `:` → `%3A`, `/` → `%2F`.

```text
postgresql://treecrown:pass%40123@corestackpostgres:5432/treecrown
```

Add `corestackpostgres` to every client’s `NO_PROXY`.

```bash
docker exec -it corestackpostgres psql -U treecrown -d treecrown -c '\conninfo'
```

---

## 8. GeoServer, FileBrowser, and misc

**GeoServer** — persist `data_dir` on the host; join `corestack-network`; Celery / backend must list `geoserver` in `NO_PROXY`. Avoid double slashes in REST URLs (`…/geoserver//rest` → fix trailing slash on `service_url`).

**FileBrowser** — UI over shared `data/`; public path `/file`.

**GPU** — Compose `deploy.resources.reservations.devices` needs `nvidia-container-toolkit` on the host. If the toolkit is missing, the container may fail to start and look “deleted”.

**BuildKit** — `no build stage in current context` → wrong `target:` / `COPY --from=`; try `DOCKER_BUILDKIT=1`.

---

## 9. Debug checklist (run in this order) { #debug-checklist }

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker network inspect corestack-network | grep Name
docker exec <c> env | grep -i proxy
docker exec <c> getent hosts <target-host>
docker exec <c> curl --noproxy '*' -v http://<target-host>:<port>/
docker logs <c> --tail 100
docker exec <nginx> nginx -T | less
```

| Response | Next step |
| --- | --- |
| `Server: squid` | Fix `NO_PROXY` / `no_proxy`, recreate |
| Nginx 502 | Upstream down or not on `corestack-network` |
| App 404 | Nginx `proxy_pass` / path prefix |
| App 401/403 on Airflow | Path OK — add basic auth |
| OAuth / 500 on login | [Google OAuth through the proxy](#google-oauth-through-the-proxy) and [Sign-In runbook](../../server/cluster-docker-services.md#12-google-sign-in-setup) |

---

## Related pages

| Page | Use it for |
| --- | --- |
| [Tower Services](index.md) | What the cluster is; why Airflow |
| [Cluster Docker Services](../../server/cluster-docker-services.md) | How to package the app |
| [Cluster Service Checklist](../../server/cluster-service-checklist.md) | Acceptance before deploy |
| [Deployed Architecture](deployed-architecture.md) | What is live today |
