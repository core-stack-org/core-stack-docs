---
title: Installer
description: Install CoRE Stack locally, understand the installer behavior, and confirm the environment is ready for developer workflows.
---

# Installer

For fully integrated Core-Stack pipeline developments, the simplest pathway would be to install core-stack-backend Django app.

## Before You Run It

### Platform assumptions

- Linux is the main target
- Windows users should use WSL2

### Core packages

```bash
sudo apt update
sudo apt install -y git wget curl build-essential libpq-dev
```

---

## Review Installer Defaults

The installer script defines defaults for paths, environment, and database setup near the top of the file.

Defaults worth checking before you run it:

| Variable | Default |
|----------|---------|
| `MINICONDA_DIR` | `$HOME/miniconda3` |
| `CONDA_ENV_NAME` | `corestack-backend` |
| `BACKEND_DIR` | `/var/www/data/corestack` |
| `POSTGRES_USER` | `nrm` |
| `POSTGRES_DB` | `nrm` |
| `POSTGRES_PASSWORD` | `nrm@123` |

---

## Run The Installer

=== "Fresh clone"

    ```bash
    git clone https://github.com/core-stack-org/core-stack-backend.git
    cd core-stack-backend/installation
    chmod +x install.sh
    ./install.sh
    ```
=== "Existing checkout"

    ```bash
    cd /mnt/y/core-stack-org/core-stack-backend/installation
    chmod +x install.sh
    ./install.sh
    ```
---

## What The Installer Sets Up

Based on the current script, the installer takes care of most of the initial setup.

It also performs some integation verifications  as part of its own flow, so verification no longer needs its own separate docs page.

---

## What You Still Need To Review

### Check the generated `.env`

The installer generates:

```text
/var/www/data/corestack/nrm_app/.env
```

Review and complete the values that depend on your environment:

- `SECRET_KEY`
- `DEBUG`
- GeoServer credentials
- Earth Engine related credentials
- email or other integration secrets if your deployment needs them

### Create an admin user

```bash
source "$HOME/miniconda3/etc/profile.d/conda.sh"
conda activate corestack-backend
cd /var/www/data/corestack
python manage.py createsuperuser
```

---

## First Local Checks

Use these checks after the installer finishes:

```bash
python manage.py check
python manage.py runserver 127.0.0.1:8000
```

Then test:

```bash
curl http://127.0.0.1:8000/api/v1/get_states/
```

Open:

- `http://127.0.0.1:8000/swagger/`
- `http://127.0.0.1:8000/admin/`

If you plan to test async computing routes immediately, also start:

```bash
celery -A nrm_app worker -l info -Q nrm
```

---

## What To Do Next

If installation succeeded, do not jump straight into a fully integrated pipeline.

Move in this order:

1. trace one real request
2. understand the code map
3. run a pipeline locally
4. only then add integration layers

---

## Next Paths

- [First Manual API Run](first-manual-api-run.md)
- [Setup Troubleshooting](setup-troubleshooting.md)
- [Backend Code Map](backend-code-map.md)
- [Local Pipeline First](local-pipeline-first.md)
- [System Architecture](system-architecture.md)
