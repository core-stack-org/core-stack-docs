---
title: API Metadata
description: Fields returned by CoRE Stack public APIs, including data types, units, and descriptions.
---

# API Metadata

This page describes the fields returned by CoRE Stack public APIs, including their data types, units, and descriptions. The metadata is organised into two sections: Dataset APIs and Waterbody APIs.

The definitions are maintained in three JSON files. Dataset APIs use two files because the `get_tehsil_data` API has a separate dictionary, while the other dataset APIs are documented together. Waterbody APIs have their own dictionary.

## Dataset APIs

This section covers APIs that provide precomputed geospatial datasets and tehsil-level data. Its metadata comes from two JSON dictionaries:

- `get_tehsil_data.json` describes the layers and variables returned by the get_tehsil_data API.
- `other_public_api.json` describes the fields returned by the other dataset-related public APIs.

<div id="dataset-api-catalog"></div>

## Waterbody APIs

This section covers APIs that provide waterbody details and annual indicators. Its metadata is maintained separately in `waterbody_api.json`, which describes the fields returned by the waterbody APIs.

<div id="waterbody-api-catalog"></div>

<p id="metadata-status" role="status" aria-live="polite">Loading API metadata and variable definitions...</p>

## Data Dictionary Files

These are the source files used to populate the API metadata tables above. You can view them directly on GitHub or download them for your own use.

- [Tehsil data dictionary](https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/get_tehsil_data.json): layers and variables returned by the get_tehsil_data API.
- [Dataset API dictionary](https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/other_public_api.json): fields returned by the other dataset-related public APIs.
- [Waterbody API dictionary](https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/waterbody_api.json): fields returned by the waterbody APIs.
