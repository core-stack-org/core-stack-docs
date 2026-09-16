---
title: Infra
description: CoRE Stack infrastructure — AWS production servers and Tower Services.
---

# Infra

This section covers how CoRE Stack is hosted and operated.

| Environment | What it is | Start here |
| --- | --- | --- |
| **AWS Server** | Production on AWS (EC2, Amplify, GeoServer, STAC, monitoring) | [AWS Server](../server/index.md) |
| **Tower Services** | Drone, Bioacoustic, DIY LULC (and Airflow/STACD) | [Tower Services](tower-services/index.md) |

## AWS Server

Production topology, SSH access, Apache, Celery, GeoServer, STAC, credentials, OS tuning, and Nagios. All of it lives on one page:

[Open AWS Server documentation](../server/index.md){ .md-button .md-button--primary }

## Tower Services

Small Docker compute apps: **Drone**, **Bioacoustic** (CEM), and **DIY LULC**. Start with the architecture diagram and shared terms.

[Open Tower Services](tower-services/index.md){ .md-button }
