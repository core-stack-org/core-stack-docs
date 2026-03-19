---
title: Standardised Field / Constant / Variable Names
description: Naming conventions for identifiers, fields, variables, and dataset labels used across CoRE Stack docs and code.
---

# Standardised Field / Constant / Variable Names

Use this page to reduce naming drift across docs, APIs, pipeline outputs, and code.

---

## General Rules

- prefer stable, lower-case, machine-friendly field names
- use the same join key names across docs and code when they mean the same thing
- do not rename the same idea differently across API docs, pipeline docs, and lessons without a strong reason
- document the public-facing name when internal code differs

---

## Common Examples

| Prefer | Avoid | Why |
|--------|-------|-----|
| `uid` | `id` for watershed-specific joins | clearer for shared spatial joins |
| `state`, `district`, `block` | mixed admin naming in the same example | keeps request examples consistent |
| `gee_asset_path` | ad hoc GEE path field names | matches public metadata already exposed |
| `layer_url` | multiple vague download field names | keeps delivery surfaces understandable |
| `dataset_name` | shifting labels for the same output | makes inventories easier to scan |

---

## Where This Matters Most

- [Public API References](../api/public-endpoints.md)
- [STAC Specs](../api/stac-specs.md)
- [Build New Pipelines](../developers/build-new-pipelines.md)
- [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)

---

## Next Paths

- [Coding Standards and Guidelines](../developers/coding-standards-and-guidelines.md)
- [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
- [Public API References](../api/public-endpoints.md)
- [STAC Specs](../api/stac-specs.md)
- [Glossary](glossary.md)
