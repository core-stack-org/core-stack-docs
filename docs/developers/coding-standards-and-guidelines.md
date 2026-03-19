---
title: Coding Standards and Guidelines
description: Practical code, naming, and documentation conventions for contributors extending CoRE Stack.
---

# Coding Standards and Guidelines

This page keeps contributor expectations compact and implementation-focused.

---

## Working Principles

- keep route handlers thin
- keep analytical logic separately callable
- use stable names for fields, identifiers, and datasets
- document real entry points, not idealized ones
- prefer adding the next useful docs link whenever a page could become a dead end

---

## Code Structure Preferences

=== "Computation code"

    - isolate the data-processing function
    - keep IO and publication helpers near the boundary
    - make local execution possible before async integration

=== "API code"

    - normalize request fields consistently
    - keep validation and response behavior explicit
    - push heavy work out of the HTTP layer

=== "Documentation"

    - link to actual files or routes
    - show at least one practical example
    - point to the next deeper page, one neighboring page, and one action page

---

## Naming

Use consistent names across code, metadata, and docs:

- `Computing API`, not `Internal API`
- `Developers`, not `Builders`
- `Installer`, not `Interactive Installer`

For field and dataset naming, continue into [Standardised Field / Constant / Variable Names](../reference/standardised-field-constant-variable-names.md).

---

## Next Paths

- [Build New Pipelines](build-new-pipelines.md)
- [Backend Code Map](backend-code-map.md)
- [Contributing](../community/contributing.md)
- [Standardised Field / Constant / Variable Names](../reference/standardised-field-constant-variable-names.md)
- [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
