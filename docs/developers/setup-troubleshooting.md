---
title: Setup Troubleshooting
description: Fix common Docker installation, runtime, GEE, GCS, GeoServer, API, and Celery issues.
---

# Setup Troubleshooting

Use this page when a Docker install, the API, or a Celery worker names a specific failure. Install steps stay on [Install CoRE Stack](installer.md). Compose detail stays on [Run with Docker](docker.md).

Run every Compose command from the `core-stack-backend` folder, with `--env-file nrm_app/.env`.

## Install problems

| Symptom | Fix |
| --- | --- |
| `docker: command not found` | Install Docker, then open a new terminal. See [Install](installer.md#1-install-docker). |
| `permission denied` on `docker` | On Linux, add your user to the `docker` group and open a new terminal. On macOS or Windows, start Docker Desktop. |
| Port already in use | Stop whatever is bound to 8000, 8080, or 5432, or set `BACKEND_PORT`, `GEOSERVER_PORT`, or `POSTGRES_PORT` in `nrm_app/.env` |
| `nrm_app/.env` missing | Copy it again: `cp installation/docker/env.template nrm_app/.env` |
| Backend keeps restarting | `docker compose --env-file nrm_app/.env logs backend`. The first start waits on GeoServer health, the admin-boundary download, and seed data |
| Admin-boundary download failed | Run `docker compose --env-file nrm_app/.env up -d --build` again. The download resumes |

A one-time job that shows an exit code other than `0` failed. Read its log:

```bash
docker compose --env-file nrm_app/.env ps -a
docker compose --env-file nrm_app/.env logs <service>
```

## Runtime

If the API will not answer, confirm `backend` is `Up`, then read its log:

```bash
docker compose --env-file nrm_app/.env ps
docker compose --env-file nrm_app/.env logs backend
```

Look first for missing values in `nrm_app/.env` and for database errors.

Celery workers start with the stack. If a computing API returns `initiated` and nothing else happens:

```bash
docker compose --env-file nrm_app/.env logs -f celery-nrm
```

`LAYER_GENERATION_SYNC_MODE=False` (the default) means the API queues the job and returns immediately. Set `LAYER_GENERATION_SYNC_MODE=True`, or pass `"layer_generation_mode": "sync"`, when the HTTP call must wait. See [Docker installation — two ways](docker.md#two-methods-airflow--sync-or-no-airflow--async).

After you change `nrm_app/.env`:

```bash
docker compose --env-file nrm_app/.env up -d --force-recreate
```

## GEE and GCS

A real Earth Engine run needs a `GEEAccount` in the database and `GEE_DEFAULT_ACCOUNT_ID` in `nrm_app/.env`. Some raster publication paths also export through the configured GCS bucket before GeoServer sees the file.

Upload the service-account JSON in Django admin at `/admin/gee_computing/geeaccount/add/`, set `GEE_DEFAULT_ACCOUNT_ID` to that row’s id, then recreate the stack. Steps: [Google Earth Engine](docker.md#gee-and-gcs).

| Symptom | Fix |
| --- | --- |
| `GEEAccount with id=N was not found` | Add the JSON in Django admin and pass that row’s id as `gee_account_id` |
| `Failed: projects//assets/apps/mws/...` | `GEE_STORAGE_PROJECT` is empty. Set it in `nrm_app/.env` with `GCS_BUCKET_NAME`, then recreate the backend |
| GEE works but GCS upload fails | Grant the same service account access to the bucket. See [Google Cloud Storage](integrations/gcs.md) |

## GeoServer

Docker starts GeoServer at [http://127.0.0.1:8080/geoserver](http://127.0.0.1:8080/geoserver). Failures show up during publication, layer listing, or generated layer URL checks.

Check:

- `GEOSERVER_URL` is the GeoServer base, such as `http://geoserver:8080/geoserver` inside Compose, not a frontend URL
- username and password match `nrm_app/.env`
- the workspace exists or can be created
- the style name exists when the pipeline publishes a style
- `geoserver` is `Up` in `docker compose ps`

## API issues

| Symptom | Fix |
| --- | --- |
| `401 Unauthorized` on public APIs | Send `X-API-Key` and verify the key is active |
| JWT and API-key confusion | Use public API keys for public-data APIs. Use the JWT from `/api/v1/auth/login/` where the computing API requires it |
| Generated layer URL returns nothing | Check that the layer metadata row exists and `is_sync_to_geoserver=True` |
| API returns fast but no layer appears | Inspect `celery-nrm` logs and the Earth Engine task status |
| Airflow DAG skips STAC | The DAG needs a sync response. Set `LAYER_GENERATION_SYNC_MODE=True` or `"layer_generation_mode": "sync"` |

More first-run cases: [Docker troubleshooting](docker.md#troubleshooting).

## Public API helper

The backend ships a small helper for public API checks. It reads credentials from command-line flags, environment variables, or an env file:

```bash
python installation/public_api_client.py smoke-test

python installation/public_api_client.py download \
  --state assam \
  --district cachar \
  --tehsil lakhipur
```

## When to stop debugging setup

If `backend` and `celery-nrm` are `Up`, you can log in, and one small compute API returns `initiated` or `completed`, move on to [Build Pipelines](../pipelines/index.md).

Wipe Postgres, GeoServer, and Redis volumes only when you mean to start over. Host files under `CORESTACK_HOST_DATA_DIR` stay:

```bash
docker compose --env-file nrm_app/.env down -v
```
