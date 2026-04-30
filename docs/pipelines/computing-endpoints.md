---
title: Computing API Paths
description: API-path view of the CoRE Stack Computing API, with links into the pipeline families each path belongs to.
---

# Computing API Paths

The Computing API is the developer-facing surface that triggers CoRE Stack computations. Most handlers queue work and return quickly while pipeline modules do the heavy tasks.

This page is the API path guide. For implementation flow, export helpers, and reusable patterns, start with [Build Pipelines](index.md) and the [Pipeline Patterns](index.md#pipeline-patterns) section.

---

## Complete Computing API Inventory

The current `computing/urls.py` inventory contains the computing APIs under `/api/v1/`.

Most API paths use `POST`. The `GET` API paths are:

- `GET /api/v1/get_layers_in_workspace/`
- `GET /api/v1/missing_layers/`
- `GET /api/v1/get_stac_catalog/`
- `GET /api/v1/stac/`
- `GET /api/v1/stac/<state>/`
- `GET /api/v1/stac/<state>/<district>/`
- `GET /api/v1/stac/<state>/<district>/<block>/`
- `GET /api/v1/stac/<state>/<district>/<block>/items/<item_id>/`

!!! important "Before you use these APIs"
    Most `POST` request bodies include `gee_account_id`; configure Google Earth Engine first. Keep the Django server and Celery worker running for long computations. Project-backed plantation APIs also need database-side project, KML, and plantation-profile setup.

## How These APIs Map To Pipelines

| API Purpose | What it does | Usual pattern |
| --- | --- | --- |
| Workspace, publication, and status | manages GeoServer workspaces, layer records, sync flags, and task status | integration/control APIs |
| Boundary and MWS scaffolding | creates admin, MWS, centroid, connectivity, and zone-of-influence layers | vector generation |
| Hydrology, land use, and time series | produces hydrology, LULC, cropping intensity, and NDVI outputs | raster, vector, and time-series generation |
| Terrain, drought, change, tree health, and plantation | produces terrain derivatives, drought outputs, change products, tree-health layers, and plantation suitability | raster and mixed generation |
| Water, drainage, and restoration | produces SWB, ponds, wells, drainage, stream order, restoration, and terrain-water derivatives | raster, vector, and mixed generation |
| Enrichment and planning overlays | adds external planning overlays onto CoRE Stack landscape units | local/tabular data and vector generation |
| Catalog and STAC | publishes or reads catalog metadata for generated layers | catalog publication |

---

## API Path Reference

### Layer Utilities

Use these API paths when you are creating workspaces, managing published layers, checking task status, or syncing metadata between local and production backends.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/create_workspace/` | `POST` | create a GeoServer workspace |
| `/api/v1/delete_layer/` | `POST` | delete a published layer from a workspace |
| `/api/v1/upload_kml/` | `POST` | upload a KML and convert it into server-side geometry |
| `/api/v1/get_layers_in_workspace/` | `GET` | list the layers available in a workspace |
| `/api/v1/get_gee_layer/` | `POST` | fetch or download a GEE-backed layer |
| `/api/v1/gee_task_status/` | `POST` | inspect the status of an Earth Engine task |
| `/api/v1/generate_layer_in_order/` | `POST` | run an ordered layer-generation sequence |
| `/api/v1/layer_status_dashboard/` | `POST` | retrieve layer status dashboard data |
| `/api/v1/sync_layer_remote/` | `POST` | save a computed layer record on a remote backend |
| `/api/v1/update_layer_sync_remote/` | `POST` | update remote sync or STAC flags for a layer |
| `/api/v1/missing_layers/` | `GET` | list missing layers for a workspace |

### Admin Boundaries and MWS

These APIs generate admin boundaries and MWS boundaries that later computations depend on.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/generate_block_layer/` | `POST` | generate the admin boundary layer for a `block/tehsil` |
| `/api/v1/generate_mws_layer/` | `POST` | generate the micro-watershed layer |
| `/api/v1/generate_mws_centroid/` | `POST` | generate centroids for micro-watersheds |
| `/api/v1/generate_mws_connectivity_data/` | `POST` | generate upstream and downstream MWS connectivity data |
| `/api/v1/generate_zoi_data/` | `POST` | generate zone-of-influence data for downstream use |

### Hydrology, land use, and time series

These APIs cover hydrology, LULC generation, cropping intensity, and time-series outputs. They are usually GEE-backed and often save both a computational asset and a published layer.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/hydrology_fortnightly/` | `POST` | run fortnightly hydrology generation |
| `/api/v1/hydrology_annual/` | `POST` | run annual hydrology generation |
| `/api/v1/lulc_for_tehsil/` | `POST` | generate tehsil-level LULC |
| `/api/v1/lulc_v2_river_basin/` | `POST` | generate river-basin LULC v2 |
| `/api/v1/lulc_v3_river_basin/` | `POST` | generate river-basin LULC v3 |
| `/api/v1/lulc_v3/` | `POST` | generate or clip LULC v3 |
| `/api/v1/lulc_vector/` | `POST` | vectorize LULC outputs |
| `/api/v1/lulc_farm_boundary/` | `POST` | compute LULC on farm boundaries |
| `/api/v1/lulc_v4/` | `POST` | run the newer LULC v4 workflow |
| `/api/v1/generate_ci_layer/` | `POST` | generate cropping intensity outputs |
| `/api/v1/generate_ndvi_timeseries/` | `POST` | generate NDVI time-series outputs |

### Terrain, drought, change, tree health, and plantation

These APIs produce terrain descriptors, drought layers, change-detection outputs, tree-health analytics, and plantation site-suitability outputs. They mix raster exports, vectorized products, and project-backed ROIs.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/generate_drought_layer/` | `POST` | generate drought outputs |
| `/api/v1/generate_terrain_descriptor/` | `POST` | generate terrain cluster and descriptor outputs |
| `/api/v1/generate_terrain_raster/` | `POST` | generate clipped terrain rasters |
| `/api/v1/terrain_lulc_slope_cluster/` | `POST` | combine terrain and LULC on slope clusters |
| `/api/v1/terrain_lulc_plain_cluster/` | `POST` | combine terrain and LULC on plain clusters |
| `/api/v1/generate_clart/` | `POST` | generate CLART outputs |
| `/api/v1/fes_clart_layer/` | `POST` | publish or upload FES CLART outputs |
| `/api/v1/change_detection/` | `POST` | generate raster change-detection outputs |
| `/api/v1/change_detection_vector/` | `POST` | vectorize change-detection outputs |
| `/api/v1/crop_grid/` | `POST` | generate crop-grid outputs |
| `/api/v1/tree_health_raster/` | `POST` | generate raster tree-health outputs |
| `/api/v1/tree_health_vector/` | `POST` | generate vector tree-health outputs |
| `/api/v1/mws_drought_causality/` | `POST` | compute drought causality metrics by MWS |
| `/api/v1/plantation_site_suitability/` | `POST` | generate plantation site-suitability raster and project-vector outputs |

### Water, drainage, and restoration layers

These APIs handle surface water, drainage derivatives, restoration, and water-related infrastructure layers. They commonly combine raster-derived signals, vector publication, and MWS-level interpretation.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/generate_swb/` | `POST` | generate surface water body layers |
| `/api/v1/generate_ponds/` | `POST` | generate pond layers |
| `/api/v1/generate_wells/` | `POST` | generate well layers |
| `/api/v1/merge_swb_ponds/` | `POST` | merge SWB and pond outputs |
| `/api/v1/generate_nrega_layer/` | `POST` | clip or generate the NREGA layer |
| `/api/v1/generate_drainage_layer/` | `POST` | clip or generate drainage lines |
| `/api/v1/stream_order/` | `POST` | generate stream-order outputs |
| `/api/v1/restoration_opportunity/` | `POST` | generate restoration-opportunity outputs |
| `/api/v1/generate_natural_depression/` | `POST` | generate natural-depression outputs |
| `/api/v1/generate_distance_nearest_DL/` | `POST` | generate distance-to-nearest drainage-line outputs |
| `/api/v1/generate_catchment_area_singleflow/` | `POST` | generate single-flow catchment-area outputs |
| `/api/v1/generate_slope_percentage/` | `POST` | generate slope-percentage outputs |

### Enrichment and planning overlays

These APIs attach thematic overlays and planning-oriented enrichments onto the core landscape units. They often start from external local, S3, CSV, or vector sources and then publish the filtered result as a CoRE Stack layer.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/aquifer_vector/` | `POST` | generate aquifer vector outputs |
| `/api/v1/soge_vector/` | `POST` | generate SOGE vector outputs |
| `/api/v1/generate_lcw/` | `POST` | generate Land Conflict Watch overlays |
| `/api/v1/generate_agroecological/` | `POST` | generate agroecological space outputs |
| `/api/v1/generate_factory_csr/` | `POST` | generate factory CSR overlays |
| `/api/v1/generate_green_credit/` | `POST` | generate green-credit overlays |
| `/api/v1/generate_mining/` | `POST` | generate mining overlays |
| `/api/v1/generate_facilities_proximity/` | `POST` | generate facilities-proximity outputs |

### Catalog and STAC

These APIs generate or read STAC metadata after layers have been computed. Use them when a layer needs to become discoverable outside the internal application.

| API path | Method | Purpose |
|------|--------|---------|
| `/api/v1/generate_stac_collection/` | `POST` | generate STAC collection or item metadata for a layer |
| `/api/v1/get_stac_catalog/` | `GET` | read a catalog by optional `state`, `district`, and `block` query parameters |
| `/api/v1/stac/` | `GET` | read the root STAC catalog |
| `/api/v1/stac/<state>/` | `GET` | read a state-level STAC collection |
| `/api/v1/stac/<state>/<district>/` | `GET` | read a district-level STAC collection |
| `/api/v1/stac/<state>/<district>/<block>/` | `GET` | read a block-level STAC collection |
| `/api/v1/stac/<state>/<district>/<block>/items/<item_id>/` | `GET` | read one STAC item |

---

## Example Request Bodies

Replace `gee_account_id: 1` with the real account ID from your environment.

=== "Standard block API"

    ```json
    {
      "state": "karnataka",
      "district": "raichur",
      "block": "devadurga",
      "start_year": 2022,
      "end_year": 2023,
      "gee_account_id": 1
    }
    ```

=== "Ordered layer run"

    ```json
    {
      "state": "karnataka",
      "district": "raichur",
      "block": "devadurga",
      "map": "map_1",
      "start_year": 2022,
      "end_year": 2023,
      "gee_account_id": 1
    }
    ```

    The backend reads `map` as a configured map order, such as `map_1`, `map_2_1`, `map_2_2`, `map_3`, or `map_4`.

=== "STAC generation"

    ```json
    {
      "state": "karnataka",
      "district": "raichur",
      "block": "devadurga",
      "layer_name": "lulc_2022_2023",
      "layer_type": "raster",
      "start_year": 2022,
      "upload_to_s3": false,
      "overwrite": false
    }
    ```

=== "Plantation"

    ```json
    {
      "project_id": 12,
      "start_year": 2021,
      "end_year": 2023,
      "gee_account_id": 1
    }
    ```

    Use the project-backed request first.
    The current backend expects project/KML/profile setup for the fuller plantation workflow, and the main raster calculation effectively anchors its window on `end_year - 2`.
