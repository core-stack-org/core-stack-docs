# GeoServer Integration

GeoServer is the main publication and geometry-delivery surface for many CoRE Stack outputs.

You need it when:

- compute outputs must be published as WMS, WFS, or download-ready layers
- public geometry APIs such as `get_mws_geometries` and `get_village_geometries` must work
- you want the installer validation to verify the full publish path instead of stopping with a warning

Docker starts GeoServer for you at [http://127.0.0.1:8080/geoserver](http://127.0.0.1:8080/geoserver). Username `admin`, password from `GEOSERVER_PASSWORD` in `nrm_app/.env`.

---

## Fastest Path: Point The Backend To An Existing GeoServer

GeoServer is configured through `nrm_app/.env`:

```env
GEOSERVER_URL=https://host/geoserver
GEOSERVER_USERNAME=admin
GEOSERVER_PASSWORD=your-password
```

After you change them, recreate the backend:

```bash
docker compose --env-file nrm_app/.env up -d --force-recreate backend
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

## GeoServer in Docker

The Compose stack starts GeoServer. You do not install Tomcat or a GeoServer war yourself.

| | |
| --- | --- |
| Web UI | [http://127.0.0.1:8080/geoserver](http://127.0.0.1:8080/geoserver) |
| Username | `admin` |
| Password | `GEOSERVER_PASSWORD` in `nrm_app/.env` |

If the container is not `Up`, read `docker compose --env-file nrm_app/.env logs geoserver`.

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

If the container is not running, start the stack again with `docker compose --env-file nrm_app/.env up -d` before debugging a larger pipeline.
