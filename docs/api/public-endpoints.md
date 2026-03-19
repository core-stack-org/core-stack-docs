# Public API Endpoints

This page documents the public-facing endpoints that are already present in the backend codebase.

Use it together with:

- [Get Public API Access](authentication.md)
- [Swagger / ReDoc](api-explorer.md)
- [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md)
- [STAC Specs](stac-specs.md)
- [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)

There are two useful groups:

1. auth-free geography discovery
2. API-key public data access

If you want a visual explorer first, use:

- [Swagger](https://geoserver.core-stack.org/swagger/)
- [ReDoc](https://api-doc.core-stack.org/)

---

## 1. Auth-Free Geography Discovery

Routes:

- [geoadmin/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/urls.py#L5-L12)
- [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L79)

| Route | What it returns | Source |
|------|------------------|--------|
| `GET /api/v1/get_states/` | all states with normalized names | [get_states()](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L34) |
| `GET /api/v1/get_districts/<state_id>/` | districts for one state | [get_districts()](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L37-L52) |
| `GET /api/v1/get_blocks/<district_id>/` | blocks or tehsils for one district | [get_blocks()](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L55-L70) |
| `GET /api/v1/proposed_blocks/` | activated or proposed locations | [proposed_blocks()](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L73-L84) |

Examples:

```bash
curl https://geoserver.core-stack.org/api/v1/get_states/
```

```bash
curl https://geoserver.core-stack.org/api/v1/get_districts/29/
```

---

## 2. API-Key Public Data Access

Routes:

- [public_api/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/urls.py#L4-L34)
- [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L487)

All routes in this section use:

```http
X-API-Key: YOUR_API_KEY
```

That requirement comes from [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L143-L161).

| Route | What it does | Source |
|------|---------------|--------|
| `GET /api/v1/get_admin_details_by_latlon/` | state, district, tehsil for a coordinate | [get_admin_details_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L88) |
| `GET /api/v1/get_mwsid_by_latlon/` | MWS identifier for a coordinate | [get_mws_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L91-L131) |
| `GET /api/v1/get_tehsil_data/` | tehsil JSON derived from stats spreadsheets | [generate_tehsil_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L186-L235) |
| `GET /api/v1/get_mws_data/` | MWS time-series data | [get_mws_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L134-L183) |
| `GET /api/v1/get_mws_kyl_indicators/` | KYL indicator subset for one MWS | [get_mws_json_by_kyl_indicator()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L238-L296) |
| `GET /api/v1/get_generated_layer_urls/` | generated vector or raster layer URLs | [get_generated_layer_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L299-L329) |
| `GET /api/v1/get_mws_report/` | report URL for one MWS | [get_mws_report_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L343-L399) |
| `GET /api/v1/get_active_locations/` | activated location inventory | [generate_active_locations()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L404-L423) |
| `GET /api/v1/get_mws_geometries/` | MWS geometries via GeoServer | [get_mws_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L428-L455) |
| `GET /api/v1/get_village_geometries/` | village geometries via GeoServer | [get_village_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L460-L487) |

---

## Generated Layer URL Payloads

The response builder for generated layers is in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L56-L114).

Each layer entry is assembled from backend models and includes:

- `layer_name`
- `dataset_name`
- `layer_type`
- `layer_url`
- `layer_version`
- `style_url`
- `gee_asset_path`

Example:

```bash
curl \
  -H "X-API-Key: YOUR_API_KEY" \
  "https://geoserver.core-stack.org/api/v1/get_generated_layer_urls/?state=karnataka&district=raichur&tehsil=devadurga"
```

---

## A Practical Route Through The Public Data

This is the practical pattern for moving from discovery to analysis with the public data APIs.

### 1. Discover a real place

Use either:

- [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md) if you need state or district names
- `GET /api/v1/get_active_locations/` if you want only places currently active in the public surface

### 2. Inventory the published layers

Call `GET /api/v1/get_generated_layer_urls/` and inspect:

- `dataset_name`
- `layer_type`
- `layer_url`
- `style_url`
- `gee_asset_path`

Those fields are the main handoff points into:

- direct download
- QGIS loading
- GeoServer-backed clients
- Earth Engine-oriented follow-up work

### 3. Fetch stable geometries

Use:

- `GET /api/v1/get_mws_geometries/`
- `GET /api/v1/get_village_geometries/`

The main practical join key to watch for is `uid` on micro-watershed-aligned outputs.

### 4. Fetch analytical tables

Use:

- `GET /api/v1/get_tehsil_data/` for tehsil-wide analytical tables keyed by watershed identifiers
- `GET /api/v1/get_mws_data/` for one watershed time series
- `GET /api/v1/get_mws_kyl_indicators/` for a compact watershed snapshot
- `GET /api/v1/get_mws_report/` for report handoff URLs

### 5. Join by `uid`

That is the central reuse pattern:

```python
geometries = fetch_mws_geometries(...)
tehsil_data = fetch_tehsil_data(...)
metric_table = build_metric_table(tehsil_data)
joined_geojson = join_metrics_to_geojson(geometries, metric_table)
```

In other words:

1. choose a stable geometry layer
2. choose an analytical table
3. join through the watershed identifier
4. visualize, rank, or export

### 6. Keep an example script nearby

If you want a local reproducible example of that workflow, use:

- [`data-use-lessons.py`](https://github.com/core-stack-org/core-stack-docs/blob/main/data-use-lessons.py)

Use it as a reproducible companion script for the endpoint flow described here.

---

## Geometry Routes

The geometry helpers ultimately call GeoServer-backed WFS endpoints from [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L412-L519).

That makes these routes especially useful for:

- UI teams that need polygons quickly
- researchers who want MWS or village geometry dumps
- data users building custom download or visualization pipelines

---

## See Also

- [Get Public API Access](authentication.md)
- [Computing API Endpoints](computing-endpoints.md)
- [Swagger / ReDoc](api-explorer.md)
- [STAC Specs](stac-specs.md)
- [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)
