---
title: Server
description: Production deployment, SSH access, service configuration, OS tuning, and monitoring for CoRE Stack infrastructure.
---

# Server

Production infrastructure for CoRE Stack: deployment footprint, secure access, per-service runbooks, OS tuning, and monitoring. Scroll this page or use the table of contents — everything is in one place.

## Contents

- [Production deployment](#production-deployment)
- [AWS server access and roles](#aws-server-access)
- [Apache + mod_wsgi + SSL](#apache-mod_wsgi)
- [Celery + RabbitMQ + Flower](#celery)
- [GeoServer + Tomcat + SSL (8443)](#geoserver)
- [AWS Amplify (frontend hosting)](#amplify)
- [STAC API](#stac-api)
- [STAC UI and catalog](#stac-ui)
- [Credentials and secrets](#credentials-and-secrets)
- [Linux memory and swap tuning](#os-memory-tuning)
- [Nagios monitoring](#nagios-monitoring)

---

## Production deployment { #production-deployment }

### How to Use This Document

- Treat this as the source of truth for current production topology.
- Update fields immediately after infra changes (domain, app IDs, runtime, SSL, etc.).
- Pair this document with service-specific runbooks in `../04-configuration/`.

### CoreStack Backend

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/core-stack-backend |
| Environment | Python 3, Django |
| Deployed Location | AWS EC2 |
| Domain | geoserver.core-stack.org |
| GeoServer Port | 8443 |
| Virtual Environment | `corestack-backend` |
| Code Location | `/home/ubuntu/cfpt/corestack-backend` |
| Package Manager | conda (avoid direct `pip` installs in production) |
| Database Engine | PostgreSQL (same host) |
| Database Name | `corestack` |
| Web Server | Apache |
| SSL Authority | Let's Encrypt |
| SSL Renewal | Every 3 months |
| Deployment Type | Manual |

### Landscape Explorer (LE) and KYL

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/landscape-explorer |
| Environment | React |
| Deployed Location | AWS Amplify |
| Amplify App ID | `d2s4eeyazvtd2g` |
| Domain | explorer.core-stack.org |
| CI/CD Branch | `main` |
| Deployment Type | Automated (push to `main`) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |


### Dashboard

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/admin-dashboard |
| Environment | React (expected) |
| Deployed Location | AWS Amplify (expected) |
| Amplify App ID | d2u6quqcimqsuk |
| Domain | dashboard.core-stack.org (confirm current DNS) |
| CI/CD Branch |Main |
| Deployment Type | Automated (expected) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |

### Commons Connect React App

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/Commons-Connect|
| Environment | React (expected) |
| Deployed Location | AWS Amplify (expected) |
| Amplify App ID | d1rx3d0dyjc5v7 |
| Domain | nrm.core-stack.org |
| CI/CD Branch | Main |
| Deployment Type | Automated (expected) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |

### Frontend Mapping Guardrail

Do not copy values between LE, KYL, Dashboard, and CC by assumption. For each app, validate all of the below before updating this file:

1. GitHub repository URL.
2. Amplify App ID.
3. Connected branch in Amplify.
4. Public DNS name (and certificate coverage).
5. Responsible owner/on-call group.

### OS Operations Baseline

For production Linux host-level tuning and troubleshooting (including `vm.swappiness`, swap sizing decisions, and memory incident steps), use:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

### Quick Verification Checklist

- Backend URL responds over HTTPS.
- GeoServer on port `8443` is reachable.
- Amplify apps are mapped to expected domains.
- SSL certificates are valid and not nearing expiry.

---

## AWS server access and roles { #aws-server-access }

This page explains how CoRE Stack infrastructure is split across two AWS servers and how to connect securely using an SSH private key.

### Server Topology

We currently operate two main servers:

1. **Application Server (Production)**
   - Primary purpose: run core backend services.
   - Hosts:
     - Django backend application
     - GeoServer
     - PostgreSQL database

2. **UAT + ODK Server**
   - Primary purpose: UAT environment and ODK workloads.
   - Hosts:
     - UAT services
     - ODK server components

### SSH Access Pattern

Use key-based SSH access to connect to either server:

```bash
ssh -i <key_name> ubuntu@domain
```

Replace:

- `<key_name>` with your private key file (for example `corestack-prod.pem`)
- `domain` with the target server domain or public IP

Example:

```bash
ssh -i corestack-prod.pem ubuntu@geoserver.core-stack.org
```

### Access Notes

- Keep private keys secure and do not commit them to any repository.
- Apply least-privilege access controls for team members.
- Use the correct key for each environment (production vs UAT).
- If SSH fails, verify:
  - key permissions
  - security-group inbound rule for port `22`
  - correct `ubuntu@host` target

---

## Apache + mod_wsgi + SSL { #apache-mod_wsgi }

### Project Information

- OS: Ubuntu 24.04
- Project Path: `/home/ubuntu/cfpt/corestack-backend/`
- Conda Environment Name: `corestack-backend`
- Django Project Folder: `nrm_app`
- Domain: `geoserver.core-stack.org`

### Prerequisites

- Ubuntu 24.04 host with sudo access
- DNS record pointing to the host
- Conda environment `corestack-backend` already created
- Django project and `wsgi.py` present

---

### 1. Install Apache

```bash
sudo apt update
sudo apt install apache2 apache2-dev
```

Enable required modules:

```bash
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers
```

Restart Apache:

```bash
sudo systemctl restart apache2
```

---

### 2. Install mod_wsgi in Conda Environment

Activate conda environment:

```bash
conda activate corestack-backend
```

Install mod_wsgi:

```bash
pip install mod_wsgi
```

Export Apache module configuration:

```bash
mod_wsgi-express module-config > /tmp/mod_wsgi.conf
```

Copy it to Apache:

```bash
sudo cp /tmp/mod_wsgi.conf /etc/apache2/mods-available/mod_wsgi.load
sudo a2enmod mod_wsgi
sudo systemctl restart apache2
```

---

### 3. Collect Static Files

Navigate to project:

```bash
cd /home/ubuntu/cfpt/corestack-backend/
python manage.py collectstatic
```

Ensure in `settings.py`:

```python
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
```

---

### 4. Set Proper Permissions

Apache runs as `www-data`.

```bash
sudo chown -R www-data:www-data /home/ubuntu/cfpt
sudo chmod -R 755 /home/ubuntu/cfpt
sudo chmod 755 /home/ubuntu
```

---

### 5. Create Apache Virtual Host (HTTP + HTTPS)

Create config file:

```bash
sudo nano /etc/apache2/sites-available/corestack.conf
```

Paste the following configuration:

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

    Alias /static /home/ubuntu/cfpt/corestack-backend/static
    <Directory /home/ubuntu/cfpt/corestack-backend/static>
        Require all granted
    </Directory>

    <Directory /home/ubuntu/cfpt/corestack-backend/corestack>
        <Files wsgi.py>
            Require all granted
        </Files>
    </Directory>

    WSGIDaemonProcess corestack \
        python-home=/home/ubuntu/miniconda3/envs/corestack-backend \
        python-path=/home/ubuntu/cfpt/corestack-backend

    WSGIProcessGroup corestack
    WSGIScriptAlias / /home/ubuntu/cfpt/corestack-backend/corestack/wsgi.py

    ErrorLog ${APACHE_LOG_DIR}/corestack_error.log
    CustomLog ${APACHE_LOG_DIR}/corestack_access.log combined

    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

⚠️ IMPORTANT:  
Check your actual conda path:

```bash
which python
```

It should look like:

```
/home/ubuntu/miniconda3/envs/corestack-backend/bin/python
```

If different, update `python-home` accordingly.

---

### 6. Enable Site

```bash
sudo a2ensite corestack
sudo a2dissite 000-default
sudo systemctl reload apache2
```

---

### 7. Install SSL Certificate (Let's Encrypt)

Install certbot:

```bash
sudo apt install certbot python3-certbot-apache
```

Generate SSL certificate:

```bash
sudo certbot --apache -d your-domain.com
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

### 8. Update Django Production Settings

In `settings.py`:

```python
DEBUG = False

ALLOWED_HOSTS = ["core-stack.org"]

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

### 9. Restart Apache

```bash
sudo systemctl restart apache2
```

---

### 10. Logs Location

Apache logs:

```
/var/log/apache2/corestack_error.log
/var/log/apache2/corestack_access.log
```

Live monitoring:

```bash
sudo tail -f /var/log/apache2/corestack_error.log
```

---

### Verify

```bash
sudo apache2ctl configtest
sudo systemctl status apache2
curl -I https://your-domain.com
```

Expected:
- Apache config test returns `Syntax OK`
- HTTPS endpoint returns `200`/`301`/`302`

### Troubleshooting

- `500` on all routes: verify `WSGIScriptAlias` and `python-home` paths.
- Static files not loading: re-run `collectstatic` and verify `Alias /static`.
- SSL errors: verify certificate paths under `/etc/letsencrypt/live/...`.
- Permission issues: re-check ownership of project path for `www-data`.

---

### Final Architecture

HTTPS → Apache → mod_wsgi → Conda (corestack-backend) → Django → Database

---

### Related: OS Memory Tuning

If Apache or Django workers are restarted due to memory pressure, use:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## Celery + RabbitMQ + Flower { #celery }

This guide explains how to run Celery workers in production with:

- RabbitMQ broker
- systemd services for queue workers
- dynamic per-queue concurrency
- Flower monitoring

### Prerequisites

- Conda environment `corestack-backend`
- RabbitMQ installed and running
- Django app configured with Celery integration (`nrm_app/celery.py`)

### Installer Boundary (`install.sh`)

The backend installer prepares core dependencies (Conda/PostgreSQL/RabbitMQ/.env and app bootstrap), but queue topology and production worker policy are still operator-managed.

`install.sh` handles:
- RabbitMQ installation + service start
- backend environment/bootstrap needed for Celery to run

`install.sh` does not fully handle:
- queue-specific `systemd` service instances (`celery@<queue>:<concurrency>`)
- final queue list and per-queue concurrency policy
- Flower production auth/port exposure decisions

---

### 1. Install Dependencies

```bash
conda activate corestack-backend
pip install celery flower
```

### 2. Install and Start RabbitMQ

```bash
sudo apt update
sudo apt install rabbitmq-server
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

### 3. Celery App Configuration

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

### 4. Manual Worker Test

```bash
cd ~/cfpt/core-stack-backend/
conda activate corestack-backend
celery -A nrm_app worker --loglevel=info -Q nrm
```

If manual execution works, systemd setup usually works as well.

### 5. Create Logs Directory

```bash
sudo mkdir -p /var/log/celery
sudo chown -R root:adm /var/log/celery
sudo chmod -R 775 /var/log/celery
```

### 6. Create Queue Worker Service Template

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

### 7. Queue Configuration

| Queue | Purpose | Command |
|---|---|---|
| `nrm` | Layer generation tasks | `sudo systemctl restart celery@nrm:30` |
| `whatsapp` | WhatsApp bot tasks | `sudo systemctl restart celery@whatsapp:5` |
| `waterbody` | Waterbody dashboard tasks | `sudo systemctl restart celery@waterbody:5` |
| `celery` | Default queue | `sudo systemctl restart celery@celery:5` |

#### What "reconfigured celery queues" means

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

### 8. Flower Monitoring

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

### 9. Useful Commands

```bash
sudo systemctl restart celery@<queue>:<concurrency>
sudo systemctl status celery@<queue>:<concurrency>
journalctl -u celery@<queue>:<concurrency> -f
```

### Verify

```bash
sudo systemctl status rabbitmq-server
sudo systemctl status celery@nrm:30
sudo systemctl status celery-flower
```

Expected:
- all services in `active (running)` state
- workers consuming from expected queues

### Troubleshooting

- Worker exits immediately: run the same `celery` command manually in shell.
- Tasks stuck in queue: verify queue name used by producer and worker.
- High memory usage: reduce queue concurrency and use [Linux memory and swap tuning](../../index.md#os-memory-tuning).
- Flower not reachable: check port `5555` firewall/security group rules.

### Related: OS Memory Tuning

For deciding worker concurrency based on available RAM, swap size, swappiness values, and OOM troubleshooting:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## GeoServer + Tomcat + SSL (8443) { #geoserver }

### Overview

This guide installs:

- Apache Tomcat 10
- GeoServer (WAR deployment)
- HTTPS on port `8443`
- systemd service for Tomcat

Final URL:
`https://geoserver.core-stack.org:8443/geoserver`

### Prerequisites

- Ubuntu 24.04 host with sudo access
- DNS for `geoserver.core-stack.org`
- Open port `8443` in security group/firewall
- Java 17 available

---

### 1. Install Java

GeoServer requires Java 11 or 17 (Java 17 recommended):

```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

### 2. Install Apache Tomcat 10

```bash
sudo useradd -m -U -d /opt/tomcat -s /bin/false tomcat
cd /tmp
wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.24/bin/apache-tomcat-10.1.24.tar.gz
sudo mkdir -p /opt/tomcat
sudo tar -xzf apache-tomcat-10.1.24.tar.gz -C /opt/tomcat --strip-components=1
sudo chown -R tomcat:tomcat /opt/tomcat
sudo chmod -R 755 /opt/tomcat
```

### 3. Create Tomcat systemd Service

Create `/etc/systemd/system/tomcat.service`:

```ini
[Unit]
Description=Apache Tomcat
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/opt/tomcat
Environment=CATALINA_BASE=/opt/tomcat
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tomcat
sudo systemctl start tomcat
sudo systemctl status tomcat
```

### 4. Install GeoServer (WAR)

```bash
cd /tmp
wget https://sourceforge.net/projects/geoserver/files/GeoServer/2.24.2/geoserver-2.24.2-war.zip
sudo apt install unzip
unzip geoserver-2.24.2-war.zip
sudo cp geoserver.war /opt/tomcat/webapps/
sudo chown tomcat:tomcat /opt/tomcat/webapps/geoserver.war
sudo systemctl restart tomcat
```

Wait 1-2 minutes, then open:
`http://geoserver.core-stack.org:8080/geoserver`

Default credentials:
- Username: `admin`
- Password: `geoserver`

> Bootstrap defaults are for first login only. Change these immediately and store production credentials in the approved secret manager.
> See [Credentials and secrets](../../index.md#credentials-and-secrets).

### 5. Configure HTTPS on 8443

Use Let's Encrypt certificate and convert it to PKCS12:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d geoserver.core-stack.org
sudo openssl pkcs12 -export \
-in /etc/letsencrypt/live/geoserver.core-stack.org/fullchain.pem \
-inkey /etc/letsencrypt/live/geoserver.core-stack.org/privkey.pem \
-out /opt/tomcat/conf/keystore.p12 \
-name tomcat \
-password pass:changeit
```

Add this connector in `server.xml`:

```xml
<Connector port="8443"
 protocol="org.apache.coyote.http11.Http11NioProtocol"
 SSLEnabled="true">
 <SSLHostConfig>
   <Certificate
     certificateKeystoreFile="/opt/tomcat/conf/keystore.p12"
     certificateKeystorePassword="changeit"
     certificateKeystoreType="PKCS12"
     type="RSA" />
 </SSLHostConfig>
</Connector>
```

Restart Tomcat:

```bash
sudo systemctl restart tomcat
```

### 6. Open Firewall Port

```bash
sudo ufw allow 8443/tcp
sudo ufw reload
```

### 7. Logs

```bash
tail -f /var/log/tomcat/catalina.out
```

### Verify

```bash
sudo systemctl status tomcat
curl -I https://geoserver.core-stack.org:8443/geoserver
```

Expected:
- Tomcat service is `active (running)`
- GeoServer responds over HTTPS

### Troubleshooting

- `404 /geoserver`: check if `geoserver.war` extracted under `/opt/tomcat/webapps/`.
- HTTPS handshake issues: verify keystore path/password and connector config.
- Slow responses: review JVM heap sizing and host memory pressure.

### Final Architecture

Client -> HTTPS `8443` -> Tomcat -> GeoServer

### Related: OS Memory Tuning

If Tomcat performance degrades under load, use:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## AWS Amplify (frontend hosting) { #amplify }

### Overview

This guide explains how to deploy a React application to AWS Amplify Hosting using:

- GitHub repository
- CI/CD automatic deployments
- HTTPS enabled by default
- Custom domain (optional)

Final URL format:
https://branch-name.amplifyapp.com

### CoreStack App Examples (LE / KYL / Dashboard / CC)

Use separate Amplify apps per frontend. Do not reuse App IDs/domains across products unless intentionally consolidated.

Example inventory template:

| Product | GitHub Repo | Amplify App ID | Branch | Domain | Notes |
|---|---|---|---|---|---|
| LE | `core-stack-org/landscape-explorer` | `d2s4eeyazvtd2g` | `main` | `explorer.core-stack.org` | Known value |
| KYL | `<repo>` | `<app-id>` | `<branch>` | `<domain>` | Fill from owner/Amplify console |
| Dashboard | `<repo>` | `<app-id>` | `<branch>` | `dashboard.core-stack.org` | Verify current mapping |
| CC | `<repo>` | `<app-id>` | `<branch>` | `<domain>` | Fill from owner/Amplify console |

Before production cutover, verify each row from:
- Amplify console app settings
- connected GitHub repo/branch
- Route53 (or DNS provider) record
- cert/domain status

---

### Prerequisites

- AWS Account
- GitHub repository with your React app
- Node.js installed locally

---



### 1. Deploy Using AWS Amplify Console

1. Login to AWS Console
2. Search for **Amplify**
3. Click **New App**
4. Select **Host Web App**
5. Choose **GitHub**
6. Authorize AWS Amplify to access GitHub
7. Select:
   - Repository
   - Branch (main)

Click **Next**

---

### 2. Build Settings

Amplify usually auto-detects React and generates this build config:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

For Vite:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Click **Next → Save and Deploy**

---

### 3. Wait for Deployment

Amplify will:

- Install dependencies
- Build your app
- Deploy to CDN
- Enable HTTPS automatically

Deployment takes 2–5 minutes.

---

### 4. Access Your App

After deployment, you will get:

```
https://main.xxxxxx.amplifyapp.com
```

Every new push to GitHub triggers automatic redeployment.

---

### 5. Configure Custom Domain (Optional)

1. Open Amplify App
2. Go to **Domain Management**
3. Click **Add Domain**
4. Enter your domain (explorer.core-stack.org)
5. Follow DNS configuration steps

Amplify provides SSL automatically via AWS Certificate Manager.

---

### 6. Environment Variables (If Needed)

If your React app needs API URLs or runtime configuration:

1. Go to Amplify → App Settings → Environment Variables
2. Add variables:

```
REACT_APP_API_URL=https://api.example.com
```

Redeploy app.

Suggested per-app variable examples:

```bash
### LE
REACT_APP_PRODUCT=LE
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

### KYL
REACT_APP_PRODUCT=KYL
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

### Dashboard
REACT_APP_PRODUCT=DASHBOARD
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

### CC
REACT_APP_PRODUCT=CC
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1
```

---

### 7. Enable SPA Redirect (Important for React Router)

Go to:

Amplify → Rewrites and Redirects

Add rule:

```
Source: </^[^.]+$/>
Target: /index.html
Type: 200 (Rewrite)
```

OR use:

```
Source address: /<*>
Target address: /index.html
Type: 200
```

This prevents 404 errors on refresh.

---

### 8. Manual Deployment (Without GitHub)

If you don’t want CI/CD:

```bash
npm run build
```

Then:

1. Amplify → Deploy without Git provider
2. Drag and drop `build/` folder

---

### 9. Troubleshooting

#### Build Fails

Check logs in:

Amplify → Build Logs

Common issues:
- Wrong Node version
- Missing environment variables

You can specify Node version:

```yaml
runtime:
  nodejs: 18
```

---

### 10. Final Architecture

User → CloudFront CDN → Amplify Hosting → React Static Build

---

### 11. Cost

Amplify Hosting Free Tier includes:
- 1000 build minutes
- 5GB storage
- 15GB data transfer

After that, pay-as-you-go pricing applies.

---

### 12. Recommended for Production

- Enable custom domain
- Configure caching headers
- Use environment variables for API URLs
- Enable monitoring in CloudWatch
- Enable branch protection on GitHub

---

### Related: OS Memory Tuning

Amplify-hosted React apps do not need host-level memory tuning, but backend services they call often do. See:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## STAC API { #stac-api }


This guide installs:

- PostgreSQL
- PostGIS
- stac-fastapi (STAC API server)
- Uvicorn
- Systemd service
- Runs on port 8000

Final URL:
http://your-server-ip:8000

### Prerequisites

- Ubuntu 24.04 host with sudo access
- Python 3 and PostgreSQL access
- Domain name ready if reverse proxy + SSL is required

---

### 1. Install System Dependencies

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv \
postgresql postgresql-contrib \
postgis postgresql-15-postgis-3
```

---

### 2. Configure PostgreSQL + PostGIS

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

### 3. Create Python Virtual Environment

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

### 4. Install STAC API (`stac-fastapi`)

Install with PostgreSQL backend:

```bash
pip install stac-fastapi[postgres] uvicorn
```

---

### 5. Configure Environment Variables

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
> See [Credentials and secrets](../../index.md#credentials-and-secrets).

---

### 6. Initialize Database

Run migrations:

```bash
stac-fastapi-pgstac migrate
```

---

### 7. Start STAC API

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

### 8. Run as systemd Service (Production)

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

### 9. Open Firewall (If Enabled)

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

---

### 10. Example STAC Search Request

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

### 11. Logs

Check service logs:

```bash
journalctl -u stac-api -f
```

---

### 12. Configure Apache Reverse Proxy

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

### 13. Install SSL Certificate

```bash
sudo certbot --apache -d api.stac.core-stac.org
```

Choose redirect to HTTPS → YES

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

### Verify

```bash
sudo systemctl status stac-api
curl -I http://127.0.0.1:8000
curl -I https://api.stac.core-stac.org
```

Expected:
- `stac-api` service is `active (running)`
- local and public endpoints return HTTP response headers

### Troubleshooting

- Service fails to start: check `journalctl -u stac-api -f`.
- DB connection errors: validate Postgres credentials and extensions.
- `502/503` via Apache: verify `ProxyPass` target and service health.
- High memory usage: apply [Linux memory and swap tuning](../../index.md#os-memory-tuning) and reduce worker count.

---

### Related: OS Memory Tuning

For API performance issues caused by memory pressure (high RSS, OOM kills, swap thrashing), use:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## STAC UI and catalog { #stac-ui }

### Overview

This guide sets up:

- Private S3 bucket
- CloudFront distribution
- HTTPS enabled (default)
- Optional custom domain
- SPA routing support (React)

Final Architecture:

User → CloudFront (CDN + HTTPS) → S3 (Private Bucket)

### Prerequisites

- Built static assets available locally (`build/`)
- AWS IAM access for S3, CloudFront, and ACM
- DNS control for custom domain mapping (optional)

---

### 1. Create S3 Bucket

1. Go to AWS Console
2. Open **S3**
3. Click **Create Bucket**

Settings:

- Bucket name: my-react-app-bucket
- Region: Choose your region
- Block Public Access: ✅ Keep enabled (IMPORTANT)
- Bucket Versioning: Optional

Click **Create Bucket**

---

### 2. Upload Build Files

Build the Radient Earth app locally:

```bash
npm run build
```

Upload contents of:

```
build/
```

Upload ALL files inside build folder (not the folder itself).

---

### 3. Create CloudFront Distribution

1. Go to AWS Console
2. Open **CloudFront**
3. Click **Create Distribution**

Origin Settings:

- Origin Domain: Select your S3 bucket
- Origin Access: Choose **Origin Access Control (Recommended)**
- Create new OAC
- Signing behavior: Sign requests

Click **Create**

---

### 4. Update S3 Bucket Policy (Important)

After creating distribution:

Go to:
S3 → Bucket → Permissions → Bucket Policy

Click **Edit**

Paste the policy provided by CloudFront automatically.

It will look like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-react-app-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

Save changes.

---

### 5. Enable Default Root Object

In CloudFront:

- Go to Distribution
- Click **General**
- Set Default Root Object:

```
index.html
```

Save changes.

---

### 6. Enable SPA Routing (React Router Fix)

Go to:

CloudFront → Distribution → Error Pages → Create Custom Error Response

Create two entries:

404 Error:
- HTTP Error Code: 404
- Customize Error Response: Yes
- Response Page Path: /index.html
- HTTP Response Code: 200

403 Error:
- Same settings as above

This prevents refresh 404 errors.

---

### 7. Access Your Website

After deployment completes (5–10 minutes):

You will get URL like:

```
https://dxxxxxxxx.cloudfront.net
```

---

### 8. Add Custom Domain (Optional)

#### Step 1: Request SSL Certificate

Go to:
AWS Certificate Manager (ACM)

- Region: US East (N. Virginia)
- Request Public Certificate
- Add domain: example.com
- Validate via DNS

---

#### Step 2: Attach Certificate to CloudFront

Go to:
CloudFront → Distribution → Edit

- Alternate Domain Name (CNAME): stac.core-stac.org
- Custom SSL Certificate: Select ACM certificate

Save changes.

---

#### Step 3: Update DNS

In Route53 (or your DNS provider):

Create A record:

- Type: A
- Alias: Yes
- Target: CloudFront distribution

Wait for DNS propagation.

Now access:

```
https://example.com
```

---

### 9. Cache Invalidation (After New Deployment)

If you upload new files:

Go to:
CloudFront → Distribution → Invalidations

Create invalidation:

```
/*
```

---

### 10. Recommended Security Settings

- Keep S3 bucket private
- Use OAC (Origin Access Control)
- Enable HTTPS only
- Enable compression (Brotli/Gzip)
- Enable HTTP/2 and HTTP/3

---

### Verify

- Open CloudFront URL and test deep-link routes.
- Confirm SPA refresh works on nested routes.
- If custom domain is configured, verify valid SSL and DNS resolution.

### Troubleshooting

- `403` from CloudFront: check S3 bucket policy and OAC linkage.
- Route refresh returns `404`: verify custom error response to `/index.html`.
- Old UI after deploy: create CloudFront invalidation `/*`.
- SSL pending for custom domain: confirm ACM certificate is in `us-east-1`.

---

### Related: OS Memory Tuning

STAC UI itself is static, but STAC backend/API memory tuning guidance is available at:

- [Linux memory and swap tuning](../../index.md#os-memory-tuning)

---

## Credentials and secrets { #credentials-and-secrets }

Use this guide for handling production credentials across backend, GeoServer, STAC, and frontend deployments.

### Core Rule

- Default/example credentials shown in setup docs are bootstrap-only examples.
- Production credentials must never be committed to this repository.

### What Must Be in the Secret Manager

Store the following in your organization's approved secret manager:

- PostgreSQL usernames/passwords
- Django `SECRET_KEY` and API keys
- GeoServer admin credentials
- STAC database credentials
- RabbitMQ/Flower auth (if enabled)
- any third-party token (GEE, WhatsApp, maps, etc.)

### Incident/Server Response Access

The server response team should have read access to production secrets through role-based access in the secret manager.

Minimum process:
1. define secret owner
2. define responder read role
3. define break-glass escalation contact
4. audit access quarterly

If a responder needs access, request role assignment from the platform/security owner for the relevant environment.

### Rotation Guidance

- Rotate bootstrap defaults immediately after first deployment.
- Rotate high-risk secrets on incident or personnel change.
- Record rotation date + owner in the operations tracker.

### Documentation Rule

When writing infra docs:
- include placeholders like `<REPLACE_WITH_STRONG_PASSWORD>`
- link to this file for credential handling
- avoid hardcoded passwords in examples unless explicitly marked as disposable bootstrap defaults

---

## Linux memory and swap tuning { #os-memory-tuning }

Ubuntu 24.04 LTS (applies to most modern Linux distributions with minor command differences).

### Why This Matters

Backend services (Django, Celery, GeoServer/Tomcat, PostgreSQL) can fail under memory pressure.  
A stable host setup needs:

- enough RAM for normal load
- right-size swap for bursts
- safe `vm.swappiness` tuning
- clear troubleshooting steps for OOM and latency issues

---

### 1. Quick Health Checks

Run these first during incidents:

```bash
free -h
vmstat 1 5
top
ps aux --sort=-%mem | head -n 15
dmesg -T | rg -i "killed process|out of memory|oom"
```

What to look for:
- very low `available` memory in `free -h`
- high `si/so` (swap in/out) in `vmstat` (swap thrashing)
- OOM killer messages in `dmesg`

---

### 2. How to Decide Swap Size

Use this practical baseline:

| RAM | Recommended Swap |
|---|---|
| <= 4 GB | 2x RAM |
| 8 GB | 4-8 GB |
| 16 GB | 4-8 GB |
| 32 GB+ | 2-8 GB (burst safety only) |

Notes:
- If hibernation is required, swap should be at least RAM size.
- For server workloads, swap is a safety buffer, not primary memory.
- More swap does not fix memory leaks; it only delays failures.

---

### 3. Create or Resize Swap File

Example: create 8 GB swap file.

```bash
sudo swapoff -a
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
swapon --show
free -h
```

If `fallocate` is unavailable, use:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=8192 status=progress
```

---

### 4. `vm.swappiness`: What and How to Set

`vm.swappiness` controls how aggressively Linux moves memory pages to swap.

- `10`: keep most data in RAM, swap only when needed (common for application servers)
- `20-30`: moderate pressure handling
- `60` (default on many systems): balanced desktop/general behavior

Check current value:

```bash
cat /proc/sys/vm/swappiness
```

Set temporarily:

```bash
sudo sysctl vm.swappiness=10
```

Set permanently:

```bash
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-corestack-memory.conf
sudo sysctl --system
```

#### What Drives Swappiness Choice

Pick swappiness based on workload behavior, not a fixed number:

- memory burst pattern (steady vs sudden spikes)
- latency sensitivity (API/UI requests vs batch jobs)
- swap I/O characteristics on the host volume
- mix of JVM/Python/PostgreSQL processes
- observed `vmstat si/so` under peak traffic

Initialization sequence for new hosts:
1. set initial value to `10`
2. run representative workload
3. review `free -h`, `vmstat`, `dmesg`
4. adjust to `5-20` range if needed
5. keep value in `/etc/sysctl.d/99-corestack-memory.conf`

#### How to Pick the Value

- Start with `10` for backend-heavy hosts.
- If OOM happens with no swap use and RAM spikes fast, try `15-20`.
- If latency rises due to swap I/O (`vmstat` shows sustained `si/so`), move down to `5-10`.
- Re-check after 24-72 hours under normal + peak load.

---

### 5. Troubleshooting Memory Issues

#### Scenario A: OOM Kill Happened

1. Confirm:
   ```bash
   dmesg -T | rg -i "out of memory|killed process|oom"
   ```
2. Identify top consumers:
   ```bash
   ps aux --sort=-%mem | head -n 20
   ```
3. Immediate actions:
   - restart only the failed service (not the full host unless necessary)
   - reduce Celery concurrency temporarily
   - pause heavy batch jobs
4. Durable fixes:
   - increase RAM or optimize workload
   - set realistic worker counts
   - add queue backpressure/rate limits

#### Scenario B: High Swap Use but No OOM

Symptoms:
- response latency increases
- CPU `wa` (I/O wait) grows
- `vmstat` shows repeated `si/so`

Actions:
- reduce process concurrency
- set `vm.swappiness` lower (for example from 60 to 10)
- check for memory leaks in long-lived workers
- restart stale workers during low-traffic windows

#### Scenario C: Memory Slowly Climbs Over Days

Possible memory leak or cache growth.

Actions:
- capture process memory periodically:
  ```bash
  while true; do date; ps -eo pid,cmd,%mem,rss --sort=-rss | head -n 12; sleep 300; done
  ```
- rotate workers (Celery `--max-tasks-per-child`)
- review app-level caches and JVM heap settings (for GeoServer/Tomcat)

---

### 6. Service-Specific Guidance

- **Django + Apache/mod_wsgi**
  - Keep process/thread counts proportional to RAM.
  - Avoid over-provisioning workers on small instances.

- **Celery**
  - Concurrency should be tuned per queue and task type.
  - CPU-heavy and memory-heavy tasks should not share the same high-concurrency queue.

- **GeoServer/Tomcat**
  - Set JVM heap (`-Xms`, `-Xmx`) explicitly.
  - Leave enough RAM for OS page cache and other services.

- **PostgreSQL**
  - Revisit `shared_buffers` and `work_mem` if database process dominates memory.

---

### 7. Minimal Incident Runbook

```bash
free -h
vmstat 1 5
ps aux --sort=-%mem | head -n 20
dmesg -T | rg -i "oom|killed process"
```

Then:
1. stop/slow the largest offender
2. restore service health
3. tune swap + swappiness
4. reduce worker concurrency
5. schedule a postmortem with sustained monitoring

---

### 8. Recommended Starting Point (CoreStack Hosts)

- Swap: `4-8 GB` (or more on small RAM hosts)
- `vm.swappiness=10`
- Alerting:
  - available memory < 15%
  - swap usage > 40%
  - OOM events > 0

Revisit monthly or after major workload changes.

---

### 9. Common Infra Troubleshooting (Non-Memory)

#### GeoServer/Tomcat Hangs

Symptoms:
- endpoint times out
- Tomcat process alive but no response on `8443`

Checks:
```bash
sudo systemctl status tomcat
ps -ef | rg -i "tomcat|java"
sudo journalctl -u tomcat -n 200 --no-pager
sudo ss -lntp | rg 8443
```

Actions:
- capture logs before restart
- restart Tomcat only (`sudo systemctl restart tomcat`)
- validate JVM heap limits and host free memory
- check GeoServer data directory lock/contention

#### Network Unreachable / Intermittent API Failures

Checks:
```bash
ip a
ip route
ping -c 4 8.8.8.8
ping -c 4 geoserver.core-stack.org
curl -I https://geoserver.core-stack.org
sudo ss -s
```

Actions:
- verify security-group + firewall rules (`ufw`, cloud SG/NACL)
- confirm DNS resolution and TTL changes
- test internal localhost service first, then public endpoint
- inspect packet drops (`dmesg`, NIC stats) during incident window

---

## Nagios monitoring { #nagios-monitoring }

This page documents service-level Nagios checks, threshold interpretation, alert timing behavior, and why CloudWatch may detect some short-lived incidents earlier than Nagios.

### Service Monitoring Table

| Service | NRPE Command | What It Checks | Warning Threshold | Critical Threshold | Threshold Meaning |
|---|---|---|---|---|---|
| CPU Usage | `check_nrpe!check_cpu` | CPU utilization | `40%` | `50%` | WARNING if CPU usage exceeds 40%, CRITICAL above 50% |
| RAM Usage | `check_nrpe!check_ram` | Server RAM utilization | `40%` | `50%` | WARNING if RAM usage exceeds 40%, CRITICAL above 50% |
| Swap Usage | `check_nrpe!check_swap` | Swap memory usage | `40%` | `50%` | WARNING if swap usage exceeds 40%, CRITICAL above 50% |
| Apache Service | `check_nrpe!check_apache` | Apache/httpd process health | Apache process unhealthy | Apache process stopped | Checks whether Apache web server process is running properly |
| Tomcat | `check_nrpe!check_tomcat` | Tomcat Java application server process | Tomcat process unhealthy | Tomcat process stopped | Checks whether Tomcat service/process is active |
| PostgreSQL Service | `check_nrpe!check_postgress` | PostgreSQL database process | Database connection issue | PostgreSQL process stopped | Checks whether PostgreSQL database service is running |

### Process Health Meaning

| Status | Meaning |
|---|---|
| Healthy Process | Service/process is running normally and responding |
| Unhealthy Process | Process exists but may be overloaded, hung, or partially failing |
| Process Stopped | Service/process is not running at all |
| Recovery | Process/service becomes healthy again after failure |

### Alert Frequency Table

| Setting | Typical Value | Meaning |
|---|---|---|
| `check_interval` | `5` minutes | Nagios checks the service every 5 minutes |
| `retry_interval` | `1` minute | If service fails, Nagios retries every 1 minute |
| `max_check_attempts` | `3` | Alert becomes HARD state after 3 failed attempts |
| `notification_interval` | `30` minutes | Nagios sends repeated reminder emails every 30 minutes |
| `notification_period` | `24x7` | Notifications are allowed all the time |

### Email Alert Timeline

| Time | Event |
|---|---|
| 10:00 | Service fails |
| 10:01 | Retry attempt 1 |
| 10:02 | Retry attempt 2 |
| 10:03 | HARD state reached, first email alert sent |
| 10:33 | Reminder email sent |
| 11:03 | Reminder email sent |
| 11:10 | Service recovers |
| 11:10 | Recovery email sent |

### Why Amazon CloudWatch Detects High Swap Usage but Nagios May Not

| Monitoring Tool | Behavior |
|---|---|
| Amazon CloudWatch | Uses event-driven monitoring and near real-time metric streaming through CloudWatch Agent/EC2 metrics. It can detect short-lived swap spikes and transient memory pressure events before Nagios performs its next scheduled poll. |
| Nagios | Checks only during scheduled polling intervals (for example every 5 minutes). If swap usage becomes high and recovers before the next Nagios check, Nagios may never detect the issue while CloudWatch does. |

#### Example Scenario

| Time | Event |
|---|---|
| 10:00 | Swap usage spikes to 80% |
| 10:01 | CloudWatch event/metric stream detects high swap usage and triggers alert |
| 10:03 | System memory pressure reduces and swap usage falls back to 10% |
| 10:05 | Nagios performs next scheduled check |
| 10:05 | Nagios sees normal swap usage and reports OK |

#### Why This Happens

| Reason | Explanation |
|---|---|
| Monitoring architecture difference | CloudWatch uses continuous metric/event collection while Nagios relies on scheduled polling intervals |
| Transient spikes | Temporary spikes can recover before Nagios polls again |
| Memory reclamation | Linux may automatically free swap/cache before Nagios checks |
| Check scheduling delay | Nagios is poll-based, not continuous streaming metrics |

### CPU Load Threshold Explanation

For CPU checks:

```bash
check_load -w 40,40,40 -c 50,50,50
```

The values represent:

| Position | Meaning |
|---|---|
| First value | 1-minute average load |
| Second value | 5-minute average load |
| Third value | 15-minute average load |

Example interpretation:

| Time Window | Warning | Critical |
|---|---|---|
| Last 1 minute | > 40 | > 50 |
| Last 5 minutes | > 40 | > 50 |
| Last 15 minutes | > 40 | > 50 |

---
