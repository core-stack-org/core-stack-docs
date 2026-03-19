---
title: Computing API Endpoints
description: Route-oriented view of the CoRE Stack Computing API, with links into the pipeline families each route belongs to.
---

# Computing API Endpoints

The Computing API is the developer-facing surface that triggers CoRE Stack computations.

Primary sources:

- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)
- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)

Most handlers queue work and return quickly while pipeline modules do the heavy processing.

---

## Before You Use These Routes

Many request bodies include `gee_account_id`.

That value should refer to a Django `GEEAccount` configured in your environment, as documented in [Google Earth Engine](../developers/integrations/google-earth-engine.md).

If you are new to backend execution, start with:

- [Installer](../developers/installer.md)
- [First Manual API Run](../developers/first-manual-api-run.md)
- [Local Pipeline First](../developers/local-pipeline-first.md)

---

## Repeated Route Pattern

```python linenums="1" hl_lines="4-7 8-10" title="Typical Computing API shape"
@api_view(["POST"])
@schema(None)
def generate_example(request):
    state = request.data.get("state").lower()  # (1)!
    district = request.data.get("district").lower()
    block = request.data.get("block").lower()
    gee_account_id = request.data.get("gee_account_id")
    generate_example_task.apply_async(         # (2)!
        args=[state, district, block, gee_account_id], queue="nrm"
    )
    return Response({"Success": "Successfully initiated"})  # (3)!
```

1. parse and normalize the request
2. delegate heavy work to the real computation boundary
3. return quickly

---

## Complete Route Inventory

The current `computing/urls.py` inventory contains `58` routes under `/api/v1/`.

Most of them are `POST` routes. The main `GET` exception is:

- `GET /api/v1/get_layers_in_workspace/`

### Workspace, publication, and status

Use these routes when you are creating workspaces, managing published layers, or checking backend task status. Read this section with [Pipeline Integrations](../pipelines/pipeline-integrations.md), [GeoServer](../developers/integrations/geoserver.md), and [Google Earth Engine](../developers/integrations/google-earth-engine.md).

| Route | Method | Purpose |
|------|--------|---------|
| `/api/v1/create_workspace/` | `POST` | create a GeoServer workspace |
| `/api/v1/delete_layer/` | `POST` | delete a published layer from a workspace |
| `/api/v1/upload_kml/` | `POST` | upload a KML and convert it into server-side geometry |
| `/api/v1/get_layers_in_workspace/` | `GET` | list the layers available in a workspace |
| `/api/v1/get_gee_layer/` | `POST` | fetch or download a GEE-backed layer |
| `/api/v1/gee_task_status/` | `POST` | inspect the status of an Earth Engine task |
| `/api/v1/generate_layer_in_order/` | `POST` | run an ordered layer-generation sequence |
| `/api/v1/layer_status_dashboard/` | `POST` | retrieve layer status dashboard data |

### Boundary and MWS scaffolding

These routes create the spatial scaffolding that later computations depend on. Read this section with [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md), [Admin Boundary](../pipelines/admin-boundary.md), and [How Our Pipelines Work Algorithmically](../pipelines/how-pipelines-work-algorithmically.md).

| Route | Method | Purpose |
|------|--------|---------|
| `/api/v1/generate_block_layer/` | `POST` | generate the admin boundary layer for a block or tehsil |
| `/api/v1/generate_mws_layer/` | `POST` | generate the micro-watershed layer |
| `/api/v1/generate_mws_centroid/` | `POST` | generate centroids for micro-watersheds |
| `/api/v1/generate_mws_connectivity_data/` | `POST` | generate upstream and downstream MWS connectivity data |
| `/api/v1/generate_zoi_data/` | `POST` | generate zone-of-influence data for downstream use |

### Hydrology, land use, and time series

These routes cover hydrology, LULC generation, cropping intensity, and time-series outputs. Read this section with [Hydrology](../pipelines/hydrology.md), [LULC Generation](../pipelines/lulc-generation.md), and [NDVI Time Series](../pipelines/ndvi-time-series.md).

| Route | Method | Purpose |
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

### Terrain, drought, change, and tree health

These routes produce terrain descriptors, drought layers, change-detection outputs, and tree-health analytics. Read this section with [Terrain Analysis](../pipelines/terrain-analysis.md), [How Our Pipelines Work Algorithmically](../pipelines/how-pipelines-work-algorithmically.md), and [Raster and Drainage Layers](../pipelines/raster-and-drainage/index.md).

| Route | Method | Purpose |
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
| `/api/v1/plantation_site_suitability/` | `POST` | generate plantation site-suitability outputs |

### Water, drainage, and restoration layers

These routes handle surface water, drainage derivatives, restoration, and water-related infrastructure layers. Read this section with [SWB Detection](../pipelines/swb-detection.md), [Drainage Lines](../pipelines/drainage-lines.md), [Restoration Opportunity](../pipelines/restoration-opportunity.md), and [NREGA Assets](../pipelines/nrega-assets.md).

| Route | Method | Purpose |
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

These routes attach thematic overlays and planning-oriented enrichments onto the core landscape units. Read this section with [Boundary and Enrichment Layers](../pipelines/boundary-and-enrichment/index.md), [Agroecological Space](../pipelines/agroecological-space.md), [Aquifer Vector](../pipelines/aquifer-vector.md), [SOGE Vector](../pipelines/soge-vector.md), and [Facilities Proximity](../pipelines/facilities-proximity.md).

| Route | Method | Purpose |
|------|--------|---------|
| `/api/v1/aquifer_vector/` | `POST` | generate aquifer vector outputs |
| `/api/v1/soge_vector/` | `POST` | generate SOGE vector outputs |
| `/api/v1/generate_lcw/` | `POST` | generate Land Conflict Watch overlays |
| `/api/v1/generate_agroecological/` | `POST` | generate agroecological space outputs |
| `/api/v1/generate_factory_csr/` | `POST` | generate factory CSR overlays |
| `/api/v1/generate_green_credit/` | `POST` | generate green-credit overlays |
| `/api/v1/generate_mining/` | `POST` | generate mining overlays |
| `/api/v1/generate_facilities_proximity/` | `POST` | generate facilities-proximity outputs |

---

## Example Request Bodies

Replace `gee_account_id: 1` with the real account ID from your environment.

=== "Hydrology"

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

=== "LULC"

    ```json
    {
      "state": "karnataka",
      "district": "raichur",
      "block": "devadurga",
      "start_year": 2022,
      "end_year": 2023,
      "gee_account_id": 1,
      "version": "v3"
    }
    ```

=== "SWB"

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

---

## What Happens After Submission

The common execution sequence is:

1. route declared in `computing/urls.py`
2. request handled in `computing/api.py`
3. task or callable computation boundary invoked
4. pipeline module runs
5. results move toward metadata, GeoServer, or public delivery surfaces

---

## Next Paths

- [Computation Registry](../pipelines/computation-registry.md)
- [How They Work Programmatically](../pipelines/how-pipelines-work-programmatically.md)
- [First Manual API Run](../developers/first-manual-api-run.md)
- [Local Pipeline First](../developers/local-pipeline-first.md)
- [Pipeline Integrations](../pipelines/pipeline-integrations.md)
