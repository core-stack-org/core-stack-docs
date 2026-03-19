# Backend Code Map

## Public source repo:

- [core-stack-org/core-stack-backend](https://github.com/core-stack-org/core-stack-backend)

---

## API Gateway

| Concern | Source |
|---------|--------|
| Top-level Django route registry | [nrm_app/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/nrm_app/urls.py#L39-L66) |
| Swagger and ReDoc routes | [nrm_app/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/nrm_app/urls.py#L56-L66) |

---

## Authentication

| Concern | Source |
|---------|--------|
| Auth mode decorator | [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L22-L176) |
| `Auth_free` handling | [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L138-L141) |
| `X-API-Key` header handling | [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L143-L161) |
| JWT bearer handling | [utilities/auth_check_decorator.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/auth_check_decorator.py#L163-L173) |

---

## Auth-Free Geography Discovery

| Concern | Source |
|---------|--------|
| Route list | [geoadmin/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/urls.py#L5-L12) |
| `get_states()` | [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L34) |
| `get_districts()` | [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L37-L52) |
| `get_blocks()` | [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L55-L70) |
| `proposed_blocks()` | [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L73-L84) |

---

## Public Data APIs

| Concern | Source |
|---------|--------|
| Public API route list | [public_api/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/urls.py#L4-L34) |
| Admin lookup by lat/lon | [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L88) |
| MWS lookup by lat/lon | [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L91-L131) |
| Tehsil JSON and MWS data | [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L134-L297) |
| Generated layer URLs | [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L299-L329) |
| Layer URL assembly logic | [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L56-L114) |
| Report URL generation | [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L378-L409) |
| MWS geometries via GeoServer | [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L412-L486) |
| Village geometries via GeoServer | [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L488-L519) |

---

## Compute Submission Surface

| Concern | Source |
|---------|--------|
| Full compute route list | [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py#L7-L183) |
| Workspace and boundary handlers | [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L76-L217) |
| Hydrology and LULC handlers | [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L218-L486) |
| SWB handler | [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L485-L512) |
| Terrain handlers | [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L546-L620) |

---

## Publishing and Delivery

| Concern | Source |
|---------|--------|
| Zip and publish shapes to GeoServer | [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L58-L93) |
| Convert KML to shapefile and publish | [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L115-L139) |
| Sync feature collections to GeoServer | [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L158-L190) |

---

## Earth Engine Integration

| Concern | Source |
|---------|--------|
| GEE initialization from stored credentials | [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L30-L43) |
| GCS configuration | [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L70-L92) |
| Task polling | [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L114-L148) |
| Asset path helpers | [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L151-L219) |

Operator setup for the Django-side `GEEAccount` used by these helpers is documented in [Google Earth Engine](integrations/google-earth-engine.md).

---

## Installation

| Concern | Source |
|---------|--------|
| Installer configuration and functions | [installation/install.sh](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/install.sh#L7-L251) |
| Manual prerequisites and post-install steps | [installation/INSTALLATION.md](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/INSTALLATION.md) |

---

## Suggested Reading Order

1. [nrm_app/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/nrm_app/urls.py#L39-L66)
2. [geoadmin/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/geoadmin/api.py#L21-L79)
3. [public_api/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/api.py#L43-L487)
4. [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py#L7-L183)
5. [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L76-L560)
6. [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py#L58-L190)
