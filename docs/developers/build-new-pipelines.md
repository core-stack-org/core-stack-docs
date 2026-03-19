# Build New Pipelines

This page is the short route into CoRE Stack pipeline development.

For the detailed pattern library, read [Common Pipeline Design / Integration Patterns](../pipelines/common-design-and-integration-patterns.md).

---

## What New Contributors Should Understand First

Before writing a new pipeline, trace one existing vector-heavy page and one raster-heavy page:

- [Facilities Proximity](../pipelines/facilities-proximity.md)
- [Catchment Area](../pipelines/catchment-area.md)

That will show you the actual integration surfaces the stack already uses.

---

## The Minimum Developer Checklist

- define the ROI and required inputs
- decide whether the first useful output is vector, raster, or mixed
- implement the processing function first
- expose it through shell, Celery, API, or some combination
- reuse shared helpers for GEE paths, publication, and metadata
- document the new pipeline under `docs/pipelines/`

---

## Shared Code Surfaces

Start here when wiring a new pipeline:

- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)
- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)
- [computing/utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/utils.py)
- [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py)

---

## Reusable Entry-Point Templates

Two existing backend patterns are worth copying instead of re-inventing.

### 1. Minimal DRF Trigger for Async Work

The LCW route in [generate_lcw()](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L1253-L1269) is the smallest useful HTTP entry point for a background computation.

```python linenums="1" hl_lines="5-8 9-11" title="computing/api.py"
@api_view(["POST"])
@schema(None)
def generate_lcw(request):
    try:
        state = request.data.get("state").lower()  # (1)!
        district = request.data.get("district").lower()
        block = request.data.get("block").lower()
        gee_account_id = request.data.get("gee_account_id")
        generate_lcw_conflict_data.apply_async(  # (2)!
            args=[state, district, block, gee_account_id], queue="nrm"
        )
        return Response({"Success": "Successfully initiated"})  # (3)!
    except Exception as exc:
        return Response({"Exception": exc})
```

1. Normalize request fields immediately if downstream asset naming, path generation, or filters expect lowercase text.
2. Keep the HTTP handler thin. The route should enqueue work, and not contain any other logic.
3. Return fast so frontend and Postman users get a quick acknowledgement instead of waiting for the full pipeline.

Use this pattern when the task itself already contains the real processing lifecycle and you do not need special retry logic at the API layer.

### 2. Celery Retry Wrapper Around a Direct Function

Facilities proximity uses a stronger wrapper in [generate_facilities_proximity_task()](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/misc/facilities_proximity.py#L153-L163).

```python linenums="1" hl_lines="1 4 6-10" title="computing/misc/facilities_proximity.py"
@app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_facilities_proximity_task(self, state, district, block, gee_account_id):
    """Celery task wrapper for generate_facilities_proximity"""
    try:
        return generate_facilities_proximity(state, district, block, gee_account_id)  # (1)!
    except Exception as exc:
        logger.error(f"Celery task error: {exc}")  # (2)!
        try:
            raise self.retry(exc=exc)  # (3)!
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for {state}/{district}/{block}")
            return False
```

1. Keep the science or data-processing function separately callable from shell and tests.
2. Log failures at the retry boundary so operators can inspect queue behavior.
3. Use a wrapper like this when the underlying work touches GEE, GeoServer, network storage, or any dependency that may fail transiently.

This pattern matters because it gives CoRE Stack multiple access layers to the same logic:

- direct function call from `python -c`
- `manage.py shell` experimentation
- async queue execution in production
- API-triggered workflows for frontend and Postman users

---

## Recommended Build Sequence

1. Prototype the data logic for implementation.
2. Make it callable from Django shell.
3. Add task or API integration.
4. Add publication and metadata persistence.
5. Add docs, including a pipeline page and builder notes.

---

## See Also

- [Common Pipeline Design / Integration Patterns](../pipelines/common-design-and-integration-patterns.md)
- [Pipeline Overview](../pipelines/index.md)
- [Local Pipeline First](local-pipeline-first.md)
- [Integrate With Django Computing API](django-computing-api-integration.md)
- [System Architecture](system-architecture.md)
