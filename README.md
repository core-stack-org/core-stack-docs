# CoRE Stack Documentation

This repository contains the documentation for the CoRE Stack (Community Resource Planning Stack) - a community-built, open-source geospatial platform for democratic planning, agricultural resource management, and participatory governance.

## Quick Start

To preview the documentation locally:

```bash
# The virtual environment is already set up with uv
# Just run the development server
uv run mkdocs serve
```

Then open your browser at http://127.0.0.1:8000

## Available Commands

```bash
# Serve the documentation with live reload
uv run mkdocs serve

# Build the documentation (outputs to site/)
uv run mkdocs build

# Deploy to GitHub Pages (when configured)
uv run mkdocs gh-deploy
```

## Project Structure

```
docs/
├── index.md                    # Home page
├── vision.md                   # Vision statement
├── get-started/                # Getting started guides
│   ├── index.md
│   ├── interactive-installer.md
│   └── first-run.md
├── api/                        # API reference
│   └── index.md
├── community/                  # Community resources
│   ├── contributing.md
│   └── innovation-challenges.md
└── stylesheets/
    └── extra.css               # Custom styles
```

## Features

- **Material Design Theme**: Modern, responsive design with light/dark mode
- **Mermaid Diagrams**: Support for architecture diagrams
- **Code Highlighting**: Syntax highlighting for all code blocks
- **Search**: Full-text search across all documentation
- **Navigation**: Tabbed navigation with expandable sections
- **Mobile-Friendly**: Responsive design works on all devices

## Technology Stack

- [MkDocs](https://www.mkdocs.org/) - Static site generator
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) - Theme
- [PyMdown Extensions](https://facelessuser.github.io/pymdown-extensions/) - Markdown extensions
- [Mermaid](https://mermaid-js.github.io/) - Diagrams

## License

GNU AFFERO GENERAL PUBLIC LICENSE - See the main CoRE Stack repository for details.
