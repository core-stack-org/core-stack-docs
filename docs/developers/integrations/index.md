---
title: Integrations
description: Developer-facing integration docs for Earth Engine, Google Cloud Storage, GeoServer, AWS, and related CoRE Stack delivery surfaces.
---

# Integrations

These pages explain the external systems the current backend can connect to once the base install is working.

Read this section after [Install CoRE Stack](../installer.md). Docker already starts GeoServer. Earth Engine and Cloud Storage are added later in Django admin and `nrm_app/.env`. See [Google Earth Engine on Docker](../docker.md#gee-and-gcs).

You do not need every integration on day one. The Docker stack comes up first. Add GEE or GCS when a pipeline asks for them.

- GCS matters because many GEE and GeoServer flows stage artifacts through Cloud Storage.
- GeoServer is part of the Docker stack. Its URL and password live in `nrm_app/.env`.