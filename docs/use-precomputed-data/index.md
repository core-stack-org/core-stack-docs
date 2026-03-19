# Use PreComputed Geospatial Data

This section is for people who want to discover, inspect, download, and reuse CoRE Stack data before installing the backend.

---

## Main Routes

<div class="grid cards" markdown>

- :material-map-marker-path: **GeoAdmin (NoAuth) APIs**

  ---

  Find valid state, district, and block names before deeper queries.

  [Open GeoAdmin Routes](../api/geoadmin-noauth.md){ .md-button }

- :material-key-outline: **Get Public API Access**

  ---

  Register, generate an API key, and understand when to use auth-free, API-key, or JWT routes.

  [Get Public API Access](../api/authentication.md){ .md-button }

- :material-api: **Swagger / ReDoc**

  ---

  Inspect the public API visually and move from quick testing to deeper reading.

  [Open API Explorer](../api/api-explorer.md){ .md-button }

- :material-database-search-outline: **Public API References**

  ---

  Use the route catalog for geometries, analytics, layers, reports, and location inventories.

  [Open Public API References](../api/public-endpoints.md){ .md-button }

- :material-file-tree-outline: **STAC Specs**

  ---

  Understand metadata, schema, QGIS loading, and how to download styled assets cleanly.

  [Open STAC Specs](../api/stac-specs.md){ .md-button }

- :material-view-dashboard-outline: **CoRE Stack GEE App**

  ---

  Explore the public Earth Engine app for CoRE Stack layers directly in the browser.

  [Open GEE App](https://ee-corestackdev.projects.earthengine.app/view/core-stack-gee-app){ .md-button }

- :material-cogs: **How Current Data Was Computed**

  ---

  Bridge from precomputed outputs into the computation pipeline families that produced them.

  [How Current Data Was Computed](how-current-data-was-computed.md){ .md-button }

</div>

---

## How To Move Through This Section

=== "I need a valid location first"

    - [GeoAdmin (NoAuth) APIs](../api/geoadmin-noauth.md)
    - [Public API References](../api/public-endpoints.md)

=== "I need public API access"

    - [Get Public API Access](../api/authentication.md)
    - [Swagger / ReDoc](../api/api-explorer.md)
    - [Public API References](../api/public-endpoints.md)

=== "I want to try the API visually"

    - [Swagger / ReDoc](../api/api-explorer.md)
    - [Public API References](../api/public-endpoints.md)
    - [CoRE Stack GEE App](https://ee-corestackdev.projects.earthengine.app/view/core-stack-gee-app)

=== "I want a real worked route through the data"

    - [Public API References](../api/public-endpoints.md)
    - [STAC Specs](../api/stac-specs.md)
    - [How Current Data Was Computed](how-current-data-was-computed.md)
    - Optional example script: [`data-use-lessons.py`](https://github.com/core-stack-org/core-stack-docs/blob/main/data-use-lessons.py)

=== "I need metadata and schema"

    - [STAC Specs](../api/stac-specs.md)
    - [Public API References](../api/public-endpoints.md)

---

## If The Data You Need Is Missing

You should not have to guess what to do next. Move into:

- [How Current Data Was Computed](how-current-data-was-computed.md) to understand which pipeline family produces the data
- [Develop Computation Pipelines](../pipelines/index.md) if you want to install and compute locally
- [Build New Pipelines](../developers/build-new-pipelines.md) if you want to extend the stack
- [Contributing](../community/contributing.md) if you want to request or help add missing data

---

## Next Paths

- [Get Public API Access](../api/authentication.md)
- [Public API References](../api/public-endpoints.md)
- [STAC Specs](../api/stac-specs.md)
- [CoRE Stack GEE App](https://ee-corestackdev.projects.earthengine.app/view/core-stack-gee-app)
- [How Current Data Was Computed](how-current-data-was-computed.md)
