---
title: Explore CoRE Stack
description: A showcase of what CoRE Stack computation already powers, and what developers can build next.
---

# Explore CoRE Stack

CoRE Stack becomes exciting when you stop seeing it as a database and start seeing it as public geospatial infrastructure.

The backend computes landscape evidence: micro-watersheds, waterbodies, hydrology, terrain, LULC, cropping intensity, drainage, restoration indicators, tree health, enrichment overlays, layer metadata, and public APIs. Once that evidence is published in reusable units, developers can build tools for planning, research, field verification, community dialogue, and public accountability.

## What The Stack Already Makes Possible

| Example | Why it is interesting for developers |
| --- | --- |
| [Know Your Landscape / Explorer](https://www.explorer.core-stack.org/) | A map interface where users can choose a region, inspect micro-watersheds and villages, use filters, open reports, and download layers for deeper work. |
| [Micro-watershed registry](https://core-stack.org/a-micro-watershed-registry-for-india/) | A shared planning grid where terrain, land use, rainfall, runoff, water balance, waterbodies, farms, plantations, and drainage connectivity can be indexed to the same landscape unit. This makes comparison and joins much easier than starting from arbitrary polygons every time. |
| [Starter-kit for geospatial programming](https://core-stack.org/core-stack-starter-kit-for-geospatial-programming/) | A developer can call CoRE Stack APIs, pull layers for a place, populate a tehsil -> MWS -> waterbody structure, flatten it into a dataframe, and start asking questions in minutes. The example comparing Bhavnagar and Devadurga shows how water balance, cropping intensity, surface water, and drought can begin to tell different agricultural stories. |
| [Commons Connect](https://github.com/core-stack-org/Commons-Connect) | A community-facing React app where computed spatial evidence supports natural resource planning. The [field stories](https://core-stack.org/stories-from-the-ground/) show the deeper point: the software reduces tedious data assembly, and creates more time for dialogue, validation, and trust-building. |
| [River rejuvenation workflow](https://core-stack.org/planning-river-rejuvenation-over-a-large-stretch/) | Micro-watershed connectivity can help trace upstream and downstream relationships, showing which catchments may need treatment when downstream water availability is declining. This is computation becoming planning logic. |
| [Protected areas tracker](https://core-stack.org/tracker-for-protected-areas/) | News articles, protected-area boundaries, tree-cover change, canopy density, and tree-height indicators can become a monitoring interface. The current app maps nearly 600 protected areas and points toward richer work with fragmentation, water availability, land-use change, eBird, and iNaturalist. |
| [Event mining from news](https://core-stack.org/innovation-challenge-2-mining-insights-from-events/) | A pipeline extracts structured events from news, including human-wildlife conflict, crop damage, and avian flu or wild-bird deaths. These events can be overlaid with CoRE Stack layers such as LULC change, drought, surface water, NDVI, and forest edges to build public-interest risk monitors. |
| [Ecological restoration site search](https://core-stack.org/core-stack-ecological-restoration-toolkit-identifying-prospective-sites-for-restoration/) | Instead of imposing one broad rule for restoration everywhere, the prototype starts from reference sites and looks for similar places using rainfall, elevation, terrain, fire, degradation, biomass, change detection, and LULC layers. |
| [Continuous ecological monitoring](https://core-stack.org/ecological-restoration-toolkit-continuous-ecological-monitoring/) | Field data, photos, GPS tracks, notes, audio, and local processing can stay organized with spatial context. This points toward local-first monitoring systems where researchers own their data and still benefit from geospatial computation. |
| [Bioacoustics analysis pipelines](https://core-stack.org/core-stack-ecological-restoration-toolkit-bioacoustics-monitoring-pipelines/) | Audio recorders, species detection, acoustic indices, PCA, and site comparison become part of ecological monitoring. This widens CoRE Stack thinking beyond satellite layers into field evidence and biodiversity signals. |

## The Larger Direction

Public-interest geospatial work is moving fast. News can be mined into event datasets. Remote sensing foundation models such as [TESSERA](https://core-stack.org/tessera-and-core-stack-hackathon-on-geospatial-ai/) are changing what can be extracted from satellite imagery. Cloud-native formats such as Zarr and GeoParquet are becoming part of the everyday geospatial stack. Biodiversity monitoring is pulling together sensors, field notes, citizen science, and satellite data.

CoRE Stack is a place where these signals become useful for grounded planning, not scattered experiments.


## Ideas Worth Building

Here are directions that fit naturally on top of the stack:

- A water stress early-warning dashboard that combines rainfall, runoff, evapotranspiration, surface water, well depth, cropping intensity, and drought.
- A community water planning assistant that turns MWS evidence into discussion prompts for Gram Sabha or village-level planning.
- A protected-area health monitor that combines tree cover, canopy density, news events, surface water, fragmentation, and citizen-science biodiversity observations.
- A crop-risk explorer that joins pest, locust, drought, fire, extreme-weather, NDVI, and crop-intensity signals.
- A restoration opportunity finder where local reference sites teach the model what "suitable" means in a specific ecological and social context.
- A public works alignment tool that checks whether NREGA assets, waterbodies, drainage, and watershed stress point to the same priorities.
- A field workflow where local observations, photos, and corrections improve satellites imagery signals over time.
- A STAC-powered data browser that lets researchers move from catalog discovery to notebooks without custom scraping.
- A local-first biodiversity monitoring app that connects audio, transects, land-cover strata, and restoration outcomes.

## Why Build It Together

The hard part of public geospatial work is rarely one algorithm. It is the whole chain:

1. collect or derive data responsibly
2. compute at a useful planning unit
3. publish with metadata and styles
4. make it visible to non-specialists
5. let field users validate it
6. improve the computation from real use

CoRE Stack is trying to make that chain a public infrastructure. Developers can help by adding datasets, improving APIs, building interfaces, testing workflows, improving metadata, creating analysis notebooks, making field tools, and turning promising research into maintained pipelines.

The ambition is simple and large: a shared geospatial knowledge stack for communities, researchers, civil society groups, and public institutions to understand landscapes together.

## Start Somewhere

| If you want to... | Start here |
| --- | --- |
| Explore published data | [Use PreComputed Geospatial Data](../use-precomputed-data/index.md) |
| Try the public APIs in a notebook | [Public APIs](../use-precomputed-data/public-apis.md) |
| Understand the backend shape | [Backend Code Map](backend-code-map.md) |
| Add a computation | [Develop New Pipelines](../pipelines/index.md) |
| Check available computing APIs | [Computing API Paths](../pipelines/computing-endpoints.md) |
| See community and challenge work | [Contributions](../community/contributions.md) and [Innovation Challenges](../community/innovation-challenges/index.md) |
