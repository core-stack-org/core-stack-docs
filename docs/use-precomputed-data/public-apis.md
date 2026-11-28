# Public APIs

This page is a one-stop path if you want to authenticate, explore, and consume CoRE Stack's precomputed public geospatial data using the **v1** and **v2** REST APIs.

---

## 1. Authentication

Authenticate Dataset and Waterbody API requests by sending your API key in the `X-API-Key` header on every request:

```http
X-API-Key: <your-api-key>
```

You can create an API key either through the **CoRE Stack Dashboard** (including account registration) or programmatically via the **Auth APIs**.

=== "Dashboard (Register & Generate Key)"

    Use this flow if you are creating a new account or prefer managing keys in the browser:

    1. [Register or sign in at dashboard.core-stack.org](https://dashboard.core-stack.org/){ .md-button .md-button--primary }
    2. Generate an API key from your dashboard account.
    3. Send that key as the `X-API-Key` header on every Dataset and Waterbody API request.

=== "API Authentication (JWT → API Key)"

    If you already have a CoRE Stack account (`username` and `password`), you can generate or deactivate API keys programmatically using the Auth APIs documented on [api-doc.core-stack.org](https://api-doc.core-stack.org/):

    **Step 1 — Create a session (get a JWT `access` token)**

    `POST https://geoserver.core-stack.org/api/v1/auth/login/`

    ```bash
    curl -X POST "https://geoserver.core-stack.org/api/v1/auth/login/" \
      -H "Content-Type: application/json" \
      -d '{"username": "<your-username>", "password": "<your-password>"}'
    ```

    Returns `access`, `refresh`, and `user`. Tokens expire; call this endpoint again for a new pair.

    **Step 2 — Create an API key**

    `POST https://geoserver.core-stack.org/api/v1/generate_api_key/`

    Send `Authorization: Bearer <access>` from Step 1. Pass an empty JSON body `{}` or optionally specify `name` and `expiry_days` (default `3000` days):

    ```bash
    curl -X POST "https://geoserver.core-stack.org/api/v1/generate_api_key/" \
      -H "Authorization: Bearer <access-token>" \
      -H "Content-Type: application/json" \
      -d '{"name": "Partner integration key", "expiry_days": 3000}'
    ```

    Returns `data.api_key`. Copy that value and pass it as `X-API-Key: <your-api-key>` on subsequent requests.

    !!! note "Deactivating a key"
        To revoke an existing key, call `POST /api/v1/generate_api_key/` with `Authorization: Bearer <access>` and body `{"action": "deactivate", "user_id": <id>, "api_key": "<key>"}`.

---

## 2. Base URL, Versions (v1 vs v2) & Interactive Docs

**Base URL:** `https://geoserver.core-stack.org`

Two interactive references are available:

- [ReDoc (api-doc.core-stack.org)](https://api-doc.core-stack.org/): best for reading grouped Auth, v1, and v2 API paths, parameters, and response schemas.
- [Swagger](https://geoserver.core-stack.org/swagger/){ .md-button .md-button--primary } — quick in-browser API tryout.

### API Version Comparison

| Version | Prefix | Response format | Error format | Recommended for |
| --- | --- | --- | --- | --- |
| **v1** | `/api/v1/` | Raw JSON (top-level object or GeoJSON `FeatureCollection`) | `{"error": "..."}` | Existing integrations |
| **v2** | `/api/v2/` | Standardized envelope `{status, error_message, data}` with units, hints, and legends | `{status, error_message, data}` | **New integrations** |

### Key v2 Enhancements

- **Envelope & metadata:** Every v2 response wraps results in `{status, error_message, data}` and includes field hints, units (e.g., `fortnight_units`, `indicator_units`, `layer_field_units`), and code-to-label `indicator_legends`.
- **Filtered active locations:** `GET /api/v2/get_active_locations/` accepts optional `state`, `district`, and `tehsil` (alias `block`) query filters.
- **Selective tehsil sheets:** `GET /api/v2/get_tehsil_data/` accepts `data=all` (default) or comma-separated / repeated sheet names such as `data=croppingdrought_kharif,stream_order`.
- **Field filtering:** `GET /api/v2/get_mws_data/` (`fields=et,precipitation`) and `GET /api/v2/get_mws_kyl_indicators/` (`fields=area,drought_category`) let you request only the metrics you need.
- **Aligned hydrology time series:** `GET /api/v2/get_mws_data/` returns aligned ~15-day arrays in `data.fortnight` (`time`, `et`, `runoff`, `precipitation`) with `data.fortnight_units`, instead of the v1 `time_series` row list.
- **Single-feature geometry lookup:** `GET /api/v2/get_mws_geometries/` accepts optional `mws_id`, and `GET /api/v2/get_village_geometries/` accepts optional `village_id`. Geometry `data` is a GeoJSON `FeatureCollection` you can open directly in QGIS.

---

## 3. Public API Endpoints

### Auth APIs

| Method & Path | Summary | Auth / Parameters |
| --- | --- | --- |
| `POST /api/v1/auth/login/` | Create a session and return JWT `access`, `refresh`, and `user` | Body: `username`, `password` |
| `POST /api/v1/generate_api_key/` | Create (or deactivate) an `X-API-Key` | Header: `Authorization: Bearer <access>`; Body: `{}` or `name`, `expiry_days` (or `action="deactivate"`, `user_id`, `api_key`) |

### Dataset APIs (v1 & v2)

All Dataset APIs require `X-API-Key: <your-api-key>`. Use `/api/v2/` for new integrations; `/api/v1/` remains available for existing clients.

| v2 Path (Recommended) | v1 Path (Legacy) | What it does | Key parameters & v2 additions | Source |
| --- | --- | --- | --- | --- |
| `GET /api/v2/get_active_locations/` | `GET /api/v1/get_active_locations/` | List tehsils with precomputed datasets | v2 adds optional `state`, `district`, `tehsil` (alias `block`) filters | [get_active_locations()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L404-L423) |
| `GET /api/v2/get_admin_details_by_latlon/` | `GET /api/v1/get_admin_details_by_latlon/` | Retrieve `State`, `District`, `Tehsil` for a WGS84 point | `latitude`, `longitude`; v2 returns `admin_details` + `admin_field_hints` | [get_admin_details_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L88) |
| `GET /api/v2/get_mwsid_by_latlon/` | `GET /api/v1/get_mwsid_by_latlon/` | Retrieve the micro-watershed ID (`uid` / `mws_id`) for a point | `latitude`, `longitude`; v2 returns `mws_details` + `mws_field_hints` | [get_mws_by_lat_lon()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L91-L131) |
| `GET /api/v2/get_tehsil_data/` | `GET /api/v1/get_tehsil_data/` | List analytical sheets for a tehsil (drought, hydrology, LULC, NREGA, etc.) | `state`, `district`, `tehsil`; v2 adds optional `data=` sheet filter (e.g. `data=croppingdrought_kharif,stream_order`) | [generate_tehsil_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L186-L235) |
| `GET /api/v2/get_mws_data/` | `GET /api/v1/get_mws_data/` | Retrieve hydrology time series (ET, runoff, precipitation) for one MWS | `state`, `district`, `tehsil`, `mws_id`; v2 adds optional `fields=` and returns aligned `data.fortnight` + `fortnight_units` | [get_mws_data()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L134-L183) |
| `GET /api/v2/get_mws_kyl_indicators/` | `GET /api/v1/get_mws_kyl_indicators/` | Retrieve single-row KYL indicator snapshot for one MWS | `state`, `district`, `tehsil`, `mws_id`; v2 adds optional `fields=`, `indicator_units`, and `indicator_legends` | [get_mws_json_by_kyl_indicator()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L238-L296) |
| `GET /api/v2/get_generated_layer_urls/` | `GET /api/v1/get_generated_layer_urls/` | List generated GeoServer WFS/WCS layer URLs for a tehsil | `state`, `district`, `tehsil`; v2 returns `layers` + `layer_field_units` | [get_generated_layer_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L299-L329) |
| `GET /api/v2/get_mws_report/` | `GET /api/v1/get_mws_report/` | Retrieve PDF/HTML report URL for one MWS | `state`, `district`, `tehsil`, `mws_id`; v2 returns `report.Mws_report_url` + `report_field_hints` | [get_mws_report_urls()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L343-L399) |
| `GET /api/v2/get_mws_geometries/` | `GET /api/v1/get_mws_geometries/` | List micro-watershed polygons (GeoJSON `FeatureCollection`) | `state`, `district`, `tehsil`; v2 adds optional `mws_id` to fetch a single feature | [get_mws_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L428-L455) |
| `GET /api/v2/get_village_geometries/` | `GET /api/v1/get_village_geometries/` | List village / panchayat polygons (GeoJSON `FeatureCollection`) | `state`, `district`, `tehsil`; v2 adds optional `village_id` to fetch a single feature | [get_village_geometries()](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L460-L487) |

### Waterbody APIs (v1 & v2)

Remotely sensed surface waterbody inventories and zone-of-influence (`zoi`) indicators (see [API Metadata — Waterbody APIs](api-metadata.md#waterbody-apis) for field definitions):

| v2 Path (Recommended) | v1 Path (Legacy) | What it does | Parameters |
| --- | --- | --- | --- |
| `GET /api/v2/get_waterbodies_data_by_admin/` | `GET /api/v1/get_waterbodies_data_by_admin/` | List every remotely sensed surface waterbody in a tehsil (including `UID`, `MWS_UID`, area, `zoi`, and `zoi_properties`) | `state`, `district`, `tehsil`, optional `regenerate` (`true`/`1`/`yes`) |
| `GET /api/v2/get_waterbody_data/` | `GET /api/v1/get_waterbody_data/` | Retrieve one remotely sensed waterbody by `uid` | `state`, `district`, `tehsil`, `uid`, optional `regenerate` (`true`/`1`/`yes`) |

### Important Behavior & Error Handling

- **Boundary micro-watershed de-duplication:** A tehsil includes all micro-watersheds that overlap its boundary. When aggregating across multiple tehsils (for example, district- or state-level analysis), **de-duplicate rows and features on `uid` / `mws_id`** so boundary watersheds are not counted twice.
- **Zero-occurrence defaults (`forest_fire` and `mining`):** When a micro-watershed has no recorded forest fires or mining sites, `forest_fire` (including KYL `fire_count_per_year`) and `mining` return `0` with `200 OK` rather than `-9999`, `null`, or missing-sheet errors.
- **Pan-India MWS lookup fallback (`get_mwsid_by_latlon`):** Queries the per-tehsil GeoServer WFS layer first for active locations, and automatically falls back to the spatially indexed pan-India micro-watershed layer when a per-tehsil layer is not yet published.
- **Published layers only (`get_generated_layer_urls`):** Only layers synced to GeoServer are returned. If layers are not yet published for a location, the API returns `404` (`LAYER_NOT_PUBLISHED` on v2) with: *"Layers are not yet published for this state, district, tehsil. The layers will soon be available."*
- **Fortnightly hydrology fallback (`get_mws_data`):** If the fortnightly layer is not published for a tehsil, `get_mws_data` returns `404` (`LAYER_NOT_PUBLISHED`) with `details.fallback: "get_tehsil_data?data=hydrological_seasonal"`.
- **Structured error codes:** Missing generated stats on `get_mws_kyl_indicators` / `get_mws_report` return `404` (`DATA_NOT_GENERATED`), and GeoServer timeouts or upstream 5xx responses return `502` (`UPSTREAM_UNAVAILABLE`) instead of empty `200 OK` responses. See [API Errors Reference](../reference/api-errors.md) for details.

---

## 4. Recommended API Workflow

Follow this sequence to go from discovery to analysis (using `/api/v2/` for new integrations, or `/api/v1/` for existing ones):

1. **List active locations** — Call `GET /api/v2/get_active_locations/` (optionally filtered by `state`, `district`, `tehsil`) to see which tehsils already have precomputed data. To request a new tehsil, use the [Geospatial Data Request Form](https://dashboard.core-stack.org/locationForm/).
2. **Resolve coordinates (optional)** — If you start from a point, call `GET /api/v2/get_admin_details_by_latlon/` or `GET /api/v2/get_mwsid_by_latlon/` to get exact `state`, `district`, `tehsil`, and `uid` (`mws_id`) values.
3. **Fetch layers, geometries, or analytical tables** — Pass those exact place names and `mws_id` to the dataset or waterbody routes below.

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

Call `GET /api/v2/get_generated_layer_urls/` (or `/api/v1/get_generated_layer_urls/`) and inspect:

- `dataset_name`
- `layer_type`
- `layer_url`
- `style_url`
- `gee_asset_path`

The output URL provides several ways to download and utilise the data:

- direct download
- QGIS loading
- GeoServer-backed clients
- Earth Engine-oriented follow-up work

### Fetch stable geometries

Use:

- `GET /api/v2/get_mws_geometries/` (or `/api/v1/get_mws_geometries/`)
- `GET /api/v2/get_village_geometries/` (or `/api/v1/get_village_geometries/`)

The main practical join key to watch for is `uid` on micro-watershed-aligned outputs.

### Fetch analytical tables

Use:

- `GET /api/v2/get_tehsil_data/` for tehsil-wide analytical tables keyed by watershed identifiers (optionally filtered with `data=`)
- `GET /api/v2/get_mws_data/` for one watershed time series
- `GET /api/v2/get_mws_kyl_indicators/` for a compact watershed snapshot
- `GET /api/v2/get_mws_report/` for report handoff URLs

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
