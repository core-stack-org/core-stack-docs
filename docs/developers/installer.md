---
title: Installer
description: A short, linear local setup path for the CoRE Stack backend.
---

# Installer

Use the backend installer first. It sets up the Python environment, PostgreSQL, RabbitMQ, the runtime `.env`, migrations, seed data, optional Earth Engine credentials, admin-boundary data, and the built-in initialization check.

## Prerequisites

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

## Install

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

## Start Local Runtime

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

## What You Need Immediately

The installer can create enough configuration to boot the backend locally. Add external credentials when your work needs them.

| Goal | Configure now? | What matters |
| --- | --- | --- |
| Run Django locally | Usually no | installer-generated `nrm_app/.env` |
| Run GEE-backed pipelines | Yes | `GEEAccount` from a service-account JSON |
| Publish rasters through GeoServer | Yes | GEE, GCS bucket access, GeoServer credentials |
| Publish vectors through GeoServer | Usually yes | GeoServer credentials, valid workspace |
| Run public API tests | Only if testing that surface | `PUBLIC_API_X_API_KEY` |


For detailed guidance on setting up GEE, GCS, GeoServer [Integrations](integrations/index.md). For installation troubleshooting, find corresponding section in [Troubleshooting](setup-troubleshooting.md).

## Useful Installer Controls

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

## Optional Inputs

The installer currently accepts:

- `gee_json`
- `public_api_key`
- `public_api_base_url`
- `geoserver_url`
- `geoserver_username`
- `geoserver_password`

`--gee-json PATH` is a shortcut for `--input gee_json=PATH`.

## After Install

1. Read the [Backend Code Map](backend-code-map.md).
2. Run one request from [Build Pipelines](../pipelines/index.md#first-manual-run).
3. Use [Troubleshooting](setup-troubleshooting.md) only when the installer or runtime names a failing step.
