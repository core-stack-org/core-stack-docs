---
title: Infra
description: CoRE Stack infrastructure — AWS production servers and Tower Services.
---

# Infra

This section covers how CoRE Stack is hosted and operated.

| Environment | What it is | Start here |
| --- | --- | --- |
| **AWS Server** | Production on AWS (EC2, Amplify, GeoServer, STAC, monitoring) | [AWS Server](../server/index.md) |
| **Tower Services** | Shared cluster. Anyone can package an app and ask to deploy it (Drone, CEM, DIY LULC are live examples). | [Tower Services](tower-services/index.md) |

## AWS Server

Production topology, SSH access, Apache, Celery, GeoServer, STAC, credentials, OS tuning, and Nagios. All of it lives on one page:

[Open AWS Server documentation](../server/index.md){ .md-button .md-button--primary }

## Tower Services

A **shared cluster** for anyone who wants to deploy an app. **Drone**, **CEM**, and **DIY LULC** are already running; yours can be next. Start with [Tower Services](tower-services/index.md). Live URLs: [Deployed Architecture](tower-services/deployed-architecture.md).

[Open Tower Services](tower-services/index.md){ .md-button }
