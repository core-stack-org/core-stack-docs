# GeoAdmin (NoAuth) APIs

These routes help you discover valid place names before making deeper queries.

They are the safest place to start because they do not require authentication.

---

## Core Routes

| Route | Use it for |
|---|---|
| `GET /api/v1/get_states/` | list valid states |
| `GET /api/v1/get_districts/<state_id>/` | list districts for a state |
| `GET /api/v1/get_blocks/<district_id>/` | list blocks or tehsils for a district |
| `GET /api/v1/proposed_blocks/` | inspect activated or proposed locations |

Code surfaces:

- [geoadmin/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/urls.py)
- [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py)

---

## Quick Examples

```bash
curl https://geoserver.core-stack.org/api/v1/get_states/
```

```bash
curl https://geoserver.core-stack.org/api/v1/get_districts/29/
```

---

## Why This Page Matters

Most public-data workflows fail first because the user guessed the wrong location name.

These routes solve that problem before you touch:

- API keys
- geometry routes
- generated layers
- tehsil or MWS analytics

---

## Next Paths

- [Get Public API Access](authentication.md)
- [Swagger / ReDoc](api-explorer.md)
- [Public API References](public-endpoints.md)
- [Use PreComputed Geospatial Data](../use-precomputed-data/index.md)
