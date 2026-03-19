---
title: Add and Integrate Public / New Data Resources
description: Register new datasets, connect metadata surfaces, and expose new resources through CoRE Stack delivery layers.
---

# Add and Integrate Public / New Data Resources

This page is for the point where a successful computation becomes a reusable platform resource.

---

## What Usually Needs To Happen

- register the dataset
- choose stable names and fields
- connect the output to GeoServer or another delivery surface
- expose metadata cleanly
- make downstream docs and APIs aware of the new resource

---

## The First Admin Surface To Remember

```text
http://127.0.0.1:8000/admin/computing/dataset/add/
```

That page is one of the key bridges between computation and discoverability.

---

## Metadata Surfaces To Think About

Depending on the output, the resource may need to appear in:

- [Public API References](../api/public-endpoints.md)
- [STAC Specs](../api/stac-specs.md)
- [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)
- [Computation Registry](../pipelines/computation-registry.md)

---

## Naming And Structure

Before you expose a new resource, check:

- does the dataset name match existing conventions?
- are field names stable and understandable?
- is the join key clear?
- does the metadata explain how a user should load or use it?

For naming guidance, continue into [Standardised Field / Constant / Variable Names](../reference/standardised-field-constant-variable-names.md).

---

## Next Paths

- [Integrations](integrations/index.md)
- [STAC Specs](../api/stac-specs.md)
- [Public API References](../api/public-endpoints.md)
- [Pipeline Integrations](../pipelines/pipeline-integrations.md)
- [Standardised Field / Constant / Variable Names](../reference/standardised-field-constant-variable-names.md)
