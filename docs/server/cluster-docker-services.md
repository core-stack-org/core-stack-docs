---
title: Cluster Docker Services
description: Short how-to for packaging a Tower Services app — mounts, Airflow switch, STACD YAML, STAC output, front page.
---

# Cluster Docker Services

Short **how-to** for putting **your** app on the Tower Services cluster. Anyone who wants to share a service can follow this — the live Drone / CEM / DIY LULC apps are examples, not the whole cluster. Start with [Tower Services](../infra/tower-services/index.md) if you do not know the setup or [why Airflow is here](../infra/tower-services/index.md#why-airflow). Tick boxes on the [Cluster Service Checklist](cluster-service-checklist.md) — this page does not repeat that list.

**In one pass:** env in `.env` (never in the image) → three host mounts → deps-only image on GHCR or Docker Hub → Airflow if `AIRFLOW_API_BASE` is set → return a STAC Item → front page + one demo video.

## 1. Config from env { #1-no-hardcoded-configuration }

Hostnames, passwords, Airflow URLs, and paths come from the environment. Ship `.env.example` with a comment on every variable. Do not commit a real `.env` or put secrets in the `Dockerfile`.

Empty **`AIRFLOW_API_BASE`** turns Airflow **off** (job runs in this container). Do not add `COMPUTE_MODE` or `AIRFLOW_BASE_API_URL`.

Credential **files** (GEE JSON) need both an env var **and** a path that exists in the container (usually because `code/` is mounted). Add a one-command auth check in the repo.

## 2. Mount code, models, and data { #2-code-models-and-data-live-on-the-host-mount-do-not-copy }

The image is **deps-only** (OS/Python packages + start command). The host keeps three folders:

| Host | In the container | What |
| --- | --- | --- |
| **`code/`** | `/app` | Git checkout. Update with `git pull` + restart. |
| **`models/`** | `/app/models` | Weights. |
| **`data/`** | `/app/data` | Inputs, caches, **all output**, logs at `data/logs/<app-name>/`. |

Rebuild the image only when requirements change. A laptop can mount `.` at `/app`; **cluster deploy** uses the three mounts.

## 3. README and VERSION

The repo README must be enough to install: purpose, Docker, clone layout, `.env`, `docker pull` with a **pinned tag**, run command, health check, upgrade, proxy notes.

Keep a root **`VERSION`** (or changelog). Tag images with the same number (`:1.2.0`), not only `:latest`.

## 5. Push a deps-only image { #5-ghcr-or-docker-hub--build-push-and-keep-updated }

Push to **GHCR** or **Docker Hub**. The Dockerfile copies **requirements only**, not application source:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY deploy/requirements-docker.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
EXPOSE 8000
CMD ["uvicorn", "backend:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t <registry>/<name>:1.0.0 .
docker push <registry>/<name>:1.0.0
```

Also: `/health`, `LOG_LEVEL` (`debug` \| `info` \| `error`), `--restart unless-stopped`, listen on `0.0.0.0`, document CPU/RAM/GPU. Avoid host ports that clash with GeoServer (8080) and the backend (8000).

## 7. Describe the job in STACD YAML { #7-writing-dags--stacd-yaml-workflow }

Do not hand-write Airflow Python. Upload **three** YAMLs in Airflow: **STACD → Initialize Workflow**. Full YAML guide: [STACD §11](https://github.com/SaharshLaud/STACD_framework/blob/dev/README.md#11-writing-your-own-yaml-workflow).

| File | What it is |
| --- | --- |
| DAG YAML | Steps, dependencies, trigger params |
| Algorithm Repo YAML | How each step runs — **API** (`url:`) or **Docker** (`image` + `module.function`) |
| Dataset Repo YAML | Inputs that no algorithm produces |

`url:` / the worker must reach **this** app from Airflow (`CORESTACK_API_BASE` — not `localhost` unless they share a network). Pin the Docker `image` tag. Docker-mode tasks print a STAC Item between `===RESULT_JSON_START===` / `===RESULT_JSON_END===`. Record the new **`dag_id`** as `AIRFLOW_DAG_ID`. Update later with STACD plugin pages, not by editing generated `.py`.

## 8. Start the job from your app { #8-compute-and-processing--always-via-airflow }

| `AIRFLOW_API_BASE` | What happens |
| --- | --- |
| **Set** | Your **backend** (not the browser) triggers Airflow and polls until `success` or `failed`. |
| **Empty** | Work runs in this container. Still write `data/` and return a STAC Item. |

Why the cluster prefers “set”: [Tower Services — Why we use Airflow](../infra/tower-services/index.md#why-airflow).

```bash
# start
curl -u "$AIRFLOW_USERNAME:$AIRFLOW_PASSWORD" -H "Content-Type: application/json" \
  -X POST "$AIRFLOW_API_BASE/dags/$AIRFLOW_DAG_ID/dagRuns" \
  -d '{"conf": {"param1": "value1"}}'
# poll until success or failed
curl -u "$AIRFLOW_USERNAME:$AIRFLOW_PASSWORD" \
  "$AIRFLOW_API_BASE/dags/$AIRFLOW_DAG_ID/dagRuns/$DAG_RUN_ID"
```

Env to document: `AIRFLOW_API_BASE`, `AIRFLOW_DAG_ID`, `AIRFLOW_USERNAME` / `AIRFLOW_PASSWORD` (or `AIRFLOW_TOKEN`), `CORESTACK_API_BASE`.

UI → **your** `/api/dag/run` and `/api/dag/status`. Never call Airflow from JavaScript (no CORS; credentials stay off the page). Enable Airflow Basic Auth if REST returns 401. Unpause the DAG before the first trigger.

Details: [STACD §9](https://github.com/SaharshLaud/STACD_framework/blob/dev/README.md#9-triggering-and-monitoring-airflow-dags-via-the-rest-api).

## 9. Return a STAC Item { #9-always-return-output-in-stac-format }

The deliverable is a **STAC 1.x Feature**, not a bare file path or GeoServer layer name. Shape and field names: [STAC Specs](../use-precomputed-data/stac-specs.md) and [stac.core-stack.org](https://stac.core-stack.org/).

Must have: `type` (`Feature`), `stac_version`, `id`, `geometry`, `bbox`, `collection`, `properties` (`title`, `description`, `datetime`, `start_datetime`, `end_datetime`, `keywords`), `links` (`root`, `collection`, `parent`), `assets.data` with a fetchable `href`. Vectors also need the [table extension](https://stac-extensions.github.io/table/v1.2.0/schema.json) and `table:columns` for **every** attribute. Add `style` and `thumbnail` assets when you can.

API-mode services may wrap the Item as `{ "status", "asset_id", "stac_items": [ … ] }` if STACD expects that envelope.

## 11. Front page and demo video { #11-front-page-and-demo-video }

The service URL (for example `/drone`) opens a **landing page** like [Drone](https://www.cse.iitd.ernet.in/act4dws5/drone/): what the project is, then login, then the working UI. On that same page: **one** short video that is both a project intro and a create → run → FileBrowser tutorial. The video is **reviewed and approved**. Same acceptance as [checklist §11](cluster-service-checklist.md#11-front-page-and-demo-video).

## Copy-this: Custom LULC { #worked-example-custom-lulc }

Working pattern: [salil-123/Project](https://github.com/salil-123/Project) and the [STACD LULC report](https://github.com/SaharshLaud/STACD_framework/blob/dev/report/custom_lulc_deployment_and_airflow_pipeline.md).

| Piece | Value |
| --- | --- |
| Image | `salil2003/corestack-lulc` (deps only) |
| DAG | `corestack_lulc` |
| Glue | `src/airflow_client.py` — trigger + poll |
| Work endpoint | `POST /api/export-asset` (what the DAG calls back) |
| YAMLs | `deploy/stacd/*.yaml` |

On a laptop you can mount `.` at `/app`. On the cluster use the three mounts in §2. Empty `AIRFLOW_API_BASE` turns the DAG path off. To add the same glue to another HTTP app: those six files + env, then `curl /api/health` → work endpoint → Airflow trigger.

## IIT Delhi proxy { #cluster-notes-iit-delhi-proxy }

If `docker pull` times out on campus, set the **Docker daemon** proxy. Do not put `registry-1.docker.io` or `auth.docker.io` in `NO_PROXY`. Same snippet: [Tower Services](../infra/tower-services/index.md#docker-pull-behind-the-iit-delhi-proxy).
