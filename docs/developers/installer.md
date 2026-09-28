---
title: Installer
description: Local setup for the CoRE Stack backend — native Linux installer or Docker Compose.
---

# Installer

Choose how you want to run the backend:

- **Native (Linux)** — this page. Uses the backend installer on Ubuntu or WSL2. It sets up Python, PostgreSQL, RabbitMQ, the runtime `.env`, migrations, seed data, optional Earth Engine credentials, admin-boundary data, and the built-in initialization check.
- **Docker** — [Docker installation](docker.md) in two parts: [Part 1 Airflow + sync](docker.md#part-1-with-airflow-sync) (setup, upload DAG, trigger, Graph, re-exec) or [Part 2 Celery + async](docker.md#part-2-without-airflow-async). Builds Compose from [installation/DOCKER.md](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/DOCKER.md) and bind-mounts the checkout onto `/app`.

Optional integrations (GEE, GCS, GeoServer) are Steps 4–6 below. Installer flags and troubleshooting are documented at the bottom of this page.

## Installation

The **Native** tab uses `installation/install.sh` in [core-stack-backend](https://github.com/core-stack-org/core-stack-backend). The **Docker** tab uses `docker compose` and does not run that installer.

| Step | What you do |
| --- | --- |
| 1 | Prerequisites |
| 2 | Clone the backend repository |
| 3 | Provision the runtime — native full install, or see the Docker tab |
| 4 | GEE service account JSON key (optional) |
| 5 | GCS bucket (optional) |
| 6 | GeoServer (optional) |
| 7 | Data paths in `nrm_app/.env` |
| 8 | Start the runtime |
| 9 | [Log in and invoke APIs](#step-9-log-in-and-invoke-apis) (shared below) |

=== "Native (Linux)"

    #### Step 1 — Prerequisites

    - Ubuntu or another Linux environment. On Windows, use WSL2.
    - `sudo` access, internet access, Git.
    - Enough disk space for dependencies and the admin-boundary dataset.

    ```bash
    sudo apt update
    sudo apt install -y git wget curl build-essential libpq-dev unzip
    ```

    #### Step 2 — Clone the backend repository

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    cd core-stack-backend
    ```

    #### Step 3 — Provision the runtime

    Run the full backend installer from the repo root:

    ```bash
    cd installation
    chmod +x install.sh
    ./install.sh
    ```

    This creates the conda env, PostgreSQL, RabbitMQ, `nrm_app/.env`, migrations, seed data, the installer test user (`superuser` step), and optional integrations if you pass flags (for example `--gee-json`).

    Review `nrm_app/.env` after the run. Do not create a competing repo-root `.env`.

    #### Step 4 — GEE service account JSON key

    Skip if you already passed `--gee-json` during Step 3.

    1. Create and download a [Google Cloud service account JSON key](integrations/google-earth-engine.md#step-1-configure-google-cloud-for-earth-engine) with Earth Engine access.
    2. Import it into the backend:

    ```bash
    bash installation/install.sh \
      --only gee_configuration \
      --gee-json /full/path/to/service-account.json
    ```

    #### Step 5 — GCS bucket

    Skip if you do not need GEE-backed raster publication yet.

    Create a bucket in `us-central1` and grant IAM to the **same** service account as Step 4. See [Google Cloud Storage — bucket setup](integrations/gcs.md#current-bucket-assumptions) and [Required IAM](integrations/gcs.md#required-iam-for-the-current-backend).

    ```bash
    bash installation/install.sh \
      --only gcs_bucket_configuration \
      --input gcs_bucket_name=your-gcs-bucket
    ```

    #### Step 6 — GeoServer

    Skip if GeoServer was configured during Step 3. Otherwise register your instance:

    ```bash
    bash installation/install.sh \
      --only initialisation_check \
      --input geoserver_url=https://host/geoserver \
      --input geoserver_username=admin \
      --input geoserver_password=your-password
    ```

    #### Step 7 — Data paths in `nrm_app/.env`

    The installer sets paths in `nrm_app/.env`. Confirm they match your layout:

    - **`DATA_DIR`** — source and working data used by pipelines (inputs to generate other layers).
    - **`EXCEL_DIR`** / **`EXCEL_PATH`** — exported spreadsheet outputs.

    On native Linux these usually sit under the backend tree (for example `$BACKEND_DIR/data/...`). Only edit `nrm_app/.env` if the installer defaults are wrong for your machine.

    #### Step 8 — Start the runtime

    From `core-stack-backend`, use two terminals.

    **Terminal 1 — Django:**

    ```bash
    conda activate corestackenv
    python manage.py runserver
    ```

    **Terminal 2 — Celery** (required for computing APIs):

    ```bash
    conda activate corestackenv
    celery -A nrm_app worker -l info -Q nrm
    ```

    **Access (native):**

    | Service | URL |
    | --- | --- |
    | API / docs | `http://127.0.0.1:8000/` |
    | Django admin | `http://127.0.0.1:8000/admin/` |

    Django admin can use the same installer test user as the API, or run `python manage.py createsuperuser` for a separate admin account.

=== "Docker"

    Builds the stack from the repo-root `docker-compose.yml` (see [installation/DOCKER.md](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/DOCKER.md)). Source is bind-mounted at `/app`. Full walkthrough: [Docker installation](docker.md).

    Docker install is **two parts** — [Part 1 Airflow + sync](docker.md#part-1-with-airflow-sync) (setup Airflow, upload DAG, trigger, full Graph, re-exec) or [Part 2 no Airflow + async](docker.md#part-2-without-airflow-async):

    | Part | `LAYER_GENERATION_SYNC_MODE` | Request `layer_generation_mode` |
    | --- | --- | --- |
    | Part 1 — With Airflow (sync) | `True` | `"sync"` |
    | Part 2 — Without Airflow (async, default) | `False` | `"async"` or omit |

    #### Step 1 — Prerequisites

    - [Docker](https://docs.docker.com/get-docker/) with Compose v2
    - About **20 GB** free disk (images plus the first-run admin-boundary download)
    - Ports **8000**, **8080**, and **5432** free on loopback
    - Git, to clone the backend repo

    #### Step 2 — Clone the backend repository

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    cd core-stack-backend
    ```

    #### Step 3 — Provision the runtime

    ```bash
    cp installation/docker/env.template nrm_app/.env
    chmod 600 nrm_app/.env
    ```

    Set `LAYER_GENERATION_SYNC_MODE` and replace passwords in that file. Then:

    ```bash
    docker compose --env-file nrm_app/.env up -d --build
    ```

    Watch first-start jobs:

    ```bash
    docker compose --env-file nrm_app/.env ps
    docker compose --env-file nrm_app/.env logs -f app-init database-init backend
    ```

    #### Step 4 — GEE service account JSON key

    Skip if you do not need Earth Engine. Copy the JSON under `CORESTACK_HOST_DATA_DIR/gee_confs/`, run `gee-config`, and add a `GEEAccount` in Django admin. Full steps: [Docker — GEE and GCS](docker.md#gee-and-gcs) and [Google Earth Engine](integrations/google-earth-engine.md).

    #### Step 5 — GCS bucket

    Skip if you do not need GEE-backed raster publication yet. Create a bucket in `us-central1`, set `GCS_BUCKET_NAME` in `nrm_app/.env`, recreate `gee-config` and `backend`. [Docker — GCS](docker.md#3-optional-google-cloud-storage).

    #### Step 6 — GeoServer

    Compose starts GeoServer and initializes workspaces/styles at http://localhost:8080/geoserver (`GEOSERVER_USERNAME` / `GEOSERVER_PASSWORD` from `nrm_app/.env`).

    #### Step 7 — Data paths

    App code is the host checkout at `/app`. Data, GEE JSON, and backups live under `CORESTACK_HOST_DATA_DIR` (repository root by default).

    #### Step 8 — Start the runtime

    `docker compose --env-file nrm_app/.env up -d --build` already starts Gunicorn and Celery. Confirm:

    ```bash
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/admin/login/
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/geoserver/web/
    ```

    **Access (Docker on host):**

    | Service | URL |
    | --- | --- |
    | API / docs | `http://127.0.0.1:8000/` |
    | Django admin | `http://127.0.0.1:8000/admin/` |
    | GeoServer admin | `http://127.0.0.1:8080/geoserver` |

    Create a Django admin if you did not set `DJANGO_SUPERUSER_*`:

    ```bash
    docker compose --env-file nrm_app/.env exec backend python manage.py createsuperuser
    ```

    Then finish **[Part 1 — Airflow setup, upload DAG, trigger, Graph, re-exec](docker.md#part-1-with-airflow-sync)** or stay on **[Part 2 — Celery async](docker.md#part-2-without-airflow-async)**.

    Day-to-day commands, backups, proxy, and troubleshooting: [Docker installation](docker.md).

### Step 9 — Log in and invoke APIs { #step-9-log-in-and-invoke-apis }

Same flow for **native** and **Docker**. Computing APIs use **JWT bearer tokens**, not the Django admin session. Both installs use `http://127.0.0.1:8000` as the API base URL.

**1. Test user**

Native: created by the `superuser` installer step. To recreate:

```bash
bash installation/install.sh --only superuser
```

Docker: created on first start. Find the username in `docker compose logs backend`.

Note the username `test_user_XXXX` and password `test_change_me`.

**2. Log in (JWT)**

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user_4272","password":"test_change_me"}'
```

The response includes `access` (use on API calls), `refresh`, and `user`.

**3. Get `gee_account_id`**

Most computing `POST` bodies need a `gee_account_id`. List configured Earth Engine accounts (requires a valid JWT from step 2):

```bash
curl -s http://127.0.0.1:8000/api/v1/geeaccounts/ \
  -H "Authorization: Bearer <access-token>"
```

Use the numeric `id` from the response. If the list is empty, complete Step 4 in the Native or Docker tab above, or see [Google Earth Engine](integrations/google-earth-engine.md).

**4. Call a computing API**

Native: keep **Django and Celery running** (Step 8). Docker: compute runs in-process in the backend container; no separate Celery worker.

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/lulc_for_tehsil/ \
  -H "Authorization: Bearer <access-token>" \
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

**5. Postman**

Import from this docs repository:

| Asset | File |
| --- | --- |
| Collection | [core-stack-api.postman_collection.json](../assets/postman/core-stack-api.postman_collection.json) |
| Environment (native) | [core-stack-local.postman_environment.json](../assets/postman/core-stack-local.postman_environment.json) |
| Environment (Docker) | [core-stack-docker.postman_environment.json](../assets/postman/core-stack-docker.postman_environment.json) |

Run requests in order:

| Order | Request | Purpose |
| --- | --- | --- |
| 1 | **Auth — Login** | `POST /api/v1/auth/login/` → saves JWT `access` |
| 2 | **GEE — List accounts** | `GET /api/v1/geeaccounts/` → read `gee_account_id` |
| 3 | **Computing — LULC for tehsil** | Sample `POST`; native needs Celery on queue `nrm` |

![Postman login example](../assets/postman-auth.png)

## Useful installer controls

```bash
# Show exact step names
bash installation/install.sh --list-steps

# Rebuild only nrm_app/.env
bash installation/install.sh --only env_file

# Rerun only backend validation
bash installation/install.sh --only initialisation_check

# Add Earth Engine credentials later
bash installation/install.sh \
  --only gee_configuration,initialisation_check \
  --gee-json /full/path/to/service-account.json

# Add GeoServer values later and validate
bash installation/install.sh \
  --only initialisation_check \
  --input geoserver_url=https://host/geoserver \
  --input geoserver_username=admin \
  --input geoserver_password=your-password

# Rerun the public API smoke test
bash installation/install.sh \
  --only public_api_check \
  --input public_api_key=your-public-api-key
```

Use `--only` for the smallest safe rerun. Use `--from STEP` when you deliberately want to rerun a step and everything after it.

## Optional inputs

The installer currently accepts:

- `gee_json`
- `public_api_key`
- `public_api_base_url`
- `geoserver_url`
- `geoserver_username`
- `geoserver_password`

`--gee-json PATH` is a shortcut for `--input gee_json=PATH`.

## After install

1. Read the [Backend Code Map](backend-code-map.md).
2. Complete [Step 9 — Log in and invoke APIs](#step-9-log-in-and-invoke-apis) if you have not already.
3. For integration deep-dives: [Integrations](integrations/index.md) (GEE, GCS, GeoServer).
4. Use [Troubleshooting](setup-troubleshooting.md) when the installer or runtime names a failing step. Docker Compose issues are on [Docker installation](docker.md#troubleshooting).
