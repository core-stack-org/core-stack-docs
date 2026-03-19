---
title: Get Public API Access
description: Register for API keys, understand CoRE Stack auth modes, and make your first working public-data requests.
---

# Get Public API Access

This page is the practical entry point for using the public CoRE Stack APIs.

You usually need three things:

1. a valid place name or coordinates
2. an API key for public-data routes
3. the right docs surface for the kind of response you want

The public access flow is also described on the CoRE Stack website: [Use APIs](https://core-stack.org/use-apis/).

---

## 1. Generate An API Key

For public dataset access:

1. Register or sign in at [dashboard.core-stack.org](https://dashboard.core-stack.org/)
2. Generate an API key from the dashboard
3. Send it as the `X-API-Key` header on `public_api` routes

If you only need state, district, or block discovery first, start with the auth-free GeoAdmin routes.

---

## 2. Understand Auth Modes

Authentication behavior is implemented in [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L22-L176).

| Mode | Header or requirement | Source | Typical use in backend |
|------|------------------------|--------|------------------------|
| `Auth_free` | none | [auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L138-L141) | geography discovery routes |
| `API_key` | `X-API-Key` | [auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L143-L161) | public data endpoints |
| `JWT` | `Authorization: Bearer ...` | [auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L163-L173) | authenticated app routes |

---

## Auth-Free Routes

The clearest auth-free routes today are the geography discovery endpoints in [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L79):

- `GET /api/v1/get_states/`
- `GET /api/v1/get_districts/<state_id>/`
- `GET /api/v1/get_blocks/<district_id>/`
- `GET /api/v1/proposed_blocks/`

Example:

```bash
curl https://geoserver.core-stack.org/api/v1/get_states/
```

---

## 3. Use API Key Routes

The public-data routes in [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L487) are decorated with `auth_type="API_key"`.

Use:

```bash
curl \
  -H "X-API-Key: YOUR_API_KEY" \
  "https://geoserver.core-stack.org/api/v1/get_admin_details_by_latlon/?latitude=15.91&longitude=76.53"
```

```bash
curl \
  -H "X-API-Key: YOUR_API_KEY" \
  "https://geoserver.core-stack.org/api/v1/get_generated_layer_urls/?state=karnataka&district=raichur&tehsil=devadurga"
```

---

## 4. JWT Routes

The decorator also supports JWT bearer tokens:

```bash
curl \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://geoserver.core-stack.org/api/v1/some-jwt-protected-route/
```

The header parsing logic is in [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L163-L173).

---

## Practical Guidance

- Use [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md) first if you do not yet know the exact place name.
- Use `X-API-Key` for the public dataset routes documented in [Public API References](public-endpoints.md).
- Use [Swagger / ReDoc](api-explorer.md) when you want to inspect parameters or response shapes before writing code.
- Use [STAC Specs](stac-specs.md) when you want downloadable files, style files, and metadata for QGIS or other clients.

---

## See Also

- [Use PreComputed Geospatial Data](../use-precomputed-data/index.md)
- [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md)
- [Swagger / ReDoc](api-explorer.md)
- [Public Endpoints](public-endpoints.md)
- [Computing API Endpoints](computing-endpoints.md)
- [STAC Specs](stac-specs.md)
