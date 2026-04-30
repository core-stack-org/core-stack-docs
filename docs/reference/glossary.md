# Glossary

This page is a reference for CoRE Stack terms, common request fields, spectral indices, and raster band vocabulary. It will grow into a broader field and layer dictionary over time.

---

## Core CoRE Stack Terms

**MWS**
: Micro-Watershed. A small watershed unit used for planning, hydrology, and reporting.

**LULC**
: Land Use Land Cover. A classification of how land is being used and what physically covers it.

**SWB**
: Surface Water Body. A mapped pond, tank, lake, or related water feature.

**STAC**
: SpatioTemporal Asset Catalog. A standard way to describe and discover geospatial assets and metadata.

**GEE**
: Google Earth Engine. A cloud platform for large-scale geospatial analysis.

**GeoServer**
: A server used to publish geospatial layers and services such as WMS and WFS.

**JWT**
: JSON Web Token. A signed bearer token used for authenticated API access.

**API key**
: A simpler credential, often sent as `X-API-Key`, for selected public data APIs.

**Local-First**
: A mode or design goal where users can inspect, fetch, and process data locally instead of depending entirely on cloud execution.

---

## Common Request and Dataset Fields

These are starter meanings for fields that appear repeatedly across current docs and API examples.

| Field | Meaning | Typical use |
|-------|---------|-------------|
| `state` | State name | spatial filtering and task submission |
| `district` | District name | spatial filtering and task submission |
| `tehsil` or `block` | Tehsil, sub-district or block name | public data queries and layer discovery |
| `latitude` | North-south coordinate | point-based lookup APIs |
| `longitude` | East-west coordinate | point-based lookup APIs |
| `start_year` | first year in an analysis window | temporal compute jobs |
| `end_year` | last year in an analysis window | temporal compute jobs |
| `gee_account_id` | backend-side Earth Engine account reference | GEE-backed computations |
| `layer_url` | a published layer endpoint or derived layer link | map consumption and download flows |
| `geojson_path` | stored path or JSON reference to geometry data | projects and vector outputs |
| `app_type` | project application domain, such as `watershed` | project and organization workflows |

!!! note
    This is not yet a full schema dictionary for every layer. We will extend this section with field-by-field layer and dataset tables as those references are stabilized.

---

## Geospatial Concepts

**Raster**
: A grid of pixels or cells, where each cell stores a value such as reflectance, elevation, or class.

**Vector**
: Geometry-based data represented as points, lines, or polygons.

**CRS**
: Coordinate Reference System. Defines how coordinates map onto the earth.

**EPSG code**
: A standard numeric identifier for a CRS, such as `EPSG:4326`.

**DEM**
: Digital Elevation Model. A raster representing elevation.

**Spectral index**
: A derived value computed from one or more raster bands to highlight a property such as vegetation vigor or water.

**False color composite**
: An image where displayed colors do not match natural human vision, often used to emphasize vegetation or moisture.

**Runoff**
: Water that flows across land after rainfall instead of infiltrating into the soil.

**Evapotranspiration**
: Combined water loss from soil evaporation and plant transpiration.

---

## Common Spectral Indices

| Index | Formula | Typical use |
|-------|---------|-------------|
| `NDVI` | `(NIR - Red) / (NIR + Red)` | vegetation vigor and greenness |
| `NDWI` | `(Green - NIR) / (Green + NIR)` | open water detection |
| `MNDWI` | `(Green - SWIR) / (Green + SWIR)` | water extraction in built-up or noisy scenes |
| `EVI` | `2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)` | vegetation monitoring in dense canopies |
| `NDBI` | `(SWIR - NIR) / (SWIR + NIR)` | built-up area highlighting |

---

## Common Raster Band Definitions

| Band family | What it often helps show |
|-------------|--------------------------|
| Blue | haze, shallow water, sediment, coastal features |
| Green | vegetation reflectance, water visibility, visual interpretation |
| Red | chlorophyll absorption, vegetation contrast |
| NIR | biomass, vegetation health, land-water separation |
| SWIR1 | moisture, soil and vegetation water content |
| SWIR2 | dryness, burn scars, mineral and moisture contrasts |

### Common Sensor Band Mappings

| Spectral region | Sentinel-2 | Landsat 8/9 |
|-----------------|------------|-------------|
| Blue | `B2` | `B2` |
| Green | `B3` | `B3` |
| Red | `B4` | `B4` |
| NIR | `B8` | `B5` |
| SWIR1 | `B11` | `B6` |
| SWIR2 | `B12` | `B7` |
