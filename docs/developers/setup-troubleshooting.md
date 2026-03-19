# Troubleshooting Guide

Common issues when installing, starting, or testing the current CoRE Stack backend.

---

## Install Fails Early

### `conda: command not found`

The installer expects Miniconda at the configured location in [installation/install.sh](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/install.sh#L7-L24).

Try:

```bash
source "$HOME/miniconda3/etc/profile.d/conda.sh"
conda activate corestack-backend
```

### PostgreSQL connection errors

```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Check that the configured database and user from `install.sh` exist.

### RabbitMQ is missing

Celery-backed compute flows need RabbitMQ according to the backend installation guide.

```bash
sudo apt install -y rabbitmq-server
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

---

## Django Starts, But the API Looks Wrong

### Swagger is not loading

Confirm the route is wired in [nrm_app/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/nrm_app/urls.py#L56-L64), then verify the server is actually running:

```bash
python manage.py runserver 127.0.0.1:8000
```

Open:

- [http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)

### You are calling stale route names

The current auth-free geography routes are:

- `GET /api/v1/get_states/`
- `GET /api/v1/get_districts/<state_id>/`
- `GET /api/v1/get_blocks/<district_id>/`
- `GET /api/v1/proposed_blocks/`

They are implemented in [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L79).

---

## Auth Errors

### `401 Unauthorized` on public-data APIs

The `public_api` routes use `X-API-Key`, not `Authorization: Bearer YOUR_API_KEY`.

Source:

- [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L143-L161)

Use:

```bash
curl \
  -H "X-API-Key: YOUR_API_KEY" \
  "http://127.0.0.1:8000/api/v1/get_generated_layer_urls/?state=karnataka&district=raichur&tehsil=devadurga"
```

### JWT route confusion

If a route expects JWT, the decorator checks:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Source:

- [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L163-L173)

---

## Celery or Compute Problems

### Worker will not start

```bash
conda activate corestack-backend
cd /var/www/data/corestack
python manage.py check
celery -A nrm_app worker -l info -Q nrm
```

### Compute call returns success, but no final layer appears

Many compute handlers only submit background work. Check:

1. the Celery worker logs
2. GeoServer connectivity
3. any environment credentials needed by that pipeline

Relevant code:

- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L76-L560)
- [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L58-L190)
- [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L30-L219)

---

## Data Is Missing

### States or blocks are empty

Populate the geographic tables:

```bash
python manage.py populate_state_soi
python manage.py populate_district_soi
python manage.py populate_tehsil_soi
```

### Generated layer URLs return nothing

That route depends on stored layer metadata and GeoServer-aware dataset records in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L56-L114). If it returns empty or 404:

- check that the location exists
- check that layers were actually generated
- check that metadata exists in the backend database

---

## See Also

- [First Manual API Run](first-manual-api-run.md)
- [Computing API Endpoints](../api/computing-endpoints.md)
- [System Architecture](system-architecture.md)
- [Installer](installer.md)
