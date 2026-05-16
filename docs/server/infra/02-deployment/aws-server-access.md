# AWS Server Access and Roles

This page explains how CoRE Stack infrastructure is split across two AWS servers and how to connect securely using an SSH private key.

## Server Topology

We currently operate two main servers:

1. **Application Server (Production)**
   - Primary purpose: run core backend services.
   - Hosts:
     - Django backend application
     - GeoServer
     - PostgreSQL database

2. **UAT + ODK Server**
   - Primary purpose: UAT environment and ODK workloads.
   - Hosts:
     - UAT services
     - ODK server components

## SSH Access Pattern

Use key-based SSH access to connect to either server:

```bash
ssh -i <key_name> ubuntu@domain
```

Replace:

- `<key_name>` with your private key file (for example `corestack-prod.pem`)
- `domain` with the target server domain or public IP

Example:

```bash
ssh -i corestack-prod.pem ubuntu@geoserver.core-stack.org
```

## Access Notes

- Keep private keys secure and do not commit them to any repository.
- Apply least-privilege access controls for team members.
- Use the correct key for each environment (production vs UAT).
- If SSH fails, verify:
  - key permissions
  - security-group inbound rule for port `22`
  - correct `ubuntu@host` target
