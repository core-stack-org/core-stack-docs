---
title: Coding Standards and Guidelines
description: Practical code, naming, and documentation conventions for CoRE Stack contributors.
---

# Coding Standards and Guidelines

CoRE Stack code should be easy to trace by the next developer. Most bugs in this codebase are not clever-algorithm bugs; they are naming, setup, publication, metadata, and dependency-boundary bugs.

## Working Principles

- Keep API handlers thin.
- Keep analytical logic separately callable.
- Prefer stable, deterministic asset names.
- Preserve common identifiers such as MWS `uid`.
- Reuse shared helpers for GEE paths, exports, GeoServer sync, and layer metadata.
- Document the real API path, task, module, inputs, and outputs.
- Put setup problems in troubleshooting pages, not inside every pipeline page.

## Code Structure

| Area | Prefer |
| --- | --- |
| API handlers | parse payload, normalize names, call task, return clear response |
| Celery tasks | wrap long or network-heavy work, log failures, retry where useful |
| Processing functions | accept explicit inputs and return a clear raster, vector, table, or status |
| GEE code | use `ee_initialize()`, `valid_gee_text()`, `get_gee_dir_path()`, and export helpers |
| Publication | save metadata after export, update sync flags only after publication succeeds |
| Project-backed code | document required DB records, KMLs, and profiles |

## Naming

- Use lowercase normalized names in asset paths.
- Include state, district, block, year range, and output type when they affect the result.
- Use one dataset name consistently between seed data, code, docs, and layer metadata.
- Keep GeoServer workspace names predictable.
- Avoid hidden assumptions such as hardcoded account IDs, unmarked helper assets, or year ranges buried in code.

## Documentation

Each new pipeline note should answer:

1. What does it compute?
2. Which API path triggers it?
3. Which task or function does the work?
4. What inputs are required?
5. What does it publish?
6. Which external services are required?
7. What can fail, and where should a developer look first?

Use concise examples. Link to the actual backend files. Do not repeat the full installer or GEE setup unless the page adds something workflow-specific.

## Review Checklist

- Can the computation be run for one small place?
- Does it fail clearly when an external service is missing?
- Does it avoid recomputing or overwriting assets accidentally?
- Does it keep publication and metadata in sync?
- Does the docs page point to the next action?
- Is there a small manual request or shell path for future debugging?

For implementation patterns, continue to [Pipeline Patterns](../pipelines/index.md#pipeline-patterns).
