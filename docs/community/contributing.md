# Contributing to CoRE Stack

Thank you for your interest in contributing to CoRE Stack! This document provides guidelines and instructions for contributing to the project.

---

## Ways to Contribute

### Code Contributions

- **Bug fixes** - Fix issues reported in GitHub
- **Features** - Add new functionality
- **Pipelines** - Create new geospatial analysis pipelines
- **Documentation** - Improve docs and tutorials

### Non-Code Contributions

- **Bug reports** - Report issues you encounter
- **Feature requests** - Suggest new capabilities
- **Documentation** - Fix typos, clarify instructions
- **Translations** - Translate documentation
- **Community support** - Help others on Discord/GitHub

See also:

- [Contribution Showcase](contributions.md) - major ecosystem contributions, applications, datasets, and integration-oriented community work

---

## Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/core-stack-backend.git
cd core-stack-backend
```

### 2. Set Up Development Environment

Follow the [backend Installation Guide](https://github.com/core-stack-org/core-stack-backend/blob/main/installation/INSTALLATION.md).

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring

---

## Development Workflow

### 1. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 2. Test Locally

```bash
# Run tests
python manage.py test

# Check code style
flake8 .
black --check .

# Type checking (if applicable)
mypy .
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add surface water body detection for coastal areas"
```

Commit message format (Conventional Commits):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Pull Request Guidelines

### PR Title Format

```
[type]: Brief description

Examples:
feat: Add local computation mode for drought analysis
fix: Resolve PostgreSQL connection timeout issue
docs: Update installation guide for WSL2
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Breaking change

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new features
- [ ] Manually tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Documentation review** for user-facing changes
4. **Approval** and merge by maintainer

---

## Code Standards

### Python Style

Follow PEP 8 with these specifics:

```python
# Use type hints
def calculate_area(geometry: Polygon, crs: str = "EPSG:4326") -> float:
    """Calculate area of polygon in square meters.
    
    Args:
        geometry: Input polygon
        crs: Coordinate reference system
        
    Returns:
        Area in square meters
    """
    pass

# Maximum line length: 100 characters
# Use double quotes for strings
# Use f-strings for formatting
```

### Django Patterns

```python
# Use Django ORM efficiently
# Good
states = State.objects.filter(is_active=True).prefetch_related('districts')

# Avoid N+1 queries
# Bad
for state in State.objects.all():
    print(state.districts.count())  # N+1 queries!
```

### Documentation

```python
def complex_function(param1: str, param2: int) -> dict:
    """Short description of function.
    
    Longer description explaining behavior, edge cases,
    and any important implementation details.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: When param1 is invalid
        
    Example:
        >>> result = complex_function("test", 42)
        >>> print(result['status'])
        'success'
    """
    pass
```

---

## Adding New Pipelines

### 1. Create Pipeline Module

```bash
mkdir computing/my_pipeline
touch computing/my_pipeline/__init__.py
touch computing/my_pipeline/my_pipeline.py
```

### 2. Implement Pipeline

```python
# computing/my_pipeline/my_pipeline.py
from typing import Dict
import geopandas as gpd

def run_my_analysis(
    state: str,
    district: str,
    block: str
) -> Dict:
    """Run my custom analysis.
    
    Args:
        state: State name
        district: District name
        block: Block/Tehsil name
        
    Returns:
        Dictionary with results
    """
    # Implementation
    pass
```

### 3. Add API Endpoint

```python
# computing/api.py
from computing.my_pipeline.my_pipeline import run_my_analysis

@api_view(["POST"])
def my_pipeline(request):
    """API endpoint for my pipeline."""
    state = request.data.get("state")
    district = request.data.get("district")
    block = request.data.get("block")
    
    result = run_my_analysis(state, district, block)
    return Response(result)
```

### 4. Add URL Route

```python
# computing/urls.py
path('my-pipeline/', views.my_pipeline, name='my-pipeline'),
```

### 5. Add Documentation

- Add docstrings
- Update [Computation Registry](../pipelines/computation-registry.md)
- Create tutorial if user-facing

---

## Documentation Contributions

### Documentation Types

| Type | Location | Audience |
|------|----------|----------|
| Tutorials | `docs/use-precomputed-data/`, `docs/community/` | Data users and contributors |
| How-To Guides | `docs/api/`, `docs/pipelines/`, `docs/developers/` | Specific tasks |
| Reference | `docs/reference/` | Lookup information |
| Explanation | `docs/pipelines/`, `docs/developers/` | Understanding |

### Documentation Standards

- Use [Diátaxis framework](https://diataxis.fr/)
- Include code examples
- Cross-reference related docs
- Test all code snippets

---

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Assume good intentions
- Focus on constructive feedback

### Communication Channels

- **Discord** - Real-time chat and support
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Long-form discussions
- **Email** - contact@core-stack.org

### Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- `1.2.3` = Major 1, Minor 2, Patch 3

### Release Cycle

- **Patch releases** - Bug fixes, monthly
- **Minor releases** - Features, quarterly
- **Major releases** - Breaking changes, annually

---

## Questions?

- :fontawesome-brands-discord: [Discord](https://discord.gg/PSkZX4hvWx)
- :fontawesome-brands-github: [GitHub Discussions](https://github.com/core-stack-org/core-stack-backend/discussions)
- :material-email: [Email](mailto:contact@core-stack.org)

---

## License

By contributing, you agree that your contributions will be licensed under the [GNU Affero General Public License v3.0](https://github.com/core-stack-org/core-stack-backend/blob/main/LICENSE).

---

Thank you for contributing to CoRE Stack! Together, we're democratizing geospatial intelligence and its usage.
