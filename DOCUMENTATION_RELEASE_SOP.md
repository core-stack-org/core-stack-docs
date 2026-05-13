# Documentation Release SOP

This SOP is for maintainers and developers working on the CoRE Stack documentation repository. It is not part of the published MkDocs site.

## Goal

All documentation changes should move through a predictable branch flow:

```text
developer_own_branch -> dev -> staging -> main -> gh-pages
```

`main` is the production source branch. The `site/` directory is generated from `main`, then deployed to `https://docs.core-stack.org/` through `gh-pages`.

## Branch Rules

| Branch | Purpose | Rule |
| --- | --- | --- |
| `developer_own_branch` | Individual documentation edits. | Created from latest `dev`. |
| `dev` | Shared integration branch. | Accepts PRs from developer branches only. Requires 1 review. |
| `staging` | UAT source branch. | Accepts PRs from `dev` only. |
| `main` | Production source branch. | Accepts PRs from `staging` only after UAT approval. |
| `gh-pages` | Generated production deployment branch. | Locked. No manual edits or PRs. |

## Developer Workflow

```bash
git checkout dev
git pull origin dev
git checkout -b docs/short-change-name
```

Make documentation changes under `docs/`. If a page is added, renamed, or moved, update `mkdocs.yml`.

Preview and build:

```bash
uv sync
uv run mkdocs serve -a 127.0.0.1:8001
uv run mkdocs build --clean
```

Commit and push:

```bash
git status
git add docs mkdocs.yml
git commit -m "docs: describe the change"
git push -u origin docs/short-change-name
```

Open a PR into `dev`.

## UAT Promotion

After reviewed changes are merged into `dev`, open a PR from `dev` to `staging`.

After the PR is merged, build from `staging`:

```bash
git checkout staging
git pull origin staging
uv sync
SITE_URL=https://uat-docs.core-stack.org uv run mkdocs build --clean
```

Deploy the generated `site/` directory to the UAT environment.

## Production Promotion

After UAT approval, open a PR from `staging` to `main`.

After the PR is merged:

```bash
git checkout main
git pull origin main
uv sync
uv run mkdocs build --clean
uv run mkdocs gh-deploy --force --remote-branch gh-pages --cname docs.core-stack.org
```

The generated production site is published at `https://docs.core-stack.org/`.

## Release Checklist

- Developer branch is based on latest `dev`.
- PR target is correct.
- Required review is complete.
- `uv run mkdocs build --clean` passes.
- UAT approval is recorded before merging to `main`.
- Production deploy is run only from `main`.
- `gh-pages` receives generated output only.
