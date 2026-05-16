# Apache + mod_wsgi + SSL Setup for Django (Ubuntu 24.04)

## Project Information

- OS: Ubuntu 24.04
- Project Path: `/home/ubuntu/cfpt/corestack-backend/`
- Conda Environment Name: `corestack-backend`
- Django Project Folder: `nrm_app`
- Domain: `geoserver.core-stack.org`

## Prerequisites

- Ubuntu 24.04 host with sudo access
- DNS record pointing to the host
- Conda environment `corestack-backend` already created
- Django project and `wsgi.py` present

---

## 1. Install Apache

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

## 2. Install mod_wsgi in Conda Environment

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

## 3. Collect Static Files

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

## 4. Set Proper Permissions

Apache runs as `www-data`.

```bash
sudo chown -R www-data:www-data /home/ubuntu/cfpt
sudo chmod -R 755 /home/ubuntu/cfpt
sudo chmod 755 /home/ubuntu
```

---

## 5. Create Apache Virtual Host (HTTP + HTTPS)

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

## 6. Enable Site

```bash
sudo a2ensite corestack
sudo a2dissite 000-default
sudo systemctl reload apache2
```

---

## 7. Install SSL Certificate (Let's Encrypt)

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

## 8. Update Django Production Settings

In `settings.py`:

```python
DEBUG = False

ALLOWED_HOSTS = ["core-stack.org"]

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## 9. Restart Apache

```bash
sudo systemctl restart apache2
```

---

## 10. Logs Location

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

## Verify

```bash
sudo apache2ctl configtest
sudo systemctl status apache2
curl -I https://your-domain.com
```

Expected:
- Apache config test returns `Syntax OK`
- HTTPS endpoint returns `200`/`301`/`302`

## Troubleshooting

- `500` on all routes: verify `WSGIScriptAlias` and `python-home` paths.
- Static files not loading: re-run `collectstatic` and verify `Alias /static`.
- SSL errors: verify certificate paths under `/etc/letsencrypt/live/...`.
- Permission issues: re-check ownership of project path for `www-data`.

---

## Final Architecture

HTTPS → Apache → mod_wsgi → Conda (corestack-backend) → Django → Database

---

## Related: OS Memory Tuning

If Apache or Django workers are restarted due to memory pressure, use:

- `os-memory-tuning.md`