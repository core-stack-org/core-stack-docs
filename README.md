# CoRE Stack Documentation

This repository contains the source files for the CoRE Stack documentation site published at `https://docs.core-stack.org/`.

## Branch Workflow

- `developer_own_branch`: individual documentation work.
- `dev`: shared integration branch for reviewed developer work.
- `staging`: UAT branch. Accepts pull requests from `dev` only.
- `main`: production source branch. Accepts pull requests from `staging` only.
- `gh-pages`: generated production site output. This branch is locked and must not be edited manually.

Maintainers should follow the internal release SOP in [DOCUMENTATION_RELEASE_SOP.md](DOCUMENTATION_RELEASE_SOP.md) before promoting changes from `dev` to `staging` and from `staging` to `main`.

## Local Development

```bash
git clone https://github.com/core-stack-org/core-stack-docs.git
cd core-stack-docs
git checkout dev
uv sync
uv run mkdocs serve -a 127.0.0.1:8001
```

Open `http://127.0.0.1:8001` to preview the site.

## Editing Guide

- Most pages live under `docs/`.
- Screenshots and static files belong under `docs/assets/`.
- If you add, move, or rename a page, update `mkdocs.yml`.
- Do not commit generated `site/` output.
- Use short-lived branches such as `docs/update-stac-specs`.

## Build Commands

```bash
# Build the hosted documentation site
uv run mkdocs build --clean

# Build an offline bundle
MKDOCS_OFFLINE=true uv run mkdocs build --clean

# Preview locally
uv run mkdocs serve -a 127.0.0.1:8001
```

## Production Deployment

Production deploys must be built from `main` after UAT approval:

```bash
git checkout main
git pull origin main
uv sync
uv run mkdocs build --clean
uv run mkdocs gh-deploy --force --remote-branch gh-pages --cname docs.core-stack.org
```

`gh-pages` should receive generated output only through the deployment step.

## Repository Layout

```text
docs/             # Markdown pages and assets
overrides/        # Material for MkDocs theme overrides
mkdocs.yml        # site navigation and theme configuration
pyproject.toml    # Python dependencies
uv.lock           # locked Python dependency graph
```
