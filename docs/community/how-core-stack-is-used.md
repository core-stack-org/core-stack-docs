---
title: How CoRE Stack Is Used
description: A short map of how CoRE Stack is used in practice by common people, researchers, developers, and planning teams.
---

# How CoRE Stack Is Used

CoRE Stack is not only a backend or a dataset catalog. It is meant to help people understand and act on landscapes.

The current public material on the CoRE Stack website shows three especially important usage patterns.

---

## 1. Use Data And Dashboards Directly

People can start from:

- [Use APIs](https://core-stack.org/use-apis/)
- [STAC Browser](https://stac.core-stack.org/)
- [Know Your Landscape](https://explorer.core-stack.org/)

This route is best for people who want:

- ready datasets
- map layers
- public API access
- basic landscape understanding without setting up the backend

---

## 2. Build Analysis On Top Of The Data Structure

The [starter-kit for geospatial programming](https://core-stack.org/core-stack-starter-kit-for-geospatial-programming/) shows a second important route:

- fetch layers for a state, district, and tehsil
- populate a tehsil -> micro-watershed -> waterbody data structure
- flatten that structure into data frames
- test comparisons and hypotheses quickly

This is the bridge between public data use and serious experimentation.

It is especially useful for:

- researchers
- challenge participants
- OSS developers
- teams building custom dashboards or analysis notebooks

---

## 3. Plan For Specific Landscape Problems

The [river rejuvenation example](https://core-stack.org/planning-river-rejuvenation-over-a-large-stretch/) shows how CoRE Stack can support place-specific planning:

- intersect an area of interest with the micro-watershed registry
- trace upstream and downstream watershed connectivity
- pull water availability, deforestation, and related indicators
- reason about which catchments should also be treated

This is important because it shows the point of the stack:

- not only to publish layers
- but to help planning teams and communities reason about interventions

---

## Why Common People Still Matter Here

The stack may expose APIs, STAC items, and geospatial layers, but the intended public value is larger than those technical surfaces.

The [micro-watershed registry writeup](https://core-stack.org/a-micro-watershed-registry-for-india/) and the [data structure explanation](https://core-stack.org/the-core-stack-data-structure/) both point to the same idea:

- use standardized hydrological units to organize landscape knowledge
- connect those units back to villages, waterbodies, assets, and institutions
- make planning and stewardship easier, not just data access easier

---

## Best Next Steps

=== "I want to use the data"

    - [Use PreComputed Geospatial Data](../use-precomputed-data/index.md)
    - [Public API References](../api/public-endpoints.md)
    - [STAC Specs](../api/stac-specs.md)

=== "I want to understand the theory"

    - [CoRE Stack Data Structure](../pipelines/watershed-data-structure.md)
    - [How Current Data Was Computed](../use-precomputed-data/how-current-data-was-computed.md)
    - [How Our Pipelines Work Algorithmically](../pipelines/how-pipelines-work-algorithmically.md)

=== "I want to build something"

    - [Innovation Challenges](innovation-challenges/index.md)
    - [Develop Computation Pipelines](../pipelines/index.md)
    - [Contributing](contributing.md)
