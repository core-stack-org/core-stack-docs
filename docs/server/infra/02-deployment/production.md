# Production Deployment

This document captures the current production deployment footprint for CoreStack services.

## How to Use This Document

- Treat this as the source of truth for current production topology.
- Update fields immediately after infra changes (domain, app IDs, runtime, SSL, etc.).
- Pair this document with service-specific runbooks in `../04-configuration/`.

## CoreStack Backend

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/core-stack-backend |
| Environment | Python 3, Django |
| Deployed Location | AWS EC2 |
| Domain | geoserver.core-stack.org |
| GeoServer Port | 8443 |
| Virtual Environment | `corestack-backend` |
| Code Location | `/home/ubuntu/cfpt/corestack-backend` |
| Package Manager | conda (avoid direct `pip` installs in production) |
| Database Engine | PostgreSQL (same host) |
| Database Name | `corestack` |
| Web Server | Apache |
| SSL Authority | Let's Encrypt |
| SSL Renewal | Every 3 months |
| Deployment Type | Manual |

## Landscape Explorer (LE) and KYL

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/landscape-explorer |
| Environment | React |
| Deployed Location | AWS Amplify |
| Amplify App ID | `d2s4eeyazvtd2g` |
| Domain | explorer.core-stack.org |
| CI/CD Branch | `main` |
| Deployment Type | Automated (push to `main`) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |


## Dashboard

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/admin-dashboard |
| Environment | React (expected) |
| Deployed Location | AWS Amplify (expected) |
| Amplify App ID | d2u6quqcimqsuk |
| Domain | dashboard.core-stack.org (confirm current DNS) |
| CI/CD Branch |Main |
| Deployment Type | Automated (expected) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |

## Commons Connect React App

| Field | Value |
|---|---|
| Code Repo | https://github.com/core-stack-org/Commons-Connect|
| Environment | React (expected) |
| Deployed Location | AWS Amplify (expected) |
| Amplify App ID | d1rx3d0dyjc5v7 |
| Domain | nrm.core-stack.org |
| CI/CD Branch | Main |
| Deployment Type | Automated (expected) |
| SSL Authority | AWS |
| SSL Renewal | Managed by AWS |

## Frontend Mapping Guardrail

Do not copy values between LE, KYL, Dashboard, and CC by assumption. For each app, validate all of the below before updating this file:

1. GitHub repository URL.
2. Amplify App ID.
3. Connected branch in Amplify.
4. Public DNS name (and certificate coverage).
5. Responsible owner/on-call group.

## OS Operations Baseline

For production Linux host-level tuning and troubleshooting (including `vm.swappiness`, swap sizing decisions, and memory incident steps), use:

- `../04-configuration/os-memory-tuning.md`

## Quick Verification Checklist

- Backend URL responds over HTTPS.
- GeoServer on port `8443` is reachable.
- Amplify apps are mapped to expected domains.
- SSL certificates are valid and not nearing expiry.

