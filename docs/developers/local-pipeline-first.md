---
title: Local Pipeline First
description: Build or modify a CoRE Stack computation locally before wiring Django, Celery, auth, or publication layers.
---

# Local Pipeline First

This is the recommended first development step for new or modified computations.

Before adding routes, Celery tasks, auth decorators, or dataset registration, make the actual analytical workflow work in a local, inspectable way.

---

## Why Start Here

This sequence reduces confusion:

- if the science is wrong, you catch it before integration work
- if the data assumptions are wrong, you see them before HTTP and queue layers hide the problem
- if the output shape is unstable, you avoid publishing bad interfaces

---

## The Local-First Sequence

```mermaid
flowchart LR
    A[Choose one ROI and one output] --> B[Run the core function locally]
    B --> C[Validate files, geometry, and fields]
    C --> D[Make it repeatable from shell or script]
    D --> E[Only then add Django Computing API]
```

---

## What Counts As Local

Any of these are valid starting points:

- local sample files on your machine
- your own GEE assets
- public CoRE Stack layer metadata discovered from [Public API References](../api/public-endpoints.md) and [STAC Specs](../api/stac-specs.md)
- existing CoRE Stack public layer inventories exposing `gee_asset_path`

If a public GEE-backed layer already exists, the easiest public handoff point is often the `gee_asset_path` returned by [Public API References](../api/public-endpoints.md).

---

## Minimum Shape Of A Good First Prototype

```python linenums="1" hl_lines="1 5 6 8" title="A healthy first local pipeline shape"
def run_pipeline(state, district, block, output_dir, source=None):  # (1)!
    roi = load_roi(state, district, block)
    raw = load_source_data(source=source, roi=roi)
    processed = compute_result(raw, roi)
    validated = validate_result(processed)                           # (2)!
    path = write_outputs(validated, output_dir)
    return {
        "roi": roi["name"],
        "output_path": path,                                         # (3)!
        "summary": summarize(validated),
    }
```

1. Keep the local entry point simple and explicit.
2. Validate the result before you start thinking about APIs or publication.
3. Return a path and a summary so the run is easy to inspect and compare.

---

## What To Validate Before Moving On

- does the region of interest match what you intended?
- are the output fields stable and understandable?
- if the output is spatial, does it open cleanly in QGIS or Python?
- if the output is temporal, are the time windows and units clear?
- can you run it twice without changing behavior unexpectedly?

---

## Practical Exit Points

=== "Python"

    Start from a plain callable function, a small script, or `manage.py shell`.

=== "QGIS"

    Open the first vector or raster result there before you wire publication.

=== "Earth Engine"

    If your workflow relies on GEE, confirm that the asset path or export target is correct before adding route-level wiring.

---

## Only After This Page

Once the local output is stable, the next developer job is to decide:

- does it need an HTTP route?
- does it need async execution?
- does it need publication or dataset registration?

Those decisions belong to later pages.

---

## Next Paths

- [Integrate With Django Computing API](django-computing-api-integration.md)
- [Add Celery / Auth / Task Integration](celery-auth-and-task-integration.md)
- [Build New Pipelines](build-new-pipelines.md)
- [Common Pipeline Design / Integration Patterns](../pipelines/common-design-and-integration-patterns.md)
- [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)
