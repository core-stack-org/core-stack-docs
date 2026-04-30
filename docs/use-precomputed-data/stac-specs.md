# STAC Specs

This page explains the STAC-facing metadata layer around CoRE Stack outputs, especially for people who want to download ready files with metadata and styling, or load them quickly into QGIS.

---

## CoRE-Stack STAC Browser

- STAC Browser: [https://stac.core-stack.org/](https://stac.core-stack.org/)
- Root catalog JSON: [Catalogue](https://spatio-temporal-asset-catalog.s3.ap-south-1.amazonaws.com/CorestackCatalogs_merged_collection/catalog.json)

The root catalog currently exposes two major branches:

1. [Tehsil](https://stac.core-stack.org/tehsil_wise/catalog.json) for tehsil-scoped collections
2. [Pan-India](https://stac.core-stack.org/PanIndiaCatalogs/collection.json) for pan-India collections

The tehsil-wise catalog currently includes state collections such as `bihar`, `jharkhand`, `odisha`, `uttar_pradesh`, `karnataka`, `rajasthan`, `maharashtra`, `gujarat`, `andhra_pradesh`, `assam`, `chhattisgarh`, `delhi`, `goa`, `haryana`, `himachal_pradesh`, `madhya_pradesh`, `meghalaya`, `west_bengal`, `nagaland`, `tamil_nadu`, `telangana`, and `kerala`.

The pan-India catalog currently includes collections such as drainage layers, terrain, hydrological boundaries, administrative boundaries, land use land cover, groundwater layers, waterbodies layers, and restoration-oriented datasets.

---

## What A STAC Item Gives You

In practice, a CoRE Stack STAC item can give you everything need for your further workflow:

- the data file itself, usually GeoTIFF for rasters or GeoJSON/WFS-backed GeoJSON for vectors
- a QGIS style file such as `.qml`
- a thumbnail preview
- geometry, bbox, and time coverage
- field-level metadata through `table:columns` on vector items
- provider, license, and descriptive metadata

For example, current `bihar_nalanda_hilsa_cropping_intensity_vector` [item](https://stac.core-stack.org/tehsil_wise/bihar/nalanda/hilsa/collection.json) includes:

- a json `data` asset (shape file) pointing to a GeoServer WFS GeoJSON endpoint
- a `style` asset pointing to a QGIS style file in `[core-stack-org/QGIS-Styles](https://github.com/core-stack-org/QGIS-Styles)` repository.
- a `thumbnail` asset
- `table:columns` metadata describing many output fields

---

## QGIS Workflow

Tested on Linux with QGIS `3.4+`.

### Quick setup

1. Open the STAC browser panel in QGIS
2. Add a new connection using the root catalog URL
3. Browse to the state, district, and tehsil or to a pan-India collection
4. Download the assets you need
5. Drag the downloaded `tiff` or `geojson` into the layers panel
6. Apply the downloaded `.qml` style file for labels and better visualization

### Typical assets to download

- `data`
- `style`
- `thumbnail`

---

## How STAC Relates To The Public APIs

Use STAC when you want:

- downloadable files
- styles for QGIS
- collection and item metadata
- schema and field descriptions
- browseable asset catalogs by geography or theme

Use [Public APIs](public-apis.md) when you want:

- precomputed data of some tehsils (`active locations`)

These are complementary:

- STAC gives you asset-centric metadata and downloads
- public APIs give you task-centric and app-centric payloads

Both connect back to the same computation and publication pipeline.

---

## For People Adding Or Improving Metadata

The backend spec source to keep in mind is:

- `core-stack-backend/computing/STAC_specs`

When adding or improving metadata, make sure the resulting items explain:

- what the dataset is
- which geography and time window it covers
- which asset is the primary data asset
- whether a style file exists