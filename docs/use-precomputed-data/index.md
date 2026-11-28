# Use PreComputed Geospatial Data

This section is for people who want to discover, inspect, download, and reuse CoRE Stack data before installing the backend.

!!! tip "Need an API key?"
    [Register or sign in at dashboard.core-stack.org](https://dashboard.core-stack.org/){ .md-button .md-button--primary }
    You can generate an `X-API-Key` directly from the dashboard, or programmatically via the Auth APIs (`POST /api/v1/auth/login/` followed by `POST /api/v1/generate_api_key/`). See [Authentication](public-apis.md#1-authentication) for both methods.

---

## Key Pages

1. Start with [MCP](mcp.md) if you want to connect AI assistants and agents to CoRE Stack data using the Model Context Protocol.
2. Move to [Public APIs](public-apis.md) for authentication (dashboard and API-based), v1 and v2 API catalogs, Swagger, and ReDoc.
3. Try the [Water Balance Analysis](public-apis.md#water-balance-analysis) or [Cropping Intensity Analysis](public-apis.md#cropping-intensity-analysis) notebooks when you want a worked API example.
4. Use [API Metadata](api-metadata.md) when you need the fields, types, units, and descriptions returned by the public APIs.
5. Use [STAC Specs](stac-specs.md) when you need metadata, styles, and download structure.
6. [CoRE Stack GEE App](https://ee-corestackdev.projects.earthengine.app/view/core-stack-gee-app): browse public layers directly in Earth Engine.
7. [How Current Data Was Computed](how-current-data-was-computed.md): when you want to understand which pipeline family produced a dataset.

---

## If The Data You Need Is Missing

You should not have to guess what to do next. Move into:

- [Pipeline Development](../pipelines/index.md) if you want to install and compute locally
- [Contributing](../community/contributing.md) if you want to request or help add missing data
- [Geospatial Data Request Form](https://dashboard.core-stack.org/locationForm/)
- Check current Issues on Github or [Raise a new Issue](https://github.com/core-stack-org/core-stack-backend/issues)
