# Documentation Release SOP

Internal runbook for maintaining and deploying `core-stack-org/core-stack-docs`.

Production site:

```text
https://docs.core-stack.org/
```

Repository:

```text
https://github.com/core-stack-org/core-stack-docs/
```

## Branch Model

Use `main` as the GitHub default branch.

Do not use `gh-pages` as the default branch. It contains generated static files only. Developers should land on `main`, where the source docs, README, `mkdocs.yml`, lockfile, and release SOP live.

```text
developer branch -> dev -> staging -> main -> gh-pages
```

| Branch | Purpose |
| --- | --- |
| `dev` | Reviewed developer documentation changes. |
| `staging` | UAT source branch. |
| `main` | Production source branch. |
| `gh-pages` | Generated deployment branch. Do not edit manually. |

## First-Time Local Setup

```bash
git clone https://github.com/core-stack-org/core-stack-docs.git
cd core-stack-docs
git fetch origin --prune
git checkout dev
git pull --ff-only origin dev
uv sync
uv run mkdocs build --clean
uv run mkdocs serve -a 127.0.0.1:8001
```

Preview at:

```text
http://127.0.0.1:8001
```

## Make A Documentation Change

Start from `dev`:

```bash
git fetch origin --prune
git checkout dev
git pull --ff-only origin dev
git checkout -b docs/short-change-name
```

Edit as needed:

```text
docs/                         Markdown pages and assets
mkdocs.yml                    Navigation and site config
README.md                     Contributor-facing instructions
DOCUMENTATION_RELEASE_SOP.md  Internal release instructions
pyproject.toml / uv.lock      Build dependencies
overrides/                    Theme overrides
```

Do not edit or commit:

```text
site/
gh-pages branch files by hand
```

Build, commit, and push:

```bash
uv sync
uv run mkdocs build --clean
git status
git diff
git add docs mkdocs.yml README.md DOCUMENTATION_RELEASE_SOP.md .python-version pyproject.toml uv.lock uv.toml overrides
git commit -m "docs: describe the change"
git push -u origin docs/short-change-name
```

Open a PR:

```text
source: docs/short-change-name
target: dev
requirement: 1 review
```

## Promote To Staging

After the docs PR is merged into `dev`, create a promotion branch:

```bash
git fetch origin --prune
git checkout staging
git pull --ff-only origin staging
git checkout -b promote/dev-to-staging
git merge --no-ff origin/dev
uv sync
uv run mkdocs build --clean
git push -u origin promote/dev-to-staging
```

Open a PR:

```text
source: promote/dev-to-staging
target: staging
purpose: UAT candidate
```

After merge, build UAT from `staging`:

```bash
git checkout staging
git pull --ff-only origin staging
uv sync
SITE_URL=https://uat-docs.core-stack.org uv run mkdocs build --clean
```

Deploy the generated `site/` directory to the UAT environment.

## Promote To Production Source

After UAT approval, create a promotion branch:

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git checkout -b promote/staging-to-main
git merge --no-ff origin/staging
uv sync
uv run mkdocs build --clean
git push -u origin promote/staging-to-main
```

Open a PR:

```text
source: promote/staging-to-main
target: main
condition: UAT approved
```

## Deploy Production

Deploy only from updated `main`.

The custom domain is tracked in `docs/CNAME`; it must contain:

```text
docs.core-stack.org
```

Run:

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
uv sync
uv run mkdocs build --clean
test "$(cat site/CNAME)" = "docs.core-stack.org"
uv run mkdocs gh-deploy --force --remote-name origin --remote-branch gh-pages
```

Verify:

```bash
git fetch origin gh-pages
git show origin/gh-pages:CNAME
```

Expected:

```text
docs.core-stack.org
```

Open:

```text
https://docs.core-stack.org/
```

## GitHub Branch Rules

Set once in repository settings.

```text
Default branch: main
```

| Branch | Rule |
| --- | --- |
| `dev` | PR required, 1 approval, no direct pushes for regular developers. |
| `staging` | PR required, accepts promotions from `dev`, no direct pushes for regular developers. |
| `main` | PR required, accepts promotions from `staging`, UAT approval required, no direct pushes for regular developers. |
| `gh-pages` | Do not make default. Do not edit manually. Update only through `mkdocs gh-deploy`. |

## Quick Checks

Check branch differences:

```bash
git fetch origin --prune
git log --oneline origin/main..origin/dev
git log --oneline origin/dev..origin/main
git log --oneline origin/main..origin/staging
git log --oneline origin/staging..origin/main
```

No output means the compared branches match.

Check deploy readiness:

```bash
git status
uv run mkdocs build --clean
test "$(cat site/CNAME)" = "docs.core-stack.org"
```
