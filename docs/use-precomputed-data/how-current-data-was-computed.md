# How Current Data Was Computed

This page explains why CoRE Stack computes the public data products it does, how those products relate to the CoRE Stack data structure, and why the public surface is curated instead of trying to publish every possible derived combination.

Read this page as the bridge between:

- [CoRE Stack Data Structure](../concepts/watershed-data-structure.md)
- [How Our Pipelines Work Algorithmically](../concepts/how-pipelines-work-algorithmically.md)
- the public APIs, STAC assets, and downloadable layers in this section

---

## Why This Page Exists

When people first meet CoRE Stack data, a natural question is:

“Why were these layers precomputed, and not some other thousand combinations?”

The answer is that CoRE Stack is building **public geospatial infrastructure**, not only running analyses for one internal use case.

That means the public products have to be:

1. scientifically meaningful
2. structurally consistent with the stack’s registry and joins
3. useful across many places, not only one project site
4. understandable enough to publish publicly
5. stable enough to maintain through APIs, metadata, STAC, styles, and documentation

So the stack tries to precompute the layers that become durable building blocks for many later uses.

---

## Start From The Data Structure

The most important fact behind the current public data is this:

**CoRE Stack does not treat each dataset as an isolated map. It treats datasets as things that should attach to a stable landscape structure.**

That structure is explained in [CoRE Stack Data Structure](../concepts/watershed-data-structure.md), but the practical version is:

- people search through **state, district, and block**
- many computations make most sense on **micro-watersheds**
- some outputs are about **waterbodies, villages, assets, or enrichment layers**
- the public surface becomes useful only when those layers can be compared, joined, and reused together

This is why the public data is not centered on arbitrary polygons or ad hoc study areas. It is centered on standard units and repeated crosswalks between:

- hydrological correctness
- administrative usability

That is also why many public outputs are keyed to:

- `uid`-like micro-watershed identifiers
- tehsil or block-level discovery APIs
- standard layer names
- repeatable geometry products

---

## The Main Principle

CoRE Stack usually prefers to precompute:

- **foundational layers** that many other workflows depend on
- **canonical derived outputs** that answer recurring planning questions
- **joinable indicators** that can be recombined in many ways later
---

## Why These Particular Families Were Prioritized

The current public data families are not random. They reflect recurring planning questions.

### 1. Land use and land cover

These are foundational because many later questions depend on what is physically on the land:

- cropland
- vegetation
- built-up area
- water-related classes
- changes through time

Without LULC, many hydrology, drought, cropping, and restoration interpretations become weaker or much harder to compare.

### 2. Hydrology and water balance

These were prioritized because CoRE Stack is built for water-grounded planning.

The stack therefore needs outputs that help people reason about:

- rainfall and runoff behavior
- recharge-related logic
- watershed response
- upstream-downstream relationships

These are not only scientific outputs. They are planning primitives.

### 3. Surface water and waterbody workflows

These matter because waterbodies are directly visible, socially important, and often central to local planning, rejuvenation, and monitoring.

They also act as feature-level hydrological objects that can be related back to watersheds, zones of influence, and administrative planning.

### 4. Terrain, drainage, and raster derivatives

Terrain, slope, depressions, catchments, stream order, and drainage support layers were prioritized because they provide the physical logic beneath many water and land-use decisions.

These layers help answer:

- where water accumulates
- how water moves
- which places are steep, flat, connected, or constrained
- which restoration or conservation moves are physically plausible

### 5. Enrichment and implementation context

The stack also computes enrichment layers such as facilities, NREGA assets, aquifers, SOGE, and other overlays because planning never happens only in hydrological space.

Implementation happens through institutions, infrastructure, livelihoods, and administrative realities.

So CoRE Stack tries to keep both worlds connected:

- the hydrological landscape
- the implementation landscape

---

## Why Micro-Watersheds Matter So Much

The micro-watershed is the most important practical planning unit in the current stack.

That is not because villages or administrative boundaries are unimportant. It is because:

- water does not move according to administrative boundaries
- micro-watersheds are much closer to the real flow logic of landscapes
- they are standardized enough to act as a registry
- they make outputs comparable across large geographies

Once a signal can be attached to standardized micro-watersheds, many things become possible:

- comparison across years
- comparison across places
- joining hydrology to LULC
- joining terrain to restoration logic
- joining drought signals to public planning units

This is one of the strongest reasons the current public data looks the way it does. CoRE Stack is not only publishing maps. It is publishing data that can live inside a shared analytical structure.

---

## Why Administrative Units Still Matter

If micro-watersheds are so important, why does the public API still care so much about state, district, and block?

Because real users usually begin there.

People ask for data through names they know:

- state
- district
- block or tehsil
- village

So CoRE Stack’s public surface is designed to let people discover and retrieve data through administrative entry points, while many core computations still attach to hydrologically meaningful units beneath that interface.

This is one of the most important design choices in the platform:

- entry through administrative usability
- structure through hydrological logic

---

## The Actual Computation Shape

Most current public data follows a repeated shape:

1. start from source rasters, imagery, networks, or pan-India thematic layers
2. run a scientific or analytical transformation
3. clip, summarize, vectorize, or aggregate to stable units
4. store outputs with stable names and geometry conventions
5. publish them through layer metadata, APIs, GeoServer, and STAC

That means CoRE Stack usually does not stop at “we produced a raster.”

To become a public product, a computed layer often also needs:

- a predictable layer name
- a place in the dataset registry
- public metadata
- styling or download affordances
- documentation that explains what it is

This is why public data publishing is much narrower than internal computation possibility.

---

## What Was Computed, And Why

The best way to understand the current public data is by family.

| Family | What CoRE Stack tends to compute | Why this family is publicly valuable | How it fits the data structure |
|---|---|---|---|
| LULC and cropping-related workflows | land-use classes, cropping intensity, change-ready outputs | many downstream planning questions depend on land state and change | becomes joinable with watersheds, blocks, and later indicators |
| Hydrology | runoff and water-balance-style watershed indicators | supports water planning and watershed reasoning directly | naturally aligns with micro-watersheds and their connectivity |
| Surface water bodies | waterbody extents, supporting analytics, related summaries | visible, practical, and central to monitoring and rejuvenation | links waterbody features back to hydrological units and public layers |
| Terrain and drainage | slope, depressions, catchments, stream order, drainage derivatives | gives the physical basis for interpreting water movement and suitability | often summarized to watershed or block-scale structured outputs |
| Enrichment layers | facilities, NREGA assets, aquifer, SOGE, agroecological overlays | connects scientific layers to implementation and planning context | adds social, infrastructural, or thematic meaning to standard units |
| Time series | NDVI and temporal vegetation summaries | helps compare seasonality, change, and resilience | produces comparison-ready signals across standard units |

---

## Why This Matters For Users Of Precomputed Data

If you are using CoRE Stack data through APIs, STAC, GeoServer, or downloads, this page should change how you read the catalog.

You should not think:

“Where is the exact finished answer to my exact question?”

You should think:

“Which canonical outputs does the stack expose, and how do I combine them responsibly?”

That is the intended use pattern.

The public data was designed so that you can:

- start with administrative discovery
- move into stable hydrological or implementation layers
- join outputs by standard units
- build your own planning logic on top

---

## If The Data You Need Is Missing

That does not necessarily mean the stack is incomplete in a bad way. Often it means the exact combination you want sits one layer above standard outputs.

Your practical next moves are:

1. use [Public API References](public-apis.md) and [STAC Specs](stac-specs.md) to combine existing outputs yourself
2. move into [CoRE Stack Data Structure](../concepts/watershed-data-structure.md) if you want to understand how joins should be done
3. read [How Our Pipelines Work Algorithmically](../concepts/how-pipelines-work-algorithmically.md) if you want the modeling logic behind a family
4. go to [Pipeline Development](../pipelines/index.md) if the missing output should be computed directly
5. contribute or open an [issue](https://github.com/core-stack-org/core-stack-backend/issues) if the missing product deserves to become a standard public layer
