---
title: Integrate With Django Computing API
description: Expose a locally working computation through the CoRE Stack Django Computing API with thin handlers and clear route wiring.
---

# Integrate With Django Computing API

Use this page after your computation already works locally.

The goal here is modest:

- add a route
- keep the handler thin
- pass work into a callable computation boundary

---

## The Files That Matter

- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)
- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)
- the pipeline module under `computing/`

---

## The Recommended Shape

```python linenums="1" hl_lines="1 5-8 9-10" title="Thin Computing API handler"
@api_view(["POST"])
@schema(None)
def generate_example(request):
    state = request.data.get("state").lower()          # (1)!
    district = request.data.get("district").lower()
    block = request.data.get("block").lower()
    gee_account_id = request.data.get("gee_account_id")
    run_example_task.apply_async(                      # (2)!
        args=[state, district, block, gee_account_id],
        queue="nrm",
    )
    return Response({"Success": "Successfully initiated"})  # (3)!
```

1. Normalize and validate only what the entry layer truly owns.
2. Push real work into a task or callable boundary.
3. Return a small response quickly.

This is why [Local Pipeline First](local-pipeline-first.md) exists: the handler should not be where the science becomes debuggable for the first time.

---

## Route Wiring Checklist

1. add the route in `computing/urls.py`
2. add the handler in `computing/api.py`
3. call a stable computation boundary
4. keep request parsing shallow
5. make the next page decide whether Celery, auth, or retries need to become stricter

---

## What Not To Do Here

- do not bury analytical logic inside the request handler
- do not make this the first place the computation is ever run
- do not mix publication, validation, and route parsing into one large function

---

## Bridge To The Registry

Once a computation has a route, it becomes part of the broader Computing API surface.

That means it should appear clearly in:

- [Computing API Endpoints](../api/computing-endpoints.md)
- [Computation Registry](../pipelines/computation-registry.md)

---

## Next Paths

- [Add Celery / Auth / Task Integration](celery-auth-and-task-integration.md)
- [Computing API Endpoints](../api/computing-endpoints.md)
- [Computation Registry](../pipelines/computation-registry.md)
- [Backend Code Map](backend-code-map.md)
- [Build New Pipelines](build-new-pipelines.md)
