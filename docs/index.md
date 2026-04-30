---
title: Welcome to CoRE Stack
---

# CoRE Stack Documentation

CoRE Stack is open geospatial infrastructure for landscape planning, public data access, and community-grounded decision-making.

It helps people move from scattered public datasets to usable planning evidence: micro-watersheds, villages, generated layers, public APIs, Earth Engine assets, GeoServer layers, notebooks, and community-facing tools.

## Start Here

| You want to... | Start with... |
| --- | --- |
| understand the core stack data structure | [CoRE Stack Data Structure](concepts/watershed-data-structure.md) |
| inspect public APIs and get data | [Public APIs](use-precomputed-data/public-apis.md) |
| install core stack backend | [Installer](developers/installer.md) |
| understand how current data was computed | [How Current Data Was Computed](use-precomputed-data/how-current-data-was-computed.md) |
| install the backend and build pipelines | [Develop CoRE Stack](developers/index.md) |
| run current pipelines on your ROI | [computing api endpoints](pipelines/computing-endpoints.md) |

## CoRE Stack Architecture

```mermaid
graph TB
    %% Data Sources
    NASA[🛰️ NASA Data Sources<br/>MODIS, Landsat, VIIRS<br/>REST API, JSON, GeoTIFF]

    %% Core Processing
    GEE[⚙️ Google Earth Engine<br/>Petabyte-scale Computation<br/>JavaScript, Python APIs<br/>Cloud-native Processing]

    %% Quality Assurance
    QA[✓ Quality Assurance Layer<br/>ML Validation Models<br/>Statistical Analysis<br/>Human Moderation Queue]

    %% Data Storage & Services
    PostGIS[(🗄️ PostGIS Database<br/>Spatial Data Store<br/>Temporal Indexing<br/>ACID Compliance)]

    GeoServer[🌍 GeoServer<br/>OGC Standards: WMS/WFS/WCS<br/>REST API Gateway<br/>Spatial Data Federation]

    %% Applications
    WebApp[💻 Web Application<br/>React + TypeScript<br/>WebGL Rendering<br/>Real-time Collaboration]

    MobileApp[📱 Mobile App<br/>React Native<br/>Android: Dart<br/>Offline-first Architecture]

    %% Community & Planning
    Community[👥 Community Platform<br/>Participatory Mapping<br/>Consensus Protocols<br/>Stakeholder Management]

    DPR[🤖 Automated DPR Generator<br/>ML-driven Impact Assessment<br/>Resource Optimization<br/>Regulatory Compliance]

    %% Data Flow Connections
    NASA -->|Scheduled ETL<br/>Batch Processing| GEE
    GEE -->|Processed Datasets<br/>Quality Metrics| QA
    QA -->|Validated Data<br/>Metadata Enrichment| PostGIS
    PostGIS <-->|Spatial Queries<br/>Transaction Log| GeoServer

    %% Application Connections
    GeoServer -->|REST API<br/>JSON/GeoJSON| WebApp
    GeoServer -->|Mobile API<br/>Compressed Tiles| MobileApp

    %% Bidirectional Data Flow
    WebApp <-->|User Contributions<br/>Real-time Updates| PostGIS
    MobileApp -->|Field Data Collection<br/>Crowdsourced Intelligence| PostGIS

    %% Community Integration
    WebApp -->|Visualization Layer<br/>Interactive Maps| Community
    Community -->|Planning Workflows<br/>Decision Records| DPR
    PostGIS -->|Historical Data<br/>Trend Analysis| DPR

    %% System Objectives
    subgraph "🔍 Ecosystem Intelligence"
        NASA
        GEE
        QA
    end

    subgraph "🛠️ Scientific Tooling"
        PostGIS
        GeoServer
        WebApp
    end

    subgraph "🤝 Participatory Governance"
        MobileApp
        Community
    end

    subgraph "🤖 Automated Impact Assessment"
        DPR
    end

    %% Styling
    classDef dataSource fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    classDef processing fill:#4ECDC4,stroke:#333,stroke-width:2px,color:#fff
    classDef storage fill:#45B7D1,stroke:#333,stroke-width:2px,color:#fff
    classDef application fill:#96C93D,stroke:#333,stroke-width:2px,color:#fff
    classDef community fill:#FDA085,stroke:#333,stroke-width:2px,color:#fff

    class NASA dataSource
    class GEE,QA processing
    class PostGIS,GeoServer storage
    class WebApp,MobileApp application
    class Community community
```

## API Access

To use precomputed data programmatically, you need CoRE-Stack API key.

[Register or sign in at dashboard.core-stack.org](https://dashboard.core-stack.org/){ .md-button .md-button--primary }

Use the API to access the data, and try our demo notebooks.

1. [Open the Water Balance Analysis notebook](https://colab.research.google.com/drive/1uZH1KZFbe0TUIgCECOz_2cQ1jUfZglsA?usp=sharing#scrollTo=K26lCyd3u93J){ .md-button .md-button--primary }
2. [Open the Cropping Intensity Analysis notebook](https://colab.research.google.com/drive/1zv9TWdzfaEanE_i1kKw2Cr2snoCEhuIg?usp=sharing){ .md-button .md-button--primary }

---

## About Us

CoRE Stack, Commoning for Resilience and Equality, is a social-tech enterprise working with underserved communities in low-resource and remote areas.

We build participatory technology platforms that help communities understand pathways for resilience and development, use scientific evidence in local decision-making, and strengthen solidarity across institutions. Our work focuses on community institutions, equity, responsible AI, ethical data practice, and open-source tools for transparent development.

By making landscape data easier to understand and act on, CoRE Stack helps communities manage natural resources and move toward climate-resilient, fair, and sustainable futures.

## Partners

Our journey is strengthened by partners and collaborators including IIT Delhi, IIT Palakkad, GramVaani, and Magasool, with continued support and affiliation from GIZ, RainMatter, FES, Common Grounds, and Tarides.

## CoRE-Stack Building Blocks

- [CoRE Stack website](https://core-stack.org)
- [Backend repository](https://github.com/core-stack-org/core-stack-backend)
- [CoRE Stack GEE app](https://ee-corestackdev.projects.earthengine.app/view/core-stack-gee-app)
- [Landscape Explorer](https://www.explorer.core-stack.org/)
- [Commons Connect](https://github.com/core-stack-org/Commons-Connect)
- [Try our notebooks](https://github.com/core-stack-org/corestack-notebooks)

## License

- License: [GNU Affero General Public License v3.0](reference/license.md)
