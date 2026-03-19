---
title: Add Celery / Auth / Task Integration
description: Add async execution, retries, and auth-layer concerns after the local and Django Computing API layers are already working.
---

# Add Celery / Auth / Task Integration

This page comes after:

- [Local Pipeline First](local-pipeline-first.md)
- [Integrate With Django Computing API](django-computing-api-integration.md)

That order matters.

---

## What This Page Is For

Use it when the computation now needs:

- async execution
- retry behavior
- queue selection
- auth or access decisions
- clearer operational boundaries

---

## A Good Task Boundary

```python linenums="1" hl_lines="1 4 6-10" title="Retry-aware task wrapper pattern"
@app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_example_task(self, state, district, block, gee_account_id):
    try:
        return generate_example(state, district, block, gee_account_id)  # (1)!
    except Exception as exc:
        logger.error(f"Celery task error: {exc}")                        # (2)!
        try:
            raise self.retry(exc=exc)                                    # (3)!
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for {state}/{district}/{block}")
            return False
```

1. Keep the analytical function separately callable.
2. Log at the operational boundary.
3. Retry where transient infrastructure failures actually matter.

---

## Auth Comes After Meaning

Auth decisions are important, but they are still later than “does the computation actually do the right thing?”

When you add auth or access checks, keep them:

- explicit
- documented
- aligned with the intended audience of the route

For public data, see [Get Public API Access](../api/authentication.md).

For developer-facing computation surfaces, keep documentation consistent with [Computing API Endpoints](../api/computing-endpoints.md).

---

## When To Stop Adding Layers

Not every computation needs every integration feature immediately.

If the computation is still evolving, it is often enough to stop at:

- local callable
- thin Django route
- basic task execution

and postpone:

- elaborate auth
- retries
- public metadata exposure
- dataset registration

until the workflow is stable.

---

## Next Paths

- [Add and Integrate Public / New Data Resources](add-new-data-resources.md)
- [Integrations](integrations/index.md)
- [Pipeline Integrations](../pipelines/pipeline-integrations.md)
- [Computing API Endpoints](../api/computing-endpoints.md)
- [Build New Pipelines](build-new-pipelines.md)
