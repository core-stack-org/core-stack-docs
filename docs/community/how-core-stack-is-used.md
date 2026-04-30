---
title: How CoRE Stack Is Used
description: A short map of how CoRE Stack is used in practice by common people, researchers, developers, and planning teams.
---

# How CoRE Stack Is Used

CoRE Stack is not only a backend or a dataset catalog. It is meant to help people understand and act on landscapes.

---

## 1. Use Data And Dashboards Directly

People can start from:

- [Use APIs](https://core-stack.org/use-apis/)
- [STAC Browser](https://stac.core-stack.org/)
- [Know Your Landscape](https://explorer.core-stack.org/)

This path is best for people who want:

- ready datasets
- map layers
- public API access
- basic landscape understanding without setting up the backend

---

## 2. Build Analysis On Top Of The Data Structure

A second practical path:

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
