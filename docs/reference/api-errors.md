# API Errors Reference

Complete reference for common error shapes and categories documented for the CoRE Stack API.

---

## Error Response Format

All errors should be understandable enough for both API users and maintainers to debug quickly.

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "request_id": "req-uuid-for-support"
  }
}
```

---

## Error Categories

```mermaid
graph TD
    A[API Errors] --> B[Client Errors 4xx]
    A --> C[Server Errors 5xx]

    B --> D[400 Bad Request]
    B --> E[401 Unauthorized]
    B --> F[403 Forbidden]
    B --> G[404 Not Found]
    B --> H[429 Rate Limited]

    C --> I[500 Internal Error]
    C --> J[502 Bad Gateway]
    C --> K[504 Timeout]
```

---

## 400 Bad Request

### `INVALID_PARAMETER`

The request contains invalid or missing parameters.

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid or missing required parameters",
    "details": {
      "state": "State 'unknown' not found",
      "year": "Year must be between 2015 and 2024"
    }
  }
}
```

### `INVALID_JSON`

The request body contains malformed JSON.

### `VALIDATION_ERROR`

Request parameters failed validation rules.

### `MISSING_FIELD`

Required field is missing from the request.

| Field | Description |
|-------|-------------|
| `state` | State name is required |
| `district` | District name is required |
| `block` | Block name is required |
| `year` | Year is required for temporal analyses |

---

## 401 Unauthorized

### `UNAUTHORIZED`

Request lacks valid authentication credentials.

Typical fixes:

- add `X-API-Key` for public data APIs
- add `Authorization: Bearer ...` for JWT-protected APIs
- confirm which auth mode the target API actually uses

### `INVALID_API_KEY`

The provided API key is invalid or malformed.

### `EXPIRED_TOKEN`

The provided bearer token has expired and needs refresh or re-login.

---

## 403 Forbidden

### `INSUFFICIENT_PERMISSIONS`

The caller is authenticated but not allowed to perform the requested action.

Common causes:

- a user is outside the required organization scope
- an API requires superadmin or organization admin privileges
- a project assignment does not match the user's organization

---

## 404 Not Found

### `RESOURCE_NOT_FOUND`

The requested API path, object, or dataset does not exist.

Typical examples:

- wrong district or block name
- wrong organization or project identifier
- stale layer or dataset URL

### `LAYER_NOT_PUBLISHED`

The requested GeoServer layer is not yet published for the given `state`, `district`, and `tehsil`.

- On `get_mws_data`: returned when the fortnightly layer is unavailable, with `details.fallback: "get_tehsil_data?data=hydrological_seasonal"`.
- On `get_generated_layer_urls`: returned when no GeoServer-synced layers exist yet for that location (*"Layers are not yet published for this state, district, tehsil. The layers will soon be available."*).

### `DATA_NOT_GENERATED`

Returned by `get_mws_kyl_indicators` and `get_mws_report` when the underlying stats / JSON files have not been generated yet for the requested location.

---

## 429 Rate Limited

### `RATE_LIMITED`

The caller has sent too many requests in a short period.

Typical response guidance:

- retry after waiting
- reduce polling frequency
- batch requests where possible

---

## 5xx Server Errors

### `INTERNAL_ERROR`

The backend failed in an unexpected way.

### `UPSTREAM_UNAVAILABLE` / `UPSTREAM_FAILURE`

Returned with HTTP `502 Bad Gateway` when GeoServer, Earth Engine, or another upstream dependency times out, returns 5xx, or fails to respond (for example on `get_admin_details_by_latlon`, `get_mws_data`, or WFS-backed routes).

### `TIMEOUT`

The backend or an upstream job exceeded a time limit.

---

## Practical Debug Order

1. Confirm and test the API path, as documented in [Public APIs](../use-precomputed-data/public-apis.md).
3. Check spelling and case for geographic names and IDs.
4. For developer-side task flows, compare against the manual run path in [Build Pipelines](../pipelines/index.md#first-manual-run).
