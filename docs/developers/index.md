---
title: Develop CoRE Stack
description: Understand the backend, architecture, integrations, and platform conventions after you already know the data model and pipeline flow.
---

# Develop CoRE Stack

This section is for developers who want to work on the platform itself after they already understand the data structure and pipeline flow.

If you are mainly trying to install the backend or build a new computation, start in [Develop Computation Pipelines](../pipelines/index.md).

This section is for questions like:

1. where does a request move through the backend?
2. how are the major subsystems organized?
3. how do integrations with GEE, GeoServer, and AWS fit together?
4. what standards should platform contributors follow?

---

## Start Here

<div class="grid cards" markdown>

- :material-file-tree-outline: **Backend Code Map**

  ---

  Jump into the actual files and app boundaries that matter when you need to trace behavior quickly.

  [Open Backend Code Map](backend-code-map.md){ .md-button .md-button--primary }

- :material-office-building-cog-outline: **System Architecture**

  ---

  Understand the major services and platform boundaries before changing backend behavior.

  [Open System Architecture](system-architecture.md){ .md-button }

- :material-play-network-outline: **First Manual API Run**

  ---

  Verify a running backend and trace one request path before making larger changes.

  [Open First Manual API Run](first-manual-api-run.md){ .md-button }

- :material-shape-plus-outline: **Integrations**

  ---

  Understand how CoRE Stack connects to Earth Engine, GeoServer, AWS, and other delivery surfaces.

  [Open Integrations](integrations/index.md){ .md-button }

- :material-text-box-check-outline: **Coding Standards**

  ---

  Follow naming, documentation, and contribution patterns that keep the platform understandable.

  [Open Coding Standards](coding-standards-and-guidelines.md){ .md-button }

</div>

---

## Pick Your Route

=== "I need platform orientation first"

    - [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
    - [Backend Code Map](backend-code-map.md)
    - [System Architecture](system-architecture.md)

=== "I need to verify or trace a running backend"

    - [First Manual API Run](first-manual-api-run.md)
    - [Get Public API Access](../api/authentication.md)
    - [Computing API Endpoints](../api/computing-endpoints.md)
    - [Setup Troubleshooting](setup-troubleshooting.md)

=== "I want to work on platform surfaces"

    - [Integrations](integrations/index.md)
    - [Coding Standards and Guidelines](coding-standards-and-guidelines.md)
    - [Contributing](../community/contributing.md)
    - [Develop Computation Pipelines](../pipelines/index.md)

---

## Core Entry Surfaces

- [nrm_app/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/nrm_app/urls.py)
- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)
- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)
- [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py)
- [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py)

---

## Next Paths

- [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
- [Backend Code Map](backend-code-map.md)
- [System Architecture](system-architecture.md)
- [First Manual API Run](first-manual-api-run.md)
- [Integrations](integrations/index.md)
