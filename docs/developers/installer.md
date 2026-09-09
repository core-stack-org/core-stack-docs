---
title: Installer
description: Local setup for the CoRE Stack backend — native Linux installer or Docker Compose.
---

# Installer

Choose how you want to run the backend:

- **Native (Linux)** — this page. Uses the backend installer on Ubuntu or WSL2. It sets up Python, PostgreSQL, RabbitMQ, the runtime `.env`, migrations, seed data, optional Earth Engine credentials, admin-boundary data, and the built-in initialization check.
- **Docker** — [Docker installation](docker.md). Pulls the published image and starts Postgres, GeoServer, and Django with Compose. No Conda, local Postgres, or GitHub password.

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

    Pull the published image and start Postgres, GeoServer, and Django. You do not need Conda, a local Postgres install, or a GitHub password. Full walkthrough: [Docker installation](docker.md).

    #### What you get

    | Service | URL | Login |
    | --- | --- | --- |
    | Django / API | http://localhost:8000 | Superuser `test_user_XXXX` / `test_change_me` |
    | Django admin | http://localhost:8000/admin/ | Same superuser |
    | GeoServer | http://localhost:8080/geoserver | `admin` / `geoserver` |

    Postgres listens on `localhost:5432` (`corestack_admin` / `corestack@123`, database `corestack_db`). Computing APIs run in-process; you do not start a separate Celery worker.

    #### Step 1 — Prerequisites

    - [Docker](https://docs.docker.com/get-docker/) with Compose v2 (`docker compose version`)
    - About **20 GB** free disk (images plus the first-run admin-boundary download, ~8 GB)
    - Ports **8000**, **8080**, and **5432** free
    - Git, to clone the backend repo (Compose mounts helper scripts from `installation/docker`)

    The backend and GeoServer images are **linux/amd64**. Docker Desktop on Apple Silicon runs them with emulation.

    #### Step 2 — Clone the backend repository

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    cd core-stack-backend
    ```

    You only need the repo for `docker-compose.yml` and `installation/docker/`. You do not build the backend image yourself.

    #### Step 3 — Provision the runtime

    Optional: mount a GEE service-account JSON if layer jobs will call Earth Engine.

    ```bash
    mkdir -p gee_confs
    cp /path/to/your-gee-service-account.json gee_confs/gee-service-account.json
    ```

    Pull and start:

    ```bash
    mkdir -p gee_confs
    docker compose pull
    docker compose up -d
    ```

    The image is public: `ghcr.io/core-stack-org/core-stack-backend:latest`. No `docker login` is required. On Apple Silicon use Compose, not a bare `docker pull` (Compose pins `linux/amd64`).

    The first start downloads admin-boundary data (~8 GB), creates GeoServer workspaces/styles, runs migrations, and loads seed data. Watch progress:

    ```bash
    docker compose ps
    docker compose logs -f backend
    ```

    When Django is ready:

    ```text
    Starting development server at http://0.0.0.0:8000/
    Django is ready. Superuser password is test_change_me
    ```

    The superuser name is `test_user_` plus four digits:

    ```bash
    docker compose logs backend | grep -E 'created\||updated\|'
    ```

    Change that password after first login.

    #### Step 4 — GEE service account JSON key

    Skip if you do not need Earth Engine. After Django is up, add the account at [http://localhost:8000/admin/gee_computing/geeaccount/add/](http://localhost:8000/admin/gee_computing/geeaccount/add/). Use the service-account email from the JSON you mounted in `gee_confs/`. Full GEE project steps: [Google Earth Engine](integrations/google-earth-engine.md).

    If you added the JSON after the first start:

    ```bash
    docker compose up -d --force-recreate backend
    ```

    #### Step 5 — GCS bucket

    Skip if you do not need GEE-backed raster publication yet. See [Google Cloud Storage — bucket setup](integrations/gcs.md#current-bucket-assumptions) and [Required IAM](integrations/gcs.md#required-iam-for-the-current-backend).

    #### Step 6 — GeoServer

    Compose starts GeoServer and initializes workspaces/styles. Default login is `admin` / `geoserver` at http://localhost:8080/geoserver. Nothing else to run.

    #### Step 7 — Data paths

    Data lives on the `core_stack_data` Docker volume (`DATA_DIR=/var/tmp/core-stack-data` inside the container). You do not edit `nrm_app/.env` on the host for the published image.

    #### Step 8 — Start the runtime

    `docker compose up -d` already starts Django. Confirm:

    ```bash
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/admin/login/
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/geoserver/web/
    ```

    Expect `200` from Django and `200` or `302` from GeoServer.

    **Access (Docker on host):**

    | Service | URL |
    | --- | --- |
    | API / docs | `http://127.0.0.1:8000/` |
    | Django admin | `http://127.0.0.1:8000/admin/` |
    | GeoServer admin | `http://127.0.0.1:8080/geoserver` |

    Day-to-day commands, optional ports/passwords, and troubleshooting: [Docker installation](docker.md).

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
