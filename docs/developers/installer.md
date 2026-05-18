---
title: Installer
description: Local setup for the CoRE Stack backend — native Linux installer or Docker.
---

# Installer

Choose how you want to run the backend:

- **Native (Linux)** — uses the backend installer on Ubuntu or WSL2. It sets up Python, PostgreSQL, RabbitMQ, the runtime `.env`, migrations, seed data, optional Earth Engine credentials, admin-boundary data, and the built-in initialization check.
- **Docker** — runs the application and GeoServer in containers. Best when you want a pre-built runtime without installing dependencies on the host.

Shared topics (integrations, troubleshooting, installer flags) apply to both paths and are documented after the installation tabs.

## Installation

=== "Native (Linux)"

    ### Prerequisites

    - Ubuntu or another Linux environment. On Windows, use WSL2.
    - `sudo` access.
    - Internet access.
    - Git.
    - Enough disk space for dependencies and the admin-boundary dataset.

    On a fresh machine, install the small base set first:

    ```bash
    sudo apt update
    sudo apt install -y git wget curl build-essential libpq-dev unzip
    ```

    ### Install

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    cd core-stack-backend/installation
    chmod +x install.sh
    ./install.sh
    ```

    The installer writes the runtime environment to:

    ```text
    nrm_app/.env
    ```

    Review that file after the run. Do not create a competing repo-root `.env`; the current backend expects `nrm_app/.env`.

    ### Start local runtime

    Use two terminals.

    Terminal 1:

    ```bash
    conda activate corestackenv
    python manage.py runserver
    ```

    Terminal 2, when you need async compute APIs:

    ```bash
    conda activate corestackenv
    celery -A nrm_app worker -l info -Q nrm
    ```

    Then open:

    - API docs: `http://127.0.0.1:8000/`
    - Django admin: `http://127.0.0.1:8000/admin/`

    For Django admin login, use the test account created by the installer if it is available. If you need your own admin user, run:

    ```bash
    python manage.py createsuperuser
    ```

    Then restart Django and Celery, and log in at `http://127.0.0.1:8000/admin/`.

=== "Docker"

    This guide walks through a full CoRE Stack environment using Docker. Follow each step in order — skipping or reordering steps may cause failures.

    **Host requirements:** Docker Engine, Git, and enough disk space for images and data.

    ### Step 1 — Pull latest Docker image

    Downloads the pre-built CoRE Stack Docker image from Docker Hub. The image contains the full application runtime (OS, dependencies, services) so you do not need to install them on the host.

    ```bash
    docker pull kapildadheechgv/core-stack-dev:latest
    ```

    ### Step 2 — Clone repository

    Clones the backend source so installation scripts, configuration, and application code are available on the host (and via the volume mount in Step 4).

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    ```

    ### Step 3 — Create Docker network

    Creates a dedicated bridge network (`corestack-network`) so the CoRE Stack and GeoServer containers can reach each other by name (for example `geoserver:8080`).

    ```bash
    docker network create corestack-network
    ```

    ### Step 4 — Run CoRE Stack container

    Starts the main application container in detached mode.

    - `--network corestack-network` — connects to the shared network from Step 3
    - `-p 9000:80` and `-p 9001:8000` — exposes the web server and API on the host
    - `-v ~/dev/docker:/core-stack-backend` — mounts a host directory into the container for code, config, and files such as the GEE JSON key

    Adjust the volume path (`~/dev/docker`) to a directory on your machine that should hold the mounted backend tree.

    ```bash
    docker run -dit \
      --name core-stack \
      --network corestack-network \
      -p 9000:80 \
      -p 9001:8000 \
      -v ~/dev/docker:/core-stack-backend \
      kapildadheechgv/core-stack-dev:latest
    ```

    ### Step 5 — Run GeoServer container

    Starts GeoServer, which CoRE Stack uses to serve and render map layers. It must share `corestack-network` so the backend can reach it at `http://geoserver:8080`.

    ```bash
    docker run -dit \
      --name geoserver \
      --network corestack-network \
      -p 8080:8080 \
      docker.osgeo.org/geoserver:2.28.0
    ```

    ### Step 6 — Copy GEE JSON into the container

    Copies your Google Earth Engine service account JSON from the host into the running CoRE Stack container. Required before GEE configuration in Step 13.

    Create a GEE service account and download its JSON key first — see [Google Earth Engine — configure Google Cloud](integrations/google-earth-engine.md#step-1-configure-google-cloud-for-earth-engine) (includes IAM and service account setup).

    Replace `your-gee-service-account.json` with your actual key filename:

    ```bash
    docker cp your-gee-service-account.json core-stack:/core-stack-backend/.
    ```

    ### Step 7 — Enter the container

    Opens an interactive shell inside the CoRE Stack container. Steps 8 onward run inside this environment.

    ```bash
    docker exec -it core-stack bash
    ```

    ### Step 8 — Start PostgreSQL

    Starts PostgreSQL inside the container. The database must be running before installation scripts execute migrations or seed data.

    ```bash
    sudo service postgresql start
    ```

    ### Step 9 — Generate environment file

    Creates the `.env` configuration (database credentials, API keys, paths, and related settings) without running the full installer.

    ```bash
    cd /core-stack-backend
    bash installation/install.sh --only env_file
    ```

    ### Step 10 — Configure GeoServer

    Registers the GeoServer instance with the backend using its URL, username, and password so CoRE Stack can manage workspaces and layers through the REST API.

    ```bash
    bash installation/install.sh --geoserver-config http://geoserver:8080/geoserver,admin,geoserver
    ```

    ### Step 11 — Set data directory paths

    Set the filesystem paths inside the container where CoRE Stack reads and writes local data. These paths are mapped to persistent storage on the host through the volume mount from Step 4.

    - **Source and working data** — files the backend needs to run pipelines and generate new outputs (for example boundary datasets, uploads, and other inputs under `DATA_DIR`).
    - **Exported outputs** — locations where pipelines and exports write finished results (for example Excel files under `EXCEL_DIR` and `EXCEL_PATH`).

    Add or update these values in the runtime environment file (for example `nrm_app/.env` after Step 9). Create each directory inside the container before starting the application.

    ```env
    # Root for source and working data used by pipelines
    DATA_DIR="/root/core-stack-data"

    # Exported Excel and similar pipeline outputs
    EXCEL_DIR="/root/core-stack-data/excel_files"
    EXCEL_PATH="/root/core-stack-data/excel_files"
    ```

    ### Step 12 — Configure GCS bucket

    Links the application to your Google Cloud Storage bucket for large geospatial assets and processed outputs.

    Create the bucket in `us-central1` and grant IAM to the same GEE service account — see [Google Cloud Storage — bucket setup](integrations/gcs.md#current-bucket-assumptions) and [Required IAM](integrations/gcs.md#required-iam-for-the-current-backend).

    Replace `your-gcs-bucket` with your bucket name:

    ```bash
    bash installation/install.sh --only gcs_bucket_configuration --input gcs_bucket_name=your-gcs-bucket
    ```

    ### Step 13 — Configure Google Earth Engine (GEE)

    Registers the service account JSON copied in Step 6 so the backend can compute asset on earth engine and store it as GEE asset.

    See [Google Earth Engine — import credentials](integrations/google-earth-engine.md#step-2-import-the-credentials-into-the-backend).

    Use the same filename you copied in Step 6:

    ```bash
    bash installation/install.sh \
      --only gee_configuration \
      --gee-json /core-stack-backend/your-gee-service-account.json
    ```

    ### Step 14 — Test login (Postman / API)

    Confirms the stack is running, the database is connected, and authentication works.

    Example test credentials (if created by your install/seed data):

    ```json
    {
      "username": "test_user_4272",
      "password": "test_change_me"
    }
    ```

    ### Access after Docker setup

    - Web (container port 80): `http://127.0.0.1:9000/`
    - API (container port 8000): `http://127.0.0.1:9001/`
    - GeoServer admin: `http://127.0.0.1:8080/geoserver`

## What you need immediately

The installer can create enough configuration to boot the backend locally. Add external credentials when your work needs them.

| Goal | Configure now? | What matters |
| --- | --- | --- |
| Run Django locally | Usually no | installer-generated `nrm_app/.env` |
| Run GEE-backed pipelines | Yes | [`GEEAccount`](integrations/google-earth-engine.md) from a service-account JSON |
| Publish rasters through GeoServer | Yes | [GEE](integrations/google-earth-engine.md), [GCS bucket + IAM](integrations/gcs.md), GeoServer credentials |
| Publish vectors through GeoServer | Usually yes | GeoServer credentials, valid workspace |
| Run public API tests | Only if testing that surface | `PUBLIC_API_X_API_KEY` |

For detailed guidance:

- [Google Earth Engine](integrations/google-earth-engine.md) — GCP project, Earth Engine registration, IAM, service account, and `GEEAccount` import
- [Google Cloud Storage](integrations/gcs.md) — bucket creation (`us-central1`), IAM bindings, and backend usage
- [GeoServer](integrations/geoserver.md)
- [Integrations overview](integrations/index.md)

For installation troubleshooting, see [Troubleshooting](setup-troubleshooting.md).

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
2. Run one request from [Build Pipelines](../pipelines/index.md#first-manual-run).
3. Use [Troubleshooting](setup-troubleshooting.md) only when the installer or runtime names a failing step.
