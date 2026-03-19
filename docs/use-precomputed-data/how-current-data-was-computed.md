# How Current Data Was Computed

This page connects public outputs back to the computation pipelines that produced them, and explains why CoRE Stack computes the current public products instead of trying to precompute every imaginable combination.

---

## The Short Answer

CoRE Stack tries to precompute the layers that are:

1. scientifically meaningful
2. repeatable across large geographies
3. useful for planning
4. stable enough to expose through APIs, STAC, and dashboards
5. composable into many downstream analyses

That is why the public surface emphasizes canonical layers, registries, and joinable outputs rather than thousands of one-off combinations.

---

## The Main Design Considerations

### 1. Use stable spatial units

Most CoRE Stack outputs are indexed to standardized micro-watershed units, villages, waterbodies, or administrative boundaries.

That makes it possible to:

- compare across places
- compare across years
- join outputs from different pipeline families
- keep public APIs predictable

### 2. Prefer reusable base products over one-off answers

Instead of precomputing every question someone may ask, CoRE Stack prefers to publish:

- core rasters
- canonical vector layers
- watershed and tehsil summaries
- stable geometry layers
- metadata, styles, and asset pointers

Users can then compose their own rankings, filters, dashboards, and planning lenses.

### 3. Stay close to planning-relevant questions

Current public outputs mainly support questions such as:

- what is the terrain, land use, water, or drought condition here?
- how do these signals vary across micro-watersheds?
- how does one watershed behave over time?
- which upstream or nearby units matter for planning?

### 4. Publish only what can be maintained clearly

A public product is not just an internal computation. It also needs:

- stable names
- understandable fields
- metadata
- file delivery
- documentation

That publishing burden is one reason CoRE Stack exposes a curated set of layers instead of every internal intermediate.

---

## Think In Four Layers

1. **Source rasters and foundational layers**
   DEMs, rainfall, imagery, boundaries, and other reusable inputs
2. **Pipeline families**
   LULC, hydrology, surface water, terrain, drainage, enrichment, and time-series workflows
3. **Indexed outputs**
   Raster products, vector layers, tehsil tables, MWS indicators, and connectivity-aware outputs
4. **Public surfaces**
   APIs, STAC items, style files, dashboards, and reports

---

## Typical Mapping

| Public output | Why it exists | Usually comes from | Follow-up page |
|---|---|---|---|
| `get_generated_layer_urls` entries | expose canonical downloadable layers and asset pointers | publication and metadata integration around computed layers | [Pipeline Integrations](../pipelines/pipeline-integrations.md) |
| MWS analytics and time series | make repeated watershed signals directly usable without reprocessing raw rasters | hydrology, NDVI, and stats-generation workflows | [Hydrology](../pipelines/hydrology.md) |
| SWB-related layers | make waterbody condition and availability inspectable | surface water body detection and publishing flows | [SWB Detection](../pipelines/swb-detection.md) |
| Terrain-derived layers | provide reusable physical context for many downstream analyses | terrain and raster or drainage workflow families | [Terrain Analysis](../pipelines/terrain-analysis.md) |
| STAC items and style files | help people download, load, and understand outputs outside CoRE Stack apps | dataset registration plus metadata publication | [STAC Specs](../api/stac-specs.md) |

---

## Why Not Precompute A Thousand Combinations

Because most useful analysis happens one layer above the canonical outputs.

For example, once CoRE Stack publishes:

- stable geometries
- cropping intensity
- drought indicators
- water balance
- terrain
- surface water signals

then different users can build very different composites for:

- irrigation stress
- restoration opportunity
- river rejuvenation planning
- village or panchayat reporting
- research hypotheses

If CoRE Stack tried to publish every possible combination centrally, the result would be:

- hard to maintain
- hard to explain
- hard to validate
- hard for users to trust

So the platform computes reusable building blocks, and expects many interpretations to happen downstream.

---

## If The Data You Need Is Missing

You now have four sensible next moves:

1. use [Public API References](../api/public-endpoints.md) and [STAC Specs](../api/stac-specs.md) to combine existing public outputs yourself
2. use the `gee_asset_path`, `layer_url`, or STAC assets as a handoff into Python, QGIS, or Earth Engine
3. move into [Develop Computation Pipelines](../pipelines/index.md) if the missing layer should be computed
4. open an issue or contribute if the platform should expose a new canonical public resource

---

## Good Next Moves

- start from [Understand CoRE Stack Data Structure](../pipelines/watershed-data-structure.md) if you want the conceptual model first
- start from [Develop Computation Pipelines](../pipelines/index.md) if you want the workflow overview
- go to [Computation Registry](../pipelines/computation-registry.md) if you want route and computation names
- move to [Develop Computation Pipelines](../pipelines/index.md) if you want to install and compute locally

---

## Next Paths

- [Understand CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
- [Develop Computation Pipelines](../pipelines/index.md)
- [Computation Registry](../pipelines/computation-registry.md)
- [Public API References](../api/public-endpoints.md)
- [Develop CoRE Stack](../developers/index.md)
