# Public APIs

This page is a one-stop path if you simply want to access and use CoRE Stack public data:

---

## 1. Generate An API Key

For public dataset access:

1. [Register or sign in at dashboard.core-stack.org](https://dashboard.core-stack.org/){ .md-button .md-button--primary }
2. Generate an API key from the dashboard
3. Send it as the `X-API-Key` header on `public_api` APIs

---

## 2. Inspect The Public Data

Two direct tools are useful here:

- [ReDoc](https://api-doc.core-stack.org/): better for reading grouped API paths and schema details carefully.
- [Swagger](https://geoserver.core-stack.org/swagger/){ .md-button .md-button--primary }
**Quick API call Tryout!**

---

## 3. Public API Endpoints

This is the practical pattern for moving from discovery to analysis with the public data APIs.

| API path | What it does | Source |
|------|---------------|--------|
| `GET /api/v1/get_admin_details_by_latlon/` | state, district, tehsil for a coordinate | [get_admin_details_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L88) |
| `GET /api/v1/get_mwsid_by_latlon/` | MWS identifier for a coordinate | [get_mws_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L91-L131) |
| `GET /api/v1/get_tehsil_data/` | tehsil JSON derived from stats spreadsheets | [generate_tehsil_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L186-L235) |
| `GET /api/v1/get_mws_data/` | MWS time-series data | [get_mws_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L134-L183) |
| `GET /api/v1/get_mws_kyl_indicators/` | KYL indicator subset for one MWS | [get_mws_json_by_kyl_indicator()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L238-L296) |
| `GET /api/v1/get_generated_layer_urls/` | generated vector or raster layer URLs | [get_generated_layer_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L299-L329) |
| `GET /api/v1/get_mws_report/` | report URL for one MWS | [get_mws_report_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L343-L399) |
| `GET /api/v1/get_active_locations/` | activated location inventory | [get_active_locations()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L404-L423) |
| `GET /api/v1/get_mws_geometries/` | MWS geometries via GeoServer | [get_mws_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L428-L455) |
| `GET /api/v1/get_village_geometries/` | village geometries via GeoServer | [get_village_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L460-L487) |

---

## 4. Recommended API Workflow

- `GET /api/v1/get_active_locations/` if you want only places currently active in the public surface

## Example Notebooks

These Colab notebooks are a good first step after you have an API key. They show how to turn CoRE Stack API responses into actual analysis, charts, and geospatial outputs.

### Water Balance Analysis

[Open the Water Balance Analysis notebook](https://colab.research.google.com/drive/1uZH1KZFbe0TUIgCECOz_2cQ1jUfZglsA?usp=sharing#scrollTo=K26lCyd3u93J){ .md-button .md-button--primary }

This notebook starts from latitude and longitude, queries the CoRE Stack API, and retrieves high-resolution GeoJSON with hydrological variables such as precipitation, runoff, evapotranspiration, and change in groundwater storage.

The main idea is to treat `delta G` as the annual water account of a watershed: positive years suggest recharge, while negative years point toward depletion. It is a practical starting point for water-security planning, watershed comparison, and questions such as "where is rainfall becoming usable storage, and where is it being lost?"

### Cropping Intensity Analysis

[Open the Cropping Intensity Analysis notebook](https://colab.research.google.com/drive/1zv9TWdzfaEanE_i1kKw2Cr2snoCEhuIg?usp=sharing){ .md-button .md-button--primary }

This notebook fetches MWS identifiers and uses the annual cropping-intensity dataset to inspect how land use changes across seasons and years.

It breaks agricultural use into single-cropped, double-cropped, and triple-cropped percentages, making it useful for irrigation assessment, food-security analysis, agricultural change detection, and understanding the pulse of a region over time.

### Inventory the published layers

Call `GET /api/v1/get_generated_layer_urls/` and inspect:

- `dataset_name`
- `layer_type`
- `layer_url`
- `style_url`
- `gee_asset_path`

The output url provides several ways to download and utilise the data:

- direct download
- QGIS loading
- GeoServer-backed clients
- Earth Engine-oriented follow-up work

### Fetch stable geometries

Use:

- `GET /api/v1/get_mws_geometries/`
- `GET /api/v1/get_village_geometries/`

The main practical join key to watch for is `uid` on micro-watershed-aligned outputs.

### Fetch analytical tables

Use:

- `GET /api/v1/get_tehsil_data/` for tehsil-wide analytical tables keyed by watershed identifiers
- `GET /api/v1/get_mws_data/` for one watershed time series
- `GET /api/v1/get_mws_kyl_indicators/` for a compact watershed snapshot
- `GET /api/v1/get_mws_report/` for report handoff URLs

### Join by `uid`

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

---

## 5. Installer Helper And Testing

The backend repo ships a standard-library helper at [installation/public_api_client.py](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/public_api_client.py).

It is useful when you want one of these:

- a minimal public API test
- active-location inspection
- fuzzy name resolution against the active hierarchy
- bulk download of tehsil, village, MWS, and layer payloads

The installer can test the same surface automatically during `public_api_check` if `PUBLIC_API_X_API_KEY` is configured in `nrm_app/.env`.

Common commands:

```bash
# Minimal smoke test
python installation/public_api_client.py smoke-test

# Resolve misspelled names using the active hierarchy
python installation/public_api_client.py resolve \
  --state bihar \
  --district jamu \
  --tehsil jami

# Download everything for one tehsil
python installation/public_api_client.py download \
  --state assam \
  --district cachar \
  --tehsil lakhipur

# Resolve the containing tehsil from a point first
python installation/public_api_client.py download \
  --latitude 24.79 \
  --longitude 92.79
```

Important runtime details:

- it is standard-library only, so it does not depend on `corestackenv`
- it can read credentials from `--api-key`, environment variables, or an optional env file
- broad state or district downloads expand across activated tehsils and write aggregated metadata as well as per-tehsil output folders
