---
title: Integrations
description: Developer-facing integration docs for Earth Engine, Google Cloud Storage, GeoServer, AWS, and related CoRE Stack delivery surfaces.
---

# Integrations

These pages explain the external systems the current backend can connect to once the base install is working.

Read this section after [Installer](../installer.md), especially when the installer output names an integration blocker such as `gee-probe`, `gcs-upload-probe`, `geoserver-probe`, or `public_api_check`.

You do not need every integration on day one. The current installer is designed so the base backend can come up first, and GEE, GeoServer, or public API credentials can be added later with targeted reruns.

**Current backend install flow:**

- GEE can now be imported directly during `install.sh` with `--gee-json` or `--input gee_json=...`.
- GEE can also be skipped during first install and added later with `--only gee_configuration,initialisation_check`.
- GCS matters operationally because many GEE and GeoServer flows stage artifacts through Cloud Storage.
- GeoServer settings can be queued into the installer and are probed during `initialisation_check` when present.
- GeoServer can also be added later with `--only initialisation_check --input geoserver_url=...`.