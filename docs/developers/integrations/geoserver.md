# GeoServer Integration

GeoServer is the main publication and geometry-delivery surface for many CoRE Stack outputs.

You need it when:

- compute outputs must be published as WMS, WFS, or download-ready layers
- public geometry APIs such as `get_mws_geometries` and `get_village_geometries` must work
- you want the installer validation to verify the full publish path instead of stopping with a warning

If GeoServer is not ready on day one, the backend can still install and boot. Add it later and rerun `initialisation_check`.

---

## Fastest Path: Point The Backend To An Existing GeoServer

GeoServer is configured through `nrm_app/.env`:

```env
GEOSERVER_URL=https://host/geoserver
GEOSERVER_USERNAME=admin
GEOSERVER_PASSWORD=your-password
```

You can write those values directly through the installer and validate them in the same run:

```bash
bash installation/install.sh \
  --only initialisation_check \
  --input geoserver_url=https://host/geoserver \
  --input geoserver_username=admin \
  --input geoserver_password=your-password
```

Use the full GeoServer root URL, not just the host.

Good:

- `https://maps.example.com/geoserver`
- `http://localhost:8080/geoserver`

Bad:

- `https://maps.example.com`
- `http://localhost:8080`

---

## What The Installer Validation Expects

During `initialisation_check`, the backend:

1. reads `GEOSERVER_URL`, `GEOSERVER_USERNAME`, and `GEOSERVER_PASSWORD` from `nrm_app/.env`
2. probes `${GEOSERVER_URL}/rest/about/version.json`
3. warns if the URL is blank or the credentials are incomplete
4. only treats the first authenticated computing API as fully publish-ready when GeoServer, GEE, GCS, and admin-boundary data are all ready

If GeoServer is blank, the install can still complete, but publish and public-geometry flows remain unverified.

---

## Local GeoServer On Ubuntu Or WSL

If you do not already have a GeoServer instance, the local setup guide in this repo uses:

- Java 21
- Apache Tomcat `9.0.98`
- GeoServer `2.23.6`

Tomcat 9 matters here. The local guide is based on the Tomcat 9 compatible GeoServer line, not Tomcat 10.

### 1. Install Java

```bash
sudo apt update
sudo apt install -y default-jdk
java --version
```

### 2. Create The Tomcat User

```bash
sudo groupadd tomcat
sudo useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat
```

If those already exist, `groupadd` or `useradd` may report that and you can continue.

### 3. Install Tomcat 9

```bash
cd /tmp
wget -L "https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.98/bin/apache-tomcat-9.0.98.tar.gz" -O apache-tomcat-9.0.98.tar.gz
sudo mkdir -p /opt/tomcat
sudo tar xzvf apache-tomcat-9.0.98.tar.gz -C /opt/tomcat --strip-components=1

cd /opt/tomcat
sudo chgrp -R tomcat /opt/tomcat
sudo chmod -R g+r conf
sudo chmod g+x conf
sudo chown -R tomcat webapps/ work/ temp/ logs/
```

Start it and verify:

```bash
sudo /opt/tomcat/bin/startup.sh
curl http://localhost:8080
```

### 4. Deploy GeoServer

```bash
cd /tmp
wget -L "https://sourceforge.net/projects/geoserver/files/GeoServer/2.23.6/geoserver-2.23.6-war.zip/download" -O geoserver-2.23.6-war.zip
sudo apt install -y unzip
unzip geoserver-2.23.6-war.zip -d /tmp/geoserver-war
sudo cp /tmp/geoserver-war/geoserver.war /opt/tomcat/webapps/
sleep 45
sudo tail -20 /opt/tomcat/logs/catalina.out
```

When deployment finishes, GeoServer should be available at:

```text
http://localhost:8080/geoserver/web/
```

Default login:

- username: `admin`
- password: `geoserver`

Change that password after first login if this is anything other than an isolated local setup.

### 5. Point CoRE Stack To The Local Instance

Set these values in `nrm_app/.env`:

```env
GEOSERVER_URL=http://localhost:8080/geoserver
GEOSERVER_USERNAME=admin
GEOSERVER_PASSWORD=geoserver
```

Then rerun the internal validation:

```bash
bash installation/install.sh \
  --only initialisation_check \
  --input geoserver_url=http://localhost:8080/geoserver \
  --input geoserver_username=admin \
  --input geoserver_password=geoserver
```

### 6. Useful Tomcat Commands

```bash
# Start
sudo /opt/tomcat/bin/startup.sh

# Stop
sudo /opt/tomcat/bin/shutdown.sh

# Logs
sudo tail -f /opt/tomcat/logs/catalina.out

# Tomcat health
curl http://localhost:8080

# GeoServer health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/geoserver/web/
```

If you are using WSL, Tomcat usually does not auto-start when the WSL session restarts. Start it again before testing GeoServer-backed flows.

---

## Manual Verification

Once the env values are set, test the REST endpoint directly:

```bash
curl -u "admin:your-password" \
  "https://host/geoserver/rest/about/version.json"
```

For a local default install:

```bash
curl -u "admin:geoserver" \
  "http://localhost:8080/geoserver/rest/about/version.json"
```

If that request does not return `200`, the current backend initialization check will also report `geoserver-probe` as a warning or failure.

---

## Where GeoServer Is Used In The Backend

The main server-side helpers live in:

- [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L58-L190)

That module handles:

- workspace creation
- shapefile publication
- raster and vector sync helpers
- several publish-after-compute transitions

GeoServer also appears directly in the public data surface:

- layer URL assembly in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L56-L114)
- MWS geometry delivery in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L412-L486)
- village geometry delivery in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L488-L519)

---

## Common Failure Modes

### `GEOSERVER_URL` is blank

The initialization test reports `geoserver-probe` as a warning and skips full publish-path validation.

### Credentials are missing or wrong

The probe may reach GeoServer but fail with a non-`200` status for `rest/about/version.json`.

### GeoServer is up, but CoRE Stack still cannot publish

Check:

1. the Celery worker logs
2. GeoServer REST reachability
3. the configured workspace or layer name for that pipeline
4. whether the pipeline actually reached its publication step

If `first-computing-api` did not pass during `initialisation_check`, fix that before debugging a larger pipeline.

### Local GeoServer stops working after a reboot or WSL restart

Tomcat is usually just not running. Start it again:

```bash
sudo /opt/tomcat/bin/startup.sh
```
