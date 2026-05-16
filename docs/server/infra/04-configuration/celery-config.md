# Celery Setup Guide (Conda + systemd + Flower)

This guide explains how to run Celery workers in production with:

- RabbitMQ broker
- systemd services for queue workers
- dynamic per-queue concurrency
- Flower monitoring

## Prerequisites

- Conda environment `corestack-backend`
- RabbitMQ installed and running
- Django app configured with Celery integration (`nrm_app/celery.py`)

## Installer Boundary (`install.sh`)

The backend installer prepares core dependencies (Conda/PostgreSQL/RabbitMQ/.env and app bootstrap), but queue topology and production worker policy are still operator-managed.

`install.sh` handles:
- RabbitMQ installation + service start
- backend environment/bootstrap needed for Celery to run

`install.sh` does not fully handle:
- queue-specific `systemd` service instances (`celery@<queue>:<concurrency>`)
- final queue list and per-queue concurrency policy
- Flower production auth/port exposure decisions

---

## 1. Install Dependencies

```bash
conda activate corestack-backend
pip install celery flower
```

## 2. Install and Start RabbitMQ

```bash
sudo apt update
sudo apt install rabbitmq-server
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

## 3. Celery App Configuration

Ensure `nrm_app/celery.py` exists:

```python
import os
from celery import Celery
from nrm_app.settings import INSTALLED_APPS

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nrm_app.settings")
app = Celery("nrm_app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(INSTALLED_APPS)
```

## 4. Manual Worker Test

```bash
cd ~/cfpt/core-stack-backend/
conda activate corestack-backend
celery -A nrm_app worker --loglevel=info -Q nrm
```

If manual execution works, systemd setup usually works as well.

## 5. Create Logs Directory

```bash
sudo mkdir -p /var/log/celery
sudo chown -R root:adm /var/log/celery
sudo chmod -R 775 /var/log/celery
```

## 6. Create Queue Worker Service Template

Create `/etc/systemd/system/celery@.service`:

```ini
[Unit]
Description=Celery Worker for %I queue (dynamic concurrency)
After=network.target

[Service]
Type=simple
User=root
Group=adm
WorkingDirectory=/home/ubuntu/cfpt/core-stack-backend/
ExecStart=/bin/bash -c '\
  I="%I"; \
  QUEUE="${I%%:*}"; \
  CONC="${I##*:}"; \
  exec /home/ubuntu/miniconda3/envs/corestack-backend/bin/celery \
      -A nrm_app worker \
      -Q "$QUEUE" \
      -c "$CONC" \
      -n worker_"$QUEUE"@$(hostname) \
      -l info \
'
Restart=always

[Install]
WantedBy=multi-user.target
```

Reload:

```bash
sudo systemctl daemon-reload
```

## 7. Queue Configuration

| Queue | Purpose | Command |
|---|---|---|
| `nrm` | Layer generation tasks | `sudo systemctl restart celery@nrm:30` |
| `whatsapp` | WhatsApp bot tasks | `sudo systemctl restart celery@whatsapp:5` |
| `waterbody` | Waterbody dashboard tasks | `sudo systemctl restart celery@waterbody:5` |
| `celery` | Default queue | `sudo systemctl restart celery@celery:5` |

### What "reconfigured celery queues" means

When we say queues were "reconfigured", it means one or more of:

- changed queue names being consumed by workers
- changed per-queue concurrency (for example `nrm:30` -> `nrm:20`)
- added/removed queue worker instances
- moved tasks between queues in Celery routing
- restarted/reloaded the affected `systemd` units

This is an operations change and should be documented with timestamp + reason in deployment notes.

Status check:

```bash
sudo systemctl status celery@nrm:30
```

Logs:

```bash
journalctl -u celery@nrm:30 -f
```

## 8. Flower Monitoring

Manual test:

```bash
conda activate corestack-backend
celery -A nrm_app flower --port=5555
```

Service file `/etc/systemd/system/celery-flower.service`:

```ini
[Unit]
Description=Celery Flower Monitoring Service
After=network.target

[Service]
Type=simple
User=root
Group=adm
WorkingDirectory=/home/ubuntu/cfpt/core-stack-backend/
ExecStart=/home/ubuntu/miniconda3/envs/corestack-backend/bin/celery -A nrm_app flower --port=5555 --basic_auth=<user>:<password>
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable celery-flower
sudo systemctl start celery-flower
```

## 9. Useful Commands

```bash
sudo systemctl restart celery@<queue>:<concurrency>
sudo systemctl status celery@<queue>:<concurrency>
journalctl -u celery@<queue>:<concurrency> -f
```

## Verify

```bash
sudo systemctl status rabbitmq-server
sudo systemctl status celery@nrm:30
sudo systemctl status celery-flower
```

Expected:
- all services in `active (running)` state
- workers consuming from expected queues

## Troubleshooting

- Worker exits immediately: run the same `celery` command manually in shell.
- Tasks stuck in queue: verify queue name used by producer and worker.
- High memory usage: reduce queue concurrency and use `os-memory-tuning.md`.
- Flower not reachable: check port `5555` firewall/security group rules.

## Related: OS Memory Tuning

For deciding worker concurrency based on available RAM, swap size, swappiness values, and OOM troubleshooting:

- `os-memory-tuning.md`