# CoRE Stack Documentation Project Updates

## Current Status

**Phase:** Initial Skeleton Creation  
**Started:** 2026-03-04  
**Target:** Complete documentation structure and Phase 1 drafts

## Recent Decisions

### 1. Documentation Architecture Adopted

- **Framework:** Diátaxis (Tutorials, How-To Guides, Reference, Explanation)
- **Platform:** MkDocs-Material
- **Location:** Separate docs repo (core-stack-docs) linked to backend

### 2. Local-First Strategy

Decided to prioritize "Local Computation Mode" documentation:

- STAC fetcher for downloading pre-computed data
- Local engine equivalents using geopandas/rasterio
- @route_local_compute decorator pattern
- Target: Zero cloud credentials needed for basic usage

### 3. Repository Linking Strategy

- Primary: Link to local backend repo when available
- Fallback: GitHub blob URLs with line ranges
- Tracking: Maintain version-tracking.md for sync state

### 4. Persona Definitions

Identified 5 core user types:

1. **Users** - API consumers, data analysts
2. **Builders** - Backend developers, pipeline creators
3. **Researchers** - Scientists, algorithm verifiers
4. **UI Designers** - Frontend developers, visualization
5. **Data Stewards** - Community data collectors

## Open Questions

### Technical

1. Should we auto-generate API docs from drf-yasg Swagger?
2. How to handle GEE authentication in documentation examples?
3. What is the best way to document Celery task patterns?

### Organizational

1. Should docs PRs be required for code PRs?
2. How to incentivize community documentation contributions?
3. What is the review process for technical accuracy?

### Tooling

1. Should we add interactive code playgrounds?
2. Do we need multi-language examples (Python, R, JS)?
3. How to handle versioned documentation?

## Next Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| MkDocs skeleton | 2026-03-05 | In Progress |
| Phase 1: Getting Started | 2026-03-07 | Pending |
| Phase 2: Local-First | 2026-03-10 | Pending |
| Phase 3: API Playground | 2026-03-14 | Pending |
| Phase 4: Science Pipelines | 2026-03-20 | Pending |
| Phase 5: Community | 2026-03-25 | Pending |

## Blockers

None currently identified.

## Notes from Initial Discussion

Key insights from Gemini conversation:

1. **FastAPI** is gold standard for Python backend docs
2. **Home Assistant** successfully separates User vs Developer docs
3. **Kubernetes** provides good architectural overview patterns
4. Fragmented documentation is the #1 killer of OSS growth
5. README should answer in 30 seconds: What? Why? How to install?

## Codebase Observations

From analyzing corestack-backend-tree.txt:

- Heavy Django project with many apps
- GEE integration in gee_computing/
- Extensive computing/ directory with scientific pipelines
- WhatsApp bot interface (bot_interface/)
- Community engagement features (community_engagement/)
- Stats generation for MWS and village indicators
- Water rejuvenation planning features

This suggests need for domain-specific documentation paths:
- Hydrology/Water resource management
- Agriculture/LULC analysis
- Community participation
- Administrative planning
