# Contribution Showcase

This page tracks major community-built analyses, datasets, dashboards, and tools that extend the CoRE Stack ecosystem. The focus here is on work that can inform or integrate with core repositories such as `core-stack-backend`, `landscape-explorer`, and related CoRE Stack applications.

We want to highlight substantive contributions such as reusable datasets, pipeline ideas, validation tools, dashboards, and integrations built through open-source collaboration, innovation challenges, and follow-on community work.

---

## [Innovation Challenge Contributions](https://core-stack.org/first-round-of-innovation-challenge-advances/)

| Contributor | Contribution | Current artifact | Why it matters for CoRE Stack | Current integration direction |
|-------------|--------------|------------------|-------------------------------|-------------------------------|
| Sanket Gharat | Nashik onion dynamics dashboard | [Live dashboard](https://nashik-onion-dynamics-c45btfoncjezeeoecgxpn4.streamlit.app/) | combines cropping intensity, waterbody layers, onion price signals, and mandi proximity into a district-level analytical workflow | reusable agri-market analytics pattern for district dashboards and backend-backed analyses |
| Anoop Asranna | Anekal biodiversity dashboard | [Live dashboard](https://www.cse.iitd.ernet.in/~aseth/temp/anekal_all_lakes_2026_2.html) | augments waterbody records with biodiversity observations from eBird and iNaturalist | pathway toward biodiversity-aware lake and waterbody views in CoRE Stack surfaces |
| Trishal Kumar | Fields / Field Validator | [GitHub repository](https://github.com/tkkr6895/fields) | enables offline-first field validation of land-cover layers using CoRE Stack APIs and Dynamic World | supports ground-truth collection and calibration workflows for future layer and pipeline improvement |

---

## Highlighted Contributions

### Sanket Gharat

Sanket's Nashik work shows how CoRE Stack layers can be combined with external market and infrastructure data to ask practical planning questions. The project studies Nashik district from `2017` to `2025`, relating onion prices to cropping intensity, land-use transitions, waterbodies, and distance from mandis and traders.

- A dashboard combining onion price time series, mapped market actors, cropping-intensity layers, and remote-sensing-derived waterbodies.
- The work is especially valuable because it turns CoRE Stack data into an econometric and decision-support workflow rather than only a visualization.
- This contribution can help in integrating agri-market related analysis to CoRE Stack backend.

### Anoop Asranna

Anoop's Anekal biodiversity dashboard connects lake monitoring with ecological observation data. it shows a workflow for waterbodies in Anekal that merges CoRE Stack lake metadata, OpenStreetMap geometries, and citizen-science observations from eBird and iNaturalist.

- The project includes historical biodiversity records, buffered lake matching, and a repeatable update workflow for `2026` observations.
- Integration with waterbody dashboards lets us analyse biodiversity change alongside land-use change and climate-related indicators.
- Such enrichment contribution can materially deepen `landscape-explorer` and other waterbody-facing interfaces.

### Trishal Kumar

Trishal's Fields project is a mobile-first field validation application for land-use and land-cover datasets. It is designed to work offline in the field while still integrating with CoRE Stack APIs, Google Earth Engine Dynamic World layers, and exported observation workflows.

- The app supports GPS-based field observations, photographs, offline caching, later sync, and JSON or CSV export.
- CoRE Stack layers are generated based on real ground-truth observations and need local calibration, making this project highly relevant to future validation loops around pipeline outputs.

---

## How We Will Maintain This Page

We will keep adding major ecosystem contributions here as they come in. Priority goes to work that has at least one of the following:

- a live demo, public repository, or reproducible notebook
- a clear relationship to CoRE Stack datasets, APIs, explorer surfaces, or backend integrations
- evidence that the work adds new data, validation capacity, analytical value, or reusable tooling
