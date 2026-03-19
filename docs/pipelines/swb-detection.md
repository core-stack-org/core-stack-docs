# Surface Water Body Detection

Detect water bodies from LULC-derived inputs and turn them into integrated vector layers for the stack.

Primary source files:

- [computing/surface_water_bodies/swb.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/surface_water_bodies/swb.py)
- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)
- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)

---

## Overview

The SWB pipeline identifies ponds, tanks, and reservoirs, then enriches the result through successive steps such as MWS intersection and downstream property attachment.

```mermaid
flowchart LR
    A[LULC-derived water pixels] --> B[Vectorize]
    B --> C[Intersect with MWS]
    C --> D[Intersect with reference layers]
    D --> E[Publish vector layer]
```

---

## Why This Page Matters for Builders

The SWB implementation is a good example of a mixed integration workflow:

- it begins with geospatial processing logic
- it chains multiple helper stages together
- it saves metadata and publishes outputs
- it is useful both as an integrated backend workflow and as a staged execution learning target

If you want to build a new pipeline that has several intermediate stages, this is one of the best pages to compare against [Stream Order](stream-order.md) and [Facilities Proximity](facilities-proximity.md).

---

## What to Read Next

- [Common Pipeline Design / Integration Patterns](common-design-and-integration-patterns.md)
- [Build New Pipelines](../developers/build-new-pipelines.md)
- [Local Pipeline First](../developers/local-pipeline-first.md)
