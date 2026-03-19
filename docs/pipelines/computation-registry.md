---
title: Computation Registry
description: Registry of computation families, representative routes, and the workflow pages they map to across CoRE Stack.
---

# Computation Registry

This page is the bridge between route inventory and pipeline understanding.

Use it as a concise map from route names to the workflow families they belong to.

- what computations exist?
- which family do they belong to?
- where should a reader go next?

---

## Registry Snapshot

| Family | Representative routes or tasks | Read next |
|--------|--------------------------------|-----------|
| hydrology | `hydrology_fortnightly`, `hydrology_annual` | [Hydrology](hydrology.md) |
| land use / land cover | `lulc_for_tehsil`, `lulc_v3`, `lulc_v4` | [LULC Generation](lulc-generation.md) |
| waterbodies | `generate_swb`, waterbody analytics in public APIs | [SWB Detection](swb-detection.md) |
| terrain | `generate_terrain_descriptor`, `generate_terrain_raster` | [Terrain Analysis](terrain-analysis.md) |
| administrative and boundary setup | `generate_block_layer`, `generate_mws_layer` | [Admin Boundary](admin-boundary.md) |
| enrichment workflows | `generate_facilities_proximity`, aquifer and SOGE workflows | [Boundary and Enrichment Layers](boundary-and-enrichment/index.md) |
| raster and drainage derivatives | stream, slope, drainage, catchment, restoration workflows | [Raster and Drainage Layers](raster-and-drainage/index.md) |
| time series | NDVI and HLS support workflows | [Time Series and Ops](time-series-and-ops/index.md) |

---

## How To Use This Page

=== "As a developer"

    Start here when you know a route or task name but not the conceptual family it belongs to.

=== "As a docs maintainer"

    Use this page to keep the route inventory tied back to the explanatory pages.

=== "As a curious data user"

    Use this page when you want to understand which computations produced the public data surfaces you are already exploring.

---

## Next Paths

- [Computing API Endpoints](../api/computing-endpoints.md)
- [How They Work Programmatically](how-pipelines-work-programmatically.md)
- [Core Workflows](core-workflows/index.md)
- [Boundary and Enrichment Layers](boundary-and-enrichment/index.md)
- [Build New Pipelines](../developers/build-new-pipelines.md)
