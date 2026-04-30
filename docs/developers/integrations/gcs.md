---
title: Google Cloud Storage
description: Why CoRE Stack needs GCS, how the current backend uses it, and the bucket and IAM setup required for GEE-backed pipelines.
---

# Google Cloud Storage

Google Cloud Storage is an operational bridge in the current CoRE Stack backend.

It is used to move artifacts between:

- local or server-side files
- Django-side helpers and Celery tasks
- Google Earth Engine
- GeoServer publication flows

In practice, many real compute runs will fail without a working GCS bucket, even if Earth Engine authentication itself succeeds.

Primary sources:

- [utilities/constants.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/constants.py)
- [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py)
- [computing/misc/internal_api_initialisation_test.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/internal_api_initialisation_test.py)

---

## Why The Backend Needs GCS

The current backend uses GCS for four recurring reasons:

1. to stage local shapefile parts before importing them into Earth Engine
2. to export rasters from Earth Engine before pushing them into GeoServer
3. to upload local GeoTIFF files and then load them back into Earth Engine
4. to fall back to GeoJSON-in-GCS when `FeatureCollection.getInfo()` is too large to move directly

That means GCS is not just a storage add-on.
It is part of the transport layer for several compute and publication paths.

If you are wondering why this exists at all: the current backend does not treat large local vector and raster inputs as direct one-step uploads into Earth Engine.
Instead, it stages them through Cloud Storage and then continues the workflow from there.

---

## Current Bucket Assumptions

The current backend reads the main bucket name from `GCS_BUCKET_NAME` in `utilities/constants.py`.

As checked in the current code, that constant is:

```python
GCS_BUCKET_NAME = "core_stack"
```

Two important implementation details follow from that:

- Most helper functions respect `GCS_BUCKET_NAME`.
- One shapefile import helper still hardcodes `gs://core_stack/...` inside `upload_shp_to_gee()`.

!!! warning
    If you change the bucket name, update both `GCS_BUCKET_NAME` and the hardcoded `gs://core_stack/...` reference in `upload_shp_to_gee()` or shapefile-to-GEE imports will break.

### Bucket Region Matters

Some backend paths call `ee.Image.loadGeoTIFF()` through `upload_tif_from_gcs_to_gee(...)`.
That path is used by modules such as:

- [computing/clart/drainage_density.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/clart/drainage_density.py)
- [computing/clart/lithology.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/clart/lithology.py)
- [computing/clart/fes_clart_to_geoserver.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/clart/fes_clart_to_geoserver.py)

For those flows, the bucket should be created in `us-central1`.

```bash
gcloud storage buckets create gs://core_stack --location=us-central1
```

If the bucket is in another region, `loadGeoTIFF()`-backed imports can fail even though the object upload itself succeeded.

---

## Required IAM For The Current Backend

The same stored `GEEAccount` credentials are used for both Earth Engine and GCS access in `gcs_config(...)`.

That creates two permission needs.

### 1. Earth Engine Read Access To The Bucket

For `ee.Image.loadGeoTIFF()` and similar Earth Engine-side reads, grant the GEE service account these roles on the bucket:

```bash
gcloud storage buckets add-iam-policy-binding gs://<bucket> \
  --member=serviceAccount:<gee-service-account> \
  --role=roles/storage.objectViewer

gcloud storage buckets add-iam-policy-binding gs://<bucket> \
  --member=serviceAccount:<gee-service-account> \
  --role=roles/storage.legacyBucketReader
```

### 2. Backend Upload / Download / Cleanup Access

The backend also uploads, downloads, and sometimes deletes objects through helpers such as:

- `probe_gcs_upload_access(...)`
- `upload_tif_to_gcs(...)`
- `upload_file_to_gcs(...)`
- `sync_raster_gcs_to_geoserver(...)`
- `get_geojson_from_gcs(...)`

So the same account also needs object write and cleanup permissions.
The simplest bucket-level grant is:

```bash
gcloud storage buckets add-iam-policy-binding gs://<bucket> \
  --member=serviceAccount:<gee-service-account> \
  --role=roles/storage.objectAdmin
```

This aligns with what the current initialization probe actually tests: object upload, and optionally object delete.

---

## How GCS Is Used In The Current Codebase

The backend sweep shows a few repeated patterns rather than one-off use.

| Pattern | Main helper(s) | Why GCS is involved | Representative modules |
|--------|-----------------|---------------------|------------------------|
| readiness probe | `probe_gcs_upload_access()` | verify the configured GEE service account can write to the bucket before real compute runs | `computing/misc/internal_api_initialisation_test.py` |
| shapefile staging into GEE | `upload_file_to_gcs()`, `gcs_to_gee_asset_cli()`, `upload_shp_to_gee()` | upload `.shp/.dbf/.shx/.prj` components to `shapefiles/` and import them into Earth Engine through the CLI | `computing/misc/admin_boundary_v2.py`, `computing/misc/nrega.py`, `computing/mws/calculateG.py` |
| raster publication bridge | `sync_raster_to_gcs()`, `sync_raster_gcs_to_geoserver()` | export GeoTIFFs from Earth Engine to `nrm_raster/`, then download them into GeoServer publication | `computing/lulc/lulc_v3.py`, `computing/change_detection/change_detection.py`, `computing/tree_health/*`, `computing/terrain_descriptor/*`, `computing/plantation/site_suitability_raster.py` |
| local TIFF to GEE asset | `upload_tif_to_gcs()`, `upload_tif_from_gcs_to_gee()` | upload a server-side raster to GCS first, then read it back through `ee.Image.loadGeoTIFF()` | `computing/clart/drainage_density.py`, `computing/clart/lithology.py`, `computing/clart/fes_clart_to_geoserver.py` |
| large vector fallback | `sync_vector_to_gcs()`, `get_geojson_from_gcs()` | when `getInfo()` is too large, export a `FeatureCollection` to `nrm_vector/` and download the GeoJSON from the bucket instead | `computing/utils.py`, `computing/surface_water_bodies/merge_swb_ponds.py`, `computing/clart/drainage_density.py` |

The important practical point is that many modules share the same small set of helpers in `utilities/gee_utils.py`.
If bucket setup is wrong, multiple pipeline families fail in similar ways.

---

## Object Prefixes You Will See

The current helpers write into predictable bucket prefixes:

- `core-stack-initialisation-probe/` for setup validation
- `shapefiles/` for shapefile uploads before Earth Engine table import
- `nrm_raster/` for exported GeoTIFFs
- `nrm_vector/` for exported vector files such as GeoJSON

If you are inspecting bucket contents during debugging, these prefixes tell you which backend pattern produced the object.

---

## Minimum Setup Checklist

1. Create the bucket in `us-central1`.
2. Keep the name aligned with the current backend assumption, which is `core_stack` unless you also patch the hardcoded shapefile URI helper.
3. Grant the GEE service account:
   - `roles/storage.objectViewer`
   - `roles/storage.legacyBucketReader`
   - write and cleanup permissions, typically `roles/storage.objectAdmin`
4. Rerun the strict initialization check:

```bash
source "$HOME/miniconda3/etc/profile.d/conda.sh"
conda activate corestackenv
cd /path/to/core-stack-backend
python computing/misc/internal_api_initialisation_test.py --require-gee
```

The result to watch is:

- `gcs-upload-probe`

If that probe fails, the service account still does not have the access the backend needs.

---

## Related Docs

- [Google Earth Engine](google-earth-engine.md)
- [Installer](../installer.md)
- [Setup Troubleshooting](../setup-troubleshooting.md)
- [Develop New Pipelines](../../pipelines/index.md)
