---
title: Setup Troubleshooting
description: Fix common local installation, runtime, GEE, GCS, GeoServer, API, and Celery issues.
---

# Setup Troubleshooting

Use this page when the installer, initialization check, Django server, or Celery worker names a specific failure. Keep the installer page clean; put the messy fixes here.

## Rerun The Smallest Step

```bash
# See available steps
bash installation/install.sh --list-steps

# Validation only
bash installation/install.sh --only initialisation_check

# Rebuild nrm_app/.env
bash installation/install.sh --only env_file

# Add GEE credentials later
bash installation/install.sh \
  --only gee_configuration,initialisation_check \
  --gee-json /full/path/to/service-account.json

# Add GeoServer values later
bash installation/install.sh \
  --only initialisation_check \
  --input geoserver_url=https://host/geoserver \
  --input geoserver_username=admin \
  --input geoserver_password=your-password

# Public API smoke test only
bash installation/install.sh --only public_api_check
```

Use `--only` when you know the failing step. Use `--from` only when you want a broader rerun.

## Install Problems

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `conda: command not found` | shell has not loaded Miniconda yet | open a new terminal or source your shell profile, then run `conda activate corestackenv` |
| PostgreSQL connection errors | service is down, user/db missing, or `.env` mismatch | check `sudo systemctl status postgresql`, then rerun `--only env_file,initialisation_check` if env values drifted |
| RabbitMQ or Celery cannot connect | RabbitMQ is not running | check `sudo systemctl status rabbitmq-server`; start it before the worker |
| `nrm_app/.env` missing | install stopped before env generation | rerun `bash installation/install.sh --only env_file` |
| old repo-root `.env` confusion | stale env file from earlier setup | keep the real runtime env at `nrm_app/.env` |
| Python dependency breakage | conda env is stale | rerun `bash installation/install.sh --only conda_env` |
| admin-boundary download failed | interrupted download or bad extracted layout | rerun `bash installation/install.sh --only admin_boundary_data,initialisation_check` |

## Validation Failures

| Check | What it means | What to do |
| --- | --- | --- |
| `jwt-auth` | no active Django user or token setup failed | create or activate a user, then rerun `initialisation_check` |
| `gee-probe` | `GEE_DEFAULT_ACCOUNT_ID` is missing or points to a bad `GEEAccount` | import a service-account JSON with `--gee-json` |
| `gcs-upload-probe` | service account cannot write to the configured GCS bucket | grant the service account bucket access and rerun validation |
| `geoserver-probe` | GeoServer URL or credentials are missing or invalid | set `GEOSERVER_URL`, `GEOSERVER_USERNAME`, and `GEOSERVER_PASSWORD` |
| `admin-boundary-compute` | sample admin boundary data is missing or invalid | rerun the admin-boundary data step |
| `first-computing-api` | the internal test could not trigger the sample API | check Django settings, Celery eager validation output, and admin-boundary artifacts |

## GEE And GCS

A real compute run usually needs both Earth Engine and GCS access:

- `GEEAccount` stores encrypted service-account JSON in the database.
- `GEE_DEFAULT_ACCOUNT_ID` points the backend to the default account.
- Some raster publication paths export through the configured GCS bucket before GeoServer sees the file.

Common fixes:

```bash
# Import or update the GEE account
bash installation/install.sh \
  --only gee_configuration,initialisation_check \
  --gee-json /full/path/to/service-account.json
```

If GEE works but GCS fails, check bucket permissions for the same service-account email. The integration notes are in [Google Cloud Storage](integrations/gcs.md).

## GeoServer

GeoServer failures normally show up during publication, layer listing, or generated layer URL checks.

Check:

- the URL includes the GeoServer base, not a frontend URL
- username and password are correct
- the workspace exists or can be created
- the style name exists when the pipeline publishes a style
- the backend can reach GeoServer from the same machine

For a local setup path, see [GeoServer](integrations/geoserver.md).

## Django Runtime

If the server will not start:

```bash
conda activate corestackenv
python manage.py check
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Look first for missing env values, database errors, and import errors from optional packages.

## Celery Runtime

Start the worker from the backend repo root:

```bash
conda activate corestackenv
celery -A nrm_app worker -l info -Q nrm
```

If tasks never start:

- confirm RabbitMQ is running
- confirm the worker uses queue `nrm`
- keep the Django server and Celery worker in separate terminals
- watch both logs while triggering an API

## API Issues

| Symptom | Fix |
| --- | --- |
| `401 Unauthorized` on public APIs | send `X-API-Key` and verify the key is active |
| JWT/API-key confusion | use public API keys for public-data APIs; use JWT only where the backend API requires it |
| generated layer URL returns nothing | check that the layer metadata row exists and `is_sync_to_geoserver=True` |
| API returns fast but no layer appears | inspect Celery logs and GEE task status |

## Public API Helper

The backend ships a small helper for public API checks:

```bash
python installation/public_api_client.py smoke-test

python installation/public_api_client.py download \
  --state assam \
  --district cachar \
  --tehsil lakhipur
```

It can read credentials from command-line flags, environment variables, or an env file. It does not require the full `corestackenv`.

## When To Stop Debugging Setup

If Django starts, Celery connects, `initialisation_check` passes or names only optional integrations, and one small compute API can be triggered, move on to [Build Pipelines](../pipelines/index.md). Do not keep rerunning the whole installer unless you are fixing installation itself.
