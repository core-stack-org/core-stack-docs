# Credentials and Secrets Management

Use this guide for handling production credentials across backend, GeoServer, STAC, and frontend deployments.

## Core Rule

- Default/example credentials shown in setup docs are bootstrap-only examples.
- Production credentials must never be committed to this repository.

## What Must Be in the Secret Manager

Store the following in your organization's approved secret manager:

- PostgreSQL usernames/passwords
- Django `SECRET_KEY` and API keys
- GeoServer admin credentials
- STAC database credentials
- RabbitMQ/Flower auth (if enabled)
- any third-party token (GEE, WhatsApp, maps, etc.)

## Incident/Server Response Access

The server response team should have read access to production secrets through role-based access in the secret manager.

Minimum process:
1. define secret owner
2. define responder read role
3. define break-glass escalation contact
4. audit access quarterly

If a responder needs access, request role assignment from the platform/security owner for the relevant environment.

## Rotation Guidance

- Rotate bootstrap defaults immediately after first deployment.
- Rotate high-risk secrets on incident or personnel change.
- Record rotation date + owner in the operations tracker.

## Documentation Rule

When writing infra docs:
- include placeholders like `<REPLACE_WITH_STRONG_PASSWORD>`
- link to this file for credential handling
- avoid hardcoded passwords in examples unless explicitly marked as disposable bootstrap defaults
