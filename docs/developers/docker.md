---
title: Docker
description: Run the CoRE Stack backend with Docker Compose — GCS and GEE config, optional local-compute layers, and the admin-boundary compute API.
---

# Run CoRE Stack Backend with Docker

Pull the published **runtime** image and start Postgres, GeoServer, and Django. You do not need Conda, a local Postgres install, or a GitHub password.

The image has the Python/Conda environment and helper scripts only. It does **not** contain the Django app. Compose bind-mounts your [core-stack-backend](https://github.com/core-stack-org/core-stack-backend) checkout onto `/app`, so Django runs the code on your machine. Edit files in that clone; `runserver` reloads them. You do not rebuild the image for app changes.

This page is the full Docker path: first start, **GCS / GEE**, optional **local-compute layer downloads**, and how to call **`POST /api/v1/generate_block_layer/`**.

For the native Linux installer, see [Installer](installer.md). GCS and Earth Engine background: [Google Cloud Storage](integrations/gcs.md) and [Google Earth Engine](integrations/google-earth-engine.md).

## What you get

| Service | URL | Login |
| --- | --- | --- |
| Django / API | http://localhost:8000 | Superuser `test_user_XXXX` / `test_change_me` (see [step 6](#6-wait-for-first-start)) |
| Django admin | http://localhost:8000/admin/ | Same superuser (or any user you create) |
| GeoServer | http://localhost:8080/geoserver | `admin` / `geoserver` |

Postgres listens on `localhost:5432` (`corestack_admin` / `corestack@123`, database `corestack_db`).

Computing APIs run **in-process** inside the backend container (`CELERY_TASK_ALWAYS_EAGER`). You do not start a separate Celery worker. The HTTP call blocks until the task finishes.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with Compose v2 (`docker compose version`)
- About **20 GB** free disk (images plus the first-run admin-boundary download, ~8 GB). Extra local-compute layers need much more if you enable them.
- Ports **8000**, **8080**, and **5432** free
- Git, to clone [core-stack-backend](https://github.com/core-stack-org/core-stack-backend) (Compose bind-mounts the checkout onto `/app`)
- For compute APIs that publish to Earth Engine / GeoServer: a GEE **service-account JSON** and a **GCS bucket** that account can write to (create the bucket in **`us-central1`**)

The backend and GeoServer images are **linux/amd64**. Docker Desktop on Apple Silicon runs them with emulation. Use `docker compose`; do not `docker pull` the tag by hand on Apple Silicon.

## 1. Clone the repository

```bash
git clone https://github.com/core-stack-org/core-stack-backend.git
cd core-stack-backend
```

A full clone is required. Compose mounts `.` (the backend directory) onto `/app` in `backend`, `data-download`, `geoserver-init`, and `gee-config`.

```yaml
volumes:
  - ${BACKEND_CODE_DIR:-.}:/app
```

To mount a different tree, set `BACKEND_CODE_DIR` in a `.env` next to `docker-compose.yml`, then recreate:

```bash
BACKEND_CODE_DIR=/path/to/other/checkout
```

```bash
docker compose up -d --force-recreate backend geoserver-init gee-config data-download
```

You do not build the backend image yourself. Pull `ghcr.io/core-stack-org/core-stack-backend:latest` for Conda, GDAL, and the entrypoint scripts.

## 2. Configure GCS and Google Earth Engine

The stack **starts** without GEE. Any compute job that initializes Earth Engine, uploads a shapefile, or publishes rasters needs **both** of the following.

| What | Where | Why |
| --- | --- | --- |
| `GCS_BUCKET_NAME` and `GEE_STORAGE_PROJECT` | Compose `.env` next to `docker-compose.yml` | Builds GEE asset paths (`projects/<project>/assets/apps/mws/...`) and the GCS upload bucket |
| `GEEAccount` row | Django admin, with the JSON uploaded | `ee_initialize(gee_account_id)` reads credentials from the database, not from the file mount |

!!! warning
    Adding the account in admin alone is not enough. If `GEE_STORAGE_PROJECT` is empty, jobs try `projects//assets/apps/mws/...` and fail. Setting Compose env without a Django `GEEAccount` skips Earth Engine (`GEEAccount with id=N was not found`).

### 2.1 Service-account JSON

```bash
mkdir -p gee_confs
cp /path/to/your-gee-service-account.json gee_confs/gee-service-account.json
```

Compose mounts `./gee_confs` at `/app/data/gee_confs`. On start, `gee-config.sh` reads `project_id` from that JSON and can fill `GEE_STORAGE_PROJECT` when you did not set it in `.env`.

`GCS_BUCKET_NAME` is **never** inferred. You must set it.

The JSON needs Earth Engine access on the GEE Cloud project, and write access on the GCS bucket (see [Google Cloud Storage](integrations/gcs.md)).

### 2.2 Create the GCS bucket

Use the **same** service account as the GEE JSON. Create the bucket in **`us-central1`** (`ee.Image.loadGeoTIFF` fails in other regions).

```bash
# Pick a unique bucket name (GCS names are global). Example used in local Docker: core_stack
export GCS_BUCKET=core_stack
export GEE_SA=name@project-id.iam.gserviceaccount.com

gcloud storage buckets create "gs://${GCS_BUCKET}" --location=us-central1

gcloud storage buckets add-iam-policy-binding "gs://${GCS_BUCKET}" \
  --member="serviceAccount:${GEE_SA}" \
  --role=roles/storage.objectViewer

gcloud storage buckets add-iam-policy-binding "gs://${GCS_BUCKET}" \
  --member="serviceAccount:${GEE_SA}" \
  --role=roles/storage.legacyBucketReader

gcloud storage buckets add-iam-policy-binding "gs://${GCS_BUCKET}" \
  --member="serviceAccount:${GEE_SA}" \
  --role=roles/storage.objectAdmin
```

Shapefile components are uploaded under `gs://<bucket>/shapefiles/...` before ingest to GEE.

### 2.3 Compose `.env`

Create `.env` next to `docker-compose.yml`:

```bash
GCS_BUCKET_NAME=core_stack
GEE_STORAGE_PROJECT=ee-your-project
GEE_STORAGE_PROJECT_HELPER=ee-your-project
```

Replace the values:

- **`GCS_BUCKET_NAME`**: GCS bucket the service account can write to (example: `core_stack`). Django falls back to `core_stack` only if this env is empty; still set it explicitly.
- **`GEE_STORAGE_PROJECT`**: GEE Cloud project id. This is the `project_id` field inside the service-account JSON. Asset paths become `projects/<project>/assets/apps/mws/<state>/<district>/<block>/`.
- **`GEE_STORAGE_PROJECT_HELPER`**: helper project if you have a second account; otherwise use the same project.

If you change `.env` after the backend is already running, recreate it so Django picks up the values:

```bash
docker compose up -d --force-recreate --no-deps backend
```

!!! important
    Do not only edit `nrm_app/.env`. Compose injects `GCS_BUCKET_NAME` / `GEE_STORAGE_PROJECT` into the container environment, and empty Compose values win over the Django file.

Skip GCS/GEE only if you need Django/GeoServer without layer jobs.

## 3. Optional: download extra local-compute layers

Admin-boundary data (~8 GB) **always** downloads on first start into the `core_stack_data` volume (`DATA_DIR=/var/tmp/core-stack-data`).

Other base layers are **off by default**. Add selectors to `.env` or the command line:

```bash
# .env
DOWNLOAD_LOCAL_COMPUTE_LAYERS=terrain,mws
```

```bash
DOWNLOAD_LOCAL_COMPUTE_LAYERS=terrain docker compose up -d
DOWNLOAD_LOCAL_COMPUTE_LAYERS=terrain,mws docker compose up -d
DOWNLOAD_LOCAL_COMPUTE_LAYERS=lulc_v3 docker compose up -d
DOWNLOAD_LOCAL_COMPUTE_LAYERS=all docker compose up -d
```

| Selector | Notes |
| --- | --- |
| `terrain` | Terrain rasters |
| `mws` | Microwatershed layers |
| `lulc_v3` | LULC v3 rasters (multi-year, several GB) |
| `static_layers` | Static rasters (some S3 keys may 403 and are skipped) |
| `tehsil_level` | Tehsil placeholders |
| `soi_tehsil` | SOI tehsil |
| `tehsil_watersheds` | Fetched from GeoServer after Django seed |
| `all` or `1` | All of the above |

List every selector from a running backend:

```bash
docker compose exec backend python manage.py local_compute_layer_setup --list --skip-checks
```

These files land on the same volume as admin-boundary: `/var/tmp/core-stack-data`.

## 4. Pull and start

```bash
mkdir -p gee_confs
docker compose pull
docker compose up -d
```

The image is public (runtime only — no app source):

```text
ghcr.io/core-stack-org/core-stack-backend:latest
```

No `docker login` is required. On Apple Silicon a plain `docker pull` of that tag can fail with “no matching manifest for linux/arm64”; Compose already pins `linux/amd64`.

## 5. Wait for first start

The first `docker compose up` does extra work. Later starts reuse Docker volumes and skip most of it.

1. **Admin-boundary data** (~8 GB) downloads into the `core_stack_data` volume. This is the slow step.
2. GeoServer comes up and workspaces/styles are created.
3. Django runs migrations, loads seed data, and starts on port 8000.

Watch progress:

```bash
docker compose ps
docker compose logs -f data-download backend
```

GeoServer can take a few minutes. Seed load can also take several minutes. Local-compute layer downloads only run when `DOWNLOAD_LOCAL_COMPUTE_LAYERS` is set.

When Django is ready you will see:

```text
Starting development server at http://0.0.0.0:8000/
Django is ready. Superuser password is test_change_me
```

The superuser name is `test_user_` plus four digits. Find it with:

```bash
docker compose logs backend | grep -E 'created\||updated\|'
```

Change that password after first login. Admin: http://localhost:8000/admin/

### Create your own superuser

The `test_user_XXXX` account is only for first login. Create a named admin when Django is running:

```bash
docker compose exec -it backend python manage.py createsuperuser --skip-checks
```

You will be prompted for username, email, and password. Log in at http://localhost:8000/admin/ with that account.

To reset the installer test user’s password back to `test_change_me`, recreate the backend container (`docker compose up -d --force-recreate backend`). First start always resets that test user.

## 6. Check that it is running

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/admin/login/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/geoserver/web/
```

Expect `200` from Django and `200` or `302` from GeoServer.

## 7. Add the GEE account in Django admin

1. Open [http://localhost:8000/admin/gee_computing/geeaccount/add/](http://localhost:8000/admin/gee_computing/geeaccount/add/).
2. **Name:** GEE project id (same value as `GEE_STORAGE_PROJECT`).
3. **Service account email:** `client_email` from the JSON.
4. **Credentials file:** upload the same service-account JSON.
5. Save. Note the numeric id in the change URL (`/admin/gee_computing/geeaccount/1/change/` → `gee_account_id` is `1`).

Screenshots and installer-side import: [Google Earth Engine](integrations/google-earth-engine.md#option-b-create-the-geeaccount-in-django-admin).

## 8. Point compute code at the Docker data volume

Downloads live on the volume at `/var/tmp/core-stack-data/admin-boundary`. The admin-boundary task still reads `data/admin-boundary/...` under `/app`. Link them once:

```bash
docker compose exec backend mkdir -p /app/data
docker compose exec backend ln -sfn /var/tmp/core-stack-data/admin-boundary /app/data/admin-boundary
```

`/app` is the bind-mounted checkout, so the symlink is created on the host as `data/admin-boundary` and survives container recreate.

## 9. Run the admin-boundary local compute API

Computing APIs use **JWT bearer tokens**, not the Django admin session. Base URL: `http://127.0.0.1:8000`.

This is `POST /api/v1/generate_block_layer/`. It clips the tehsil from the admin-boundary geojson, writes a local shapefile, uploads it to GEE via GCS, and publishes it to GeoServer workspace `panchayat_boundaries`.

Because Celery is eager, the HTTP call **blocks until the job finishes**.

### 9.1 Log in (JWT)

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}'
```

Use `test_user_XXXX` / `test_change_me` or the superuser you created. Copy `access` from the JSON.

### 9.2 Get `gee_account_id`

```bash
curl -s http://127.0.0.1:8000/api/v1/geeaccounts/ \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Use the numeric `id`. If the list is empty, complete [step 7](#7-add-the-gee-account-in-django-admin).

### 9.3 Generate the block layer

Use a tehsil that exists in `admin-boundary/input/<state>/<district>.geojson` (the API lowercases names). Example that has been run on this stack: Rajasthan / Bhilwara / Mandalgarh.

```bash
curl -s http://127.0.0.1:8000/api/v1/generate_block_layer/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{
    "state": "Rajasthan",
    "district": "Bhilwara",
    "block": "Mandalgarh",
    "gee_account_id": 1
  }'
```

Success body:

```json
{"Success": "Successfully initiated"}
```

Watch the task:

```bash
docker compose logs -f backend
```

Useful log lines:

```text
Inside generate_block_layer API.
sync_admin_boundry_to_geoserver
Exists: projects/<project>/assets/apps/mws/rajasthan/bhilwara/mandalgarh
Successfully made asset .../admin_boundary_bhilwara_mandalgarh public
The shapefile datastore created successfully!
sync to geoserver flag updated
```

If GEE init is skipped, you will see `GEEAccount with id=... was not found`. If the project env is empty, you will see `Failed: projects//assets/apps/mws/...`.

### 9.4 Where output lands

| Place | Path |
| --- | --- |
| Local JSON / shapefile | `DATA_DIR/admin-boundary/output/<state>/<district>_<block>/` (volume `/var/tmp/core-stack-data`) |
| GEE asset | `projects/<GEE_STORAGE_PROJECT>/assets/apps/mws/<state>/<district>/<block>/admin_boundary_<district>_<block>` |
| GeoServer layer | `panchayat_boundaries:<district>_<block>` |

Check GeoServer:

```bash
curl -s -u admin:geoserver \
  http://localhost:8080/geoserver/rest/layers/panchayat_boundaries:bhilwara_mandalgarh.json
```

Expect HTTP `200` and `"name":"bhilwara_mandalgarh"`.

### 9.5 Other computing APIs

The same JWT and `gee_account_id` work for other routes, for example LULC:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/lulc_for_tehsil/ \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "karnataka",
    "district": "raichur",
    "block": "devadurga",
    "start_year": 2022,
    "end_year": 2023,
    "gee_account_id": 1
  }'
```

More routes: [Computing API Endpoints](../pipelines/computing-endpoints.md) and [First computing API test-run](../pipelines/index.md#first-manual-run). Auth errors: [API Errors](../reference/api-errors.md).

### 9.6 Postman

Import from this docs repository:

| Asset | File |
| --- | --- |
| Collection | [core-stack-api.postman_collection.json](../assets/postman/core-stack-api.postman_collection.json) |
| Environment (Docker) | [core-stack-docker.postman_environment.json](../assets/postman/core-stack-docker.postman_environment.json) |

Run requests in order:

| Order | Request | Purpose |
| --- | --- | --- |
| 1 | **Auth — Login** | `POST /api/v1/auth/login/` → saves JWT `access` |
| 2 | **GEE — List accounts** | `GET /api/v1/geeaccounts/` → read `gee_account_id` |
| 3 | **Computing — LULC for tehsil** | Sample `POST` |

![Postman login example](../assets/postman-auth.png)

## Day-to-day commands

```bash
docker compose ps          # status
docker compose logs -f     # all services
docker compose stop        # stop, keep data
docker compose start       # start again
docker compose down        # remove containers, keep volumes
docker compose pull && docker compose up -d   # update the runtime image (not app code)
```

App edits on the host are what Django runs. Recreate the backend container if you change Compose mounts or `.env`:

```bash
docker compose up -d --force-recreate backend
```

Wipe the database, GeoServer data, and downloaded datasets (admin-boundary downloads again on next start):

```bash
docker compose down -v
```

## Optional settings

Create or extend `.env` next to `docker-compose.yml`:

```bash
BACKEND_PORT=8000
GEOSERVER_PORT=8080
POSTGRES_PORT=5432
POSTGRES_DB=corestack_db
POSTGRES_USER=corestack_admin
POSTGRES_PASSWORD=corestack@123
GEOSERVER_USERNAME=admin
GEOSERVER_PASSWORD=geoserver
GEOSERVER_URL=http://geoserver:8080/geoserver/
GCS_BUCKET_NAME=core_stack
GEE_STORAGE_PROJECT=ee-your-project
GEE_STORAGE_PROJECT_HELPER=ee-your-project
DOWNLOAD_LOCAL_COMPUTE_LAYERS=0
# Optional; defaults to this checkout (.)
# BACKEND_CODE_DIR=/path/to/other/checkout
# Optional; base layers download anonymously from the public-read bucket
# S3_ACCESS_KEY=
# S3_SECRET_KEY=
# S3_REGION=ap-south-1
# S3_BUCKET=corestack-datasets
```

`GEOSERVER_URL` defaults to the Compose GeoServer service. `GEE_STORAGE_PROJECT` defaults to `project_id` in `gee_confs/gee-service-account.json` when unset. `BACKEND_CODE_DIR` defaults to `.` (the backend repository).

Force a fresh admin-boundary download:

```bash
FORCE_DATA_DOWNLOAD=1 docker compose up -d
```

## Troubleshooting

**Port already in use**  
Stop whatever is bound to 8000, 8080, or 5432, or set `BACKEND_PORT` / `GEOSERVER_PORT` / `POSTGRES_PORT` in `.env`.

**`denied` or `unauthorized` pulling the image**  
The package should be public. Confirm you can open [ghcr.io/core-stack-org/core-stack-backend](https://github.com/core-stack-org/core-stack-backend/pkgs/container/core-stack-backend) without signing in. Then retry `docker compose pull`.

**`no matching manifest for linux/arm64`**  
Use Compose (`docker compose pull`), not a bare `docker pull` on Apple Silicon. Compose sets `platform: linux/amd64`.

**Backend keeps restarting**  
`docker compose logs backend`. Common first-run waits: GeoServer health, the 8 GB admin-boundary download, or seed load.

**`manage.py` not found / empty `/app`**  
The image has no app source. Start Compose from a clone of [core-stack-backend](https://github.com/core-stack-org/core-stack-backend) (or set `BACKEND_CODE_DIR`). Recreate after changing the mount:

```bash
docker compose up -d --force-recreate backend geoserver-init gee-config data-download
```

**`Skipping Earth Engine initialization: GEEAccount with id=1 was not found`**  
Complete [step 7](#7-add-the-gee-account-in-django-admin). Pass that row’s id as `gee_account_id`.

**`Failed: projects//assets/apps/mws/...`**  
`GEE_STORAGE_PROJECT` is empty. Set it in the Compose `.env` and recreate the backend.

**GCS upload fails**  
Confirm `GCS_BUCKET_NAME` is the real bucket, the service account can write to it, the bucket is in `us-central1`, and you recreated the backend after editing `.env`. See [Google Cloud Storage](integrations/gcs.md).

**`Census data not available` / missing geojson**  
Admin-boundary files are on the volume, not under `/app/data`. Run the symlink in [step 8](#8-point-compute-code-at-the-docker-data-volume).

**GeoServer has no `panchayat_boundaries:<district>_<block>`**  
The local shapefile can succeed while GEE/GCS fails; GeoServer publish runs after GEE. Fix GEE/GCS, then call the API again.

More setup fixes: [Setup Troubleshooting](setup-troubleshooting.md).
