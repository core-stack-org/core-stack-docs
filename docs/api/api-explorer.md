# Swagger / ReDoc

Use this page when you want one place for both fast API testing and deeper route reading.

---

## Choose The Right Explorer

<div class="grid cards" markdown>

- :material-flash-outline: **Swagger**

  ---

  Better for trying requests quickly.

  [Open Swagger](https://geoserver.core-stack.org/swagger/){ .md-button .md-button--primary }

- :material-book-open-variant: **ReDoc**

  ---

  Better for reading route groups and schema details more carefully.

  [Open ReDoc](https://api-doc.core-stack.org/){ .md-button }

</div>

---

## Recommended First Calls

1. auth-free geography discovery
2. active locations
3. generated layer URLs
4. MWS geometries
5. MWS data or tehsil data for one real place

Use [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md) first if you need valid place names.

---

## Explorer Workflow

=== "Fast test in Swagger"

    1. Open Swagger.
    2. Start with a no-auth geography route or a public data route.
    3. Try the request and inspect the exact response shape.

=== "Read in ReDoc"

    1. Open ReDoc.
    2. Browse route groups and parameter descriptions.
    3. Move to the detailed page in this docs site if you want stronger examples and next links.

---

## After You Explore

- go to [Public API References](public-endpoints.md) for grouped route documentation
- go to [STAC Specs](stac-specs.md) for metadata and schema guidance
- go to [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md) for the pipeline rationale behind the public data

---

## Next Paths

- [Public API References](public-endpoints.md)
- [GeoAdmin (NoAuth) APIs](geoadmin-noauth.md)
- [STAC Specs](stac-specs.md)
- [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)
