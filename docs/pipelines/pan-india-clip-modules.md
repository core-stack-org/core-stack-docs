# Pan-India Clip Modules (Factory CSR, Green Credit, LCW Conflict, Mining Data)

## Overview

These four modules share an identical **Pan-India Clip Pattern** - they clip pan-India vector datasets to specific block boundaries and synchronize to GEE, GeoServer, and database.

---

# Factory CSR Module

**File:** [`computing/misc/factory_csr.py`](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/factory_csr.py)

## Purpose

Extracts Factory Corporate Social Responsibility (CSR) project locations for specific blocks.

## Data Source
```python
pan_india_asset_id = f"{GEE_EXT_DATASET_PATH}/Factory_CSR_pan_india"
```

## Output

| Platform | Asset/Layer Name | Workspace |
|----------|------------------|-----------|
| GEE | `{district}_{block}_factory_csr` | N/A |
| GeoServer | `{district}_{block}_factory_csr` | `factory_csr` |

**Dataset Name:** `Factory CSR`

---

# Green Credit Module

**File:** [`computing/misc/green_credit.py`](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/green_credit.py)

## Purpose

Extracts Green Credit project locations for specific blocks.

## Data Source
```python
pan_india_asset_id = f"{GEE_EXT_DATASET_PATH}/Green_credit_pan_india"
```

## Output

| Platform | Asset/Layer Name | Workspace |
|----------|------------------|-----------|
| GEE | `{district}_{block}_green_credit` | N/A |
| GeoServer | `{district}_{block}_green_credit` | `green_credit` |

**Dataset Name:** `Green Credit`

---

# LCW Conflict Module

**File:** [`computing/misc/lcw_conflict.py`](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/lcw_conflict.py)

## Purpose

Extracts Land Conflict Watch (LCW) conflict location data for specific blocks.

Primary code surfaces:

- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L1253-L1269)
- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py#L113)
- [computing/misc/lcw_conflict.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/lcw_conflict.py#L22-L79)

## Data Source
```python
pan_india_asset_id = f"{GEE_EXT_DATASET_PATH}/lcw_conflict_pan_india"
```

## Output

| Platform | Asset/Layer Name | Workspace |
|----------|------------------|-----------|
| GEE | `{district}_{block}_lcw_conflict` | N/A |
| GeoServer | `{district}_{block}_lcw_conflict` | `lcw` |

**Dataset Name:** `LCW Conflict`

### Entry Pattern

LCW conflict is a good example of the CoRE Stack "thin API, heavy task" pattern.

```python linenums="1" hl_lines="5-8 9-11" title="computing/api.py"
@api_view(["POST"])
@schema(None)
def generate_lcw(request):
    try:
        state = request.data.get("state").lower()
        district = request.data.get("district").lower()
        block = request.data.get("block").lower()
        gee_account_id = request.data.get("gee_account_id")
        generate_lcw_conflict_data.apply_async(
            args=[state, district, block, gee_account_id], queue="nrm"
        )
        return Response({"Success": "Successfully initiated"})
    except Exception as exc:
        return Response({"Exception": exc})
```

That handler maps to `POST /api/v1/generate_lcw/`, and the queued task then executes the pan-India clip, UID join, GEE export, GeoServer sync, and metadata save.

```python linenums="1" hl_lines="1 15 30-31 38-43" title="computing/misc/lcw_conflict.py"
@app.task(bind=True)
def generate_lcw_conflict_data(self, state, district, block, gee_account_id):
    ee_initialize(gee_account_id)
    roi_asset_id = (
        get_gee_asset_path(state, district, block)
        + "filtered_mws_"
        + valid_gee_text(district.lower())
        + "_"
        + valid_gee_text(block.lower())
        + "_uid"
    )
    pan_india_asset_id = f"{GEE_EXT_DATASET_PATH}/lcw_conflict_pan_india"
    description = f"{valid_gee_text(district.lower())}_{valid_gee_text(block.lower())}_lcw_conflict"
    asset_id = get_gee_asset_path(state, district, block) + description
    roi = ee.FeatureCollection(roi_asset_id)
    pan_india_data = ee.FeatureCollection(pan_india_asset_id)
    clipped_data = pan_india_data.filterBounds(roi.geometry())
    ...
    clipped_data_with_uid = joined_data.map(add_uid)
    task = export_vector_asset_to_gee(clipped_data_with_uid, description, asset_id)
    ...
    if is_gee_asset_exists(asset_id):
        layer_id = save_layer_info_to_db(...)
        make_asset_public(asset_id)
        res = sync_fc_to_geoserver(...)
```

For a new pan-India clip module, this is usually the fastest pattern to copy: keep the route small, keep the pipeline task self-contained, and reuse the shared helpers rather than writing publication code from scratch.

---

# Mining Data Module

**File:** [`computing/misc/mining_data.py`](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/mining_data.py)

## Purpose

Extracts mining site location data for specific blocks.

## Data Source
```python
pan_india_asset_id = f"{GEE_EXT_DATASET_PATH}/Mining_data_pan_india"
```

## Output

| Platform | Asset/Layer Name | Workspace |
|----------|------------------|-----------|
| GEE | `{district}_{block}_mining` | N/A |
| GeoServer | `{district}_{block}_mining` | `mining` |

**Dataset Name:** `Mining`

---

## Shared Architecture

All four modules follow the **Pan-India Clip Pattern**:

```mermaid
flowchart TD
    A[Celery Task Triggered] --> B[ee_initialize]
    B --> C[Build ROI Asset ID]
    C --> D[Load MWS FeatureCollection]
    D --> E[Load Pan-India Data]
    E --> F[Filter by ROI bounds]
    F --> G[Spatial Join with ROI]
    G --> H[Add UID to features]
    H --> I[Export to GEE Asset]
    I --> J[Check Task Status]
    J --> K{Asset Exists?}
    K -->|Yes| L[save_layer_info_to_db]
    L --> M[make_asset_public]
    M --> N[sync_fc_to_geoserver]
    N --> O{Success?}
    O -->|Yes| P[Update sync status]
    P --> Q[Return True]
```

## Shared Processing Logic

### 1. ROI Definition
```python
roi_asset_id = (
    get_gee_asset_path(state, district, block)
    + "filtered_mws_"
    + valid_gee_text(district.lower())
    + "_"
    + valid_gee_text(block.lower())
    + "_uid"
)
```

### 2. Spatial Filter
```python
clipped_data = pan_india_data.filterBounds(roi.geometry())
```

### 3. Spatial Join (Add UID)
```python
spatial_filter = ee.Filter.intersects(
    leftField=".geo", rightField=".geo", maxError=1
)

join = ee.Join.saveFirst(matchKey="roi_match")
joined_data = join.apply(clipped_data, roi, spatial_filter)

def add_uid(feature):
    feature = ee.Feature(feature)
    roi_match = ee.Feature(feature.get("roi_match"))
    uid = roi_match.get("uid")
    return feature.set("uid", uid).set("roi_match", None)

clipped_data_with_uid = joined_data.map(add_uid)
```

## Shared Integration Points

```
All Four Modules
├── computing.utils
│   ├── sync_fc_to_geoserver()    # GeoServer sync
│   ├── save_layer_info_to_db()   # Database persistence
│   └── update_layer_sync_status() # Status tracking
├── utilities.gee_utils
│   ├── ee_initialize()           # GEE authentication
│   ├── valid_gee_text()          # Text sanitization
│   ├── check_task_status()       # Task monitoring
│   ├── make_asset_public()       # ACL management
│   ├── is_gee_asset_exists()     # Asset existence check
│   ├── export_vector_asset_to_gee() # Vector export
│   └── get_gee_asset_path()      # Asset path generation
└── utilities.constants
    └── GEE_EXT_DATASET_PATH      # External dataset path
```

## Usage Pattern

All four modules use identical invocation:

```python
# Factory CSR
from computing.misc.factory_csr import generate_factory_csr_data
result = generate_factory_csr_data.delay(state, district, block, gee_account_id)

# Green Credit
from computing.misc.green_credit import generate_green_credit_data
result = generate_green_credit_data.delay(state, district, block, gee_account_id)

# LCW Conflict
from computing.misc.lcw_conflict import generate_lcw_conflict_data
result = generate_lcw_conflict_data.delay(state, district, block, gee_account_id)

# Mining Data
from computing.misc.mining_data import generate_mining_data
result = generate_mining_data.delay(state, district, block, gee_account_id)
```

## Dependencies

- **ee** (Google Earth Engine Python API)
- **Celery** - Distributed task queue
