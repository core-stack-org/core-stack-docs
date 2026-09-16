---
title: Cluster Service Checklist
description: Acceptance checklist — code/models/data mounts, Airflow vs local, GHCR or Docker Hub, Google SSO, log levels, central Postgres, and output retention modes.
---

# Cluster Service Checklist

Acceptance checklist for every project that ships as a Docker service on the CoRE Stack cluster. Complete this page **before** asking for a cluster deploy.

Part of [Infra → Tower Services](../infra/tower-services/index.md). Read that page first for the **architecture diagram** and **shared terminology**.

This page is the **acceptance list** only. Procedures live in [Cluster Docker Services](cluster-docker-services.md). Use the same names: **`code/`**, **`models/`**, **`data/`**, **`AIRFLOW_API_BASE`**, **GHCR or Docker Hub**, **central Postgres**, **`outputs.yaml`**.

---

## How to use this page

Copy the boxes into the service GitHub issue or README. Tick an item only when the **Acceptance** line is true.

---

## 1. Store all relevant data and compute output in `data/` { #1-store-all-relevant-data-and-compute-output-in-data }

Bind-mount **three** host folders. Do not bake code, models, or outputs into the image. Same table as [runbook §2](cluster-docker-services.md#2-code-models-and-data-live-on-the-host-mount-do-not-copy).

| Host folder | Container path | Contents |
| --- | --- | --- |
| **`code/`** | `/app` | Git checkout. Update with `git pull` + restart. |
| **`models/`** | `/app/models` | Weights, checkpoints, `.pt` / `.onnx` / `.joblib`. |
| **`data/`** | `/app/data` | Inputs, caches, **all compute output**. |

- [ ] Compose (or `docker run`) mounts `code/`, `models/`, and `data/` separately; none of them is copied in the `Dockerfile`.
- [ ] Job outputs (rasters, vectors, STAC JSON, exports, temp working files) are written under `data/` only — not into `code/` or the container layer.
- [ ] Models live under `models/`, not under `data/` or the image.
- [ ] `.gitignore` excludes generated data and large weights; only small fixtures or empty placeholders are committed.
- [ ] README documents each host path and container path.

**Acceptance:** Restarting the container keeps models and compute results; `git pull` updates code without touching `data/` or `models/`.

---

## 2. Compute via Airflow if `AIRFLOW_API_BASE` is set, otherwise local { #2-compute-via-airflow-if-airflow_api_base-is-set-otherwise-local }

Do **not** use a `COMPUTE_MODE` flag. **`AIRFLOW_API_BASE`** is the switch (same table as [runbook §8](cluster-docker-services.md#8-compute-and-processing--always-via-airflow)).

| `AIRFLOW_API_BASE` in `.env` | Behaviour |
| --- | --- |
| **Set** (non-empty) | Trigger and poll Airflow (`/api/v1/dags/...`). |
| **Empty / unset** | **Local compute** in this container. |

- [ ] `.env.example` lists `AIRFLOW_API_BASE` with a comment: leave empty for local compute.
- [ ] Backend reads that variable at runtime; empty means local, no Airflow client calls.
- [ ] When set: same-origin proxy so the browser never talks to Airflow; `AIRFLOW_DAG_ID` and worker callback URL (`CORESTACK_API_BASE` or equivalent) are also documented.
- [ ] Local path does not require an Airflow host.

**Acceptance:** The same image runs local jobs on a laptop (URL unset) and Airflow jobs on the cluster (URL set) by changing `.env` only.

---

## 3. Docker image pushed to GHCR **or** Docker Hub

The image must be in a registry others can pull. Use **GitHub Container Registry** (`ghcr.io/...`) or **Docker Hub** (`docker.io/...`).

- [ ] `Dockerfile` is **deps-only**; `code/`, `models/`, and `data/` are mounted at runtime ([runbook §2](cluster-docker-services.md#2-code-models-and-data-live-on-the-host-mount-do-not-copy)).
- [ ] Image is tagged with a version (and optionally `latest`).
- [ ] Image is **pushed** to `ghcr.io/<org>/<name>:<tag>` **or** `<dockerhub-user>/<name>:<tag>`.
- [ ] README has the exact `docker pull` line.

**Acceptance:** A clean host can `docker pull` and start the service without building from source.

---

## 4. Google SSO is implemented

Users sign in with **Google Single Sign-On**. Protected APIs and compute triggers require a valid Google session/token.

- [ ] Google SSO (OAuth / Google Identity) is implemented on the frontend and validated on the backend.
- [ ] Client id/secret (and redirect URIs) come from **env**, not source.
- [ ] Unauthenticated users cannot start compute or mutate data.
- [ ] `.env.example` lists `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (or the names you use), no real secrets.

GEE service-account keys are separate from SSO — see [Cluster Docker Services §1](cluster-docker-services.md#1-no-hardcoded-configuration).

**Acceptance:** Compute and write APIs reject requests without Google SSO; credentials are not in git.

---

## 5. Logging enabled; logs mounted from `data/logs/<application_name>`

Every container writes application logs. The log directory is a bind-mount from the host:

```text
data/logs/<application_name>/
```

Example: service `corestack-lulc` → `data/logs/corestack-lulc/`.

API / application logs must support **three levels**, selected from env (`LOG_LEVEL`):

| `LOG_LEVEL` | What is written |
| --- | --- |
| `debug` | Verbose: request/response traces, job params, Airflow poll, filesystem paths. Development and incident debug only. |
| `info` | Default: start-up, auth success/fail (no secrets), compute trigger, job start/complete, DAG id / run id. |
| `error` | Failures only: exceptions, failed jobs, Airflow `failed`, SSO/config errors. |

- [ ] Logging is enabled in the process that runs in the container (file and/or stdout).
- [ ] Compose mounts `./data/logs/<application_name>` into the container log path.
- [ ] Log files land under that directory (not only inside the ephemeral container FS).
- [ ] `.env.example` lists `LOG_LEVEL=info` with allowed values `debug` \| `info` \| `error`.
- [ ] No tokens, passwords, or Google client secrets in any level.
- [ ] README shows the host path and how to tail (`tail -f data/logs/<application_name>/...` and `docker compose logs -f`).

**Acceptance:** After a container recreate, logs remain under `data/logs/<application_name>/`. Changing `LOG_LEVEL` switches granularity without a code change.

---

## 6. Backend and frontend in the **same** Docker — no separate frontend container

One image, one container, one port. Do **not** run a second Docker service for the UI (no separate Nginx/SPA container).

- [ ] A single Compose service (or `docker run`) serves backend **and** frontend.
- [ ] The backend serves the built UI (same origin), or both processes run in that one container.
- [ ] There is no `frontend:` service in Compose.

**Acceptance:** `docker compose up` starts one app container; the browser talks only to that host:port.

---

## 7. Frontend API base URL from `.env`, not hardcoded

The backend API URL the frontend calls must come from environment config. No `localhost:8000`, production hostname, or path prefix committed in JS/TS.

- [ ] `.env.example` has the API base (`API_BASE_URL`, `VITE_API_BASE_URL`, `REACT_APP_API_URL`, or equivalent).
- [ ] All frontend `fetch` / axios calls use that value.
- [ ] Changing `.env` retargets the UI without editing source (rebuild the UI only if the framework inlines env at build time — document that).
- [ ] Default is a relative base (`/` or `/api`) so the same-container deploy works.

**Acceptance:** Pointing the UI at another backend is an env change, not a code edit.

---

## 8. Architecture diagram — how compute is triggered and from where

Every project README (or `docs/architecture.md`) includes a diagram of **how compute is triggered and from where**. The cluster-wide picture is on [Tower Services](../infra/tower-services/index.md#architecture) — reuse those terms.

Must show:

- Browser → **frontend Docker**
- **`AIRFLOW_API_BASE` set** → **Airflow–STACD Docker** (trigger + poll); **empty** → **local compute**
- On **success**, output written to **`data/`**
- **FileBrowser** over `data/` for view / download
- Mounts: `code/`, `models/`, `data/`
- `data/logs/<application_name>/` for logs
- Central Postgres if the service uses a database (§9)
- Output retention mode(s) (§10)
- External systems if used (GEE, GeoServer, object storage)

Mermaid in the README is enough:

```mermaid
flowchart TD
  Browser[Browser] --> FE[Frontend Docker]
  FE -->|AIRFLOW_API_BASE set| AF[Airflow-STACD Docker]
  FE -->|AIRFLOW_API_BASE empty| Local[Local compute]
  AF -->|success| Data[(data/)]
  Local -->|success| Data
  Data --> FB[FileBrowser UI]
```

**Acceptance:** A new operator can see, from the diagram alone, whether a UI action runs locally or via Airflow, where files and logs land, and how outputs are retained.

---

## 9. Database — Postgres on the central server

If the service needs a database, **do not** run a per-project Postgres (or SQLite file) in the application container for cluster deploys.

Use **PostgreSQL** on the **central Postgres** instance on the cluster host. Persist state through a **connection string** in env; the server DBA provisions the database/role.

- [ ] Cluster deploys use Postgres only (no SQLite as the production store).
- [ ] `.env.example` has a connection string, for example:
  ```bash
  DATABASE_URL=postgresql://USER:PASSWORD@POSTGRES_HOST:5432/DBNAME
  ```
  Split vars (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`) are fine if the app prefers them — document one style.
- [ ] The host in that string is the **central Postgres** on the server (Docker network DNS or host IP), not `postgres` from a sidecar Compose file unless that sidecar **is** the shared instance.
- [ ] No database files under the image; schema migrations run against the shared server.
- [ ] README states database name, who owns the role, and how to request access.

If the service has **no** database, tick N/A in the sign-off table and skip this item.

**Acceptance:** Recreating the app container does not wipe application data; rows live in central Postgres. Credentials are only in `.env`.

---

## 10. Output retention — public, private-persistent, or delete

Each project must declare what happens to **compute outputs** under `data/`. A **data service on the host** enforces the policy. Project teams do not invent ad-hoc cleanup; they **publish the policy in a standard file** the host service reads.

Three modes:

| Mode | Meaning |
| --- | --- |
| **public** | Outputs may be published (catalog, GeoServer, open download). Host data service treats them as shareable. |
| **private_persistent** | Keep on the workstation/cluster disk; **not** made public. Survives job and container restarts. |
| **delete** | Remove after a stated duration (`ttl_days`). Host data service zaps expired paths. |

Standard publish path — commit `outputs.yaml` at the repo root (or `deploy/outputs.yaml`). One entry per output tree:

```yaml
# outputs.yaml — read by the host data service
application: corestack-lulc
outputs:
  - path: data/results/
    mode: public                 # public | private_persistent | delete
    ttl_days: null
    description: Final LULC rasters and STAC items
  - path: data/work/
    mode: private_persistent
    ttl_days: null
    description: Intermediate tiles kept on the workstation
  - path: data/scratch/
    mode: delete
    ttl_days: 7
    description: Temp files; host data service deletes after 7 days
```

Rules:

- [ ] Every output path under `data/` is listed; uncovered paths are not allowed on the cluster.
- [ ] `mode` is one of `public`, `private_persistent`, `delete`.
- [ ] `delete` **requires** `ttl_days` (integer ≥ 1).
- [ ] README points at `outputs.yaml` and restates the modes in one paragraph.
- [ ] Architecture diagram (§8) mentions the host data service.

**Acceptance:** An operator (or the host data service) can read `outputs.yaml` and know, for each folder, whether to publish, keep private, or delete after N days.

---

## Sign-off

| # | Item | Owner | Done |
| --- | --- | --- | --- |
| 1 | Mount `code/`, `models/`, `data/`; compute output in `data/` | | |
| 2 | `AIRFLOW_API_BASE` set → Airflow; empty → local compute | | |
| 3 | Image pushed to GHCR or Docker Hub | | |
| 4 | Google SSO | | |
| 5 | Logs under `data/logs/<application_name>/`; `LOG_LEVEL` debug/info/error | | |
| 6 | Frontend + backend in one Docker | | |
| 7 | Frontend API base URL from `.env` | | |
| 8 | Architecture diagram (compute trigger + from where) | | |
| 9 | Postgres via connection string to central server (or N/A) | | |
| 10 | `outputs.yaml` — public / private_persistent / delete | | |

Service: _______________ Date: _______________ Reviewer: _______________
