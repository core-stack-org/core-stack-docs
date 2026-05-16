# STAC API Installation & Configuration Guide
Ubuntu 24.04 LTS

This guide installs:

- PostgreSQL
- PostGIS
- stac-fastapi (STAC API server)
- Uvicorn
- Systemd service
- Runs on port 8000

Final URL:
http://your-server-ip:8000

## Prerequisites

- Ubuntu 24.04 host with sudo access
- Python 3 and PostgreSQL access
- Domain name ready if reverse proxy + SSL is required

---

## 1. Install System Dependencies

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv \
postgresql postgresql-contrib \
postgis postgresql-15-postgis-3
```

---

## 2. Configure PostgreSQL + PostGIS

Switch to postgres user:

```bash
sudo -u postgres psql
```

Create database and user:

```sql
CREATE DATABASE stacdb;
CREATE USER stacuser WITH PASSWORD '<REPLACE_WITH_STRONG_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE stacdb TO stacuser;
\c stacdb
CREATE EXTENSION postgis;
\q
```

---

## 3. Create Python Virtual Environment

```bash
mkdir ~/stac-api
cd ~/stac-api

python3 -m venv venv
source venv/bin/activate
```

Upgrade pip:

```bash
pip install --upgrade pip
```

---

## 4. Install STAC API (`stac-fastapi`)

Install with PostgreSQL backend:

```bash
pip install stac-fastapi[postgres] uvicorn
```

---

## 5. Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add:

```
STAC_FASTAPI_TITLE=My STAC API
STAC_FASTAPI_DESCRIPTION=Production STAC API
STAC_FASTAPI_VERSION=1.0.0

POSTGRES_USER=stacuser
POSTGRES_PASS=<REPLACE_WITH_STRONG_PASSWORD>
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DBNAME=stacdb
```

Save file.

> Never keep production credentials in this repository. Store and retrieve them from your organization's secret manager.  
> See `credentials-and-secrets.md`.

---

## 6. Initialize Database

Run migrations:

```bash
stac-fastapi-pgstac migrate
```

---

## 7. Start STAC API

```bash
uvicorn stac_fastapi.api.app:app --host 0.0.0.0 --port 8000
```

Test in browser:

```
http://your-server-ip:8000
```

API docs:

```
http://your-server-ip:8000/docs
```

---

## 8. Run as systemd Service (Production)

Create service file:

```bash
sudo nano /etc/systemd/system/stac-api.service
```

Paste:

```ini
[Unit]
Description=STAC API Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/stac-api
ExecStart=/home/ubuntu/stac-api/venv/bin/uvicorn stac_fastapi.api.app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Reload systemd:

```bash
sudo systemctl daemon-reload
sudo systemctl enable stac-api
sudo systemctl start stac-api
```

Check status:

```bash
sudo systemctl status stac-api
```

---

## 9. Open Firewall (If Enabled)

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

---

## 10. Example STAC Search Request

POST request:

```
http://geoserver.core-stac.org:8000/search
```

Body:

```json
{
  "bbox": [72.5, 18.8, 73.5, 19.5],
  "datetime": "2023-01-01/2023-12-31",
  "limit": 5
}
```

---

## 11. Logs

Check service logs:

```bash
journalctl -u stac-api -f
```

---

## 12. Configure Apache Reverse Proxy

Create config:

```bash
sudo nano /etc/apache2/sites-available/stac-api.conf
```

Paste:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAdmin admin@your-domain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8000/
    ProxyPassReverse / http://127.0.0.1:8000/

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"

    ErrorLog ${APACHE_LOG_DIR}/stac_error.log
    CustomLog ${APACHE_LOG_DIR}/stac_access.log combined
</VirtualHost>
```

Enable site:

```bash
sudo a2ensite stac-api
sudo a2dissite 000-default
sudo systemctl reload apache2
```

---

## 13. Install SSL Certificate

```bash
sudo certbot --apache -d api.stac.core-stac.org
```

Choose redirect to HTTPS → YES

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Verify

```bash
sudo systemctl status stac-api
curl -I http://127.0.0.1:8000
curl -I https://api.stac.core-stac.org
```

Expected:
- `stac-api` service is `active (running)`
- local and public endpoints return HTTP response headers

## Troubleshooting

- Service fails to start: check `journalctl -u stac-api -f`.
- DB connection errors: validate Postgres credentials and extensions.
- `502/503` via Apache: verify `ProxyPass` target and service health.
- High memory usage: apply `os-memory-tuning.md` and reduce worker count.

---

## Related: OS Memory Tuning

For API performance issues caused by memory pressure (high RSS, OOM kills, swap thrashing), use:

- `os-memory-tuning.md`


