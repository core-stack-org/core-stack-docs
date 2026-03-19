---
title: First Manual API Run
description: Trace one real computation request from curl to route, handler, task boundary, and downstream workflow.
---

# First Manual API Run

This page helps you connect one request to one real code path.

It is the bridge between “the stack is installed” and “I understand how work actually moves through it.”

---

## Example: Surface Water Body Generation

Route sources:

- [computing/urls.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/urls.py)
- [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py)

### Send the request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"state":"karnataka","district":"raichur","block":"devadurga","start_year":2022,"end_year":2023}' \
  http://127.0.0.1:8000/api/v1/generate_swb/
```

### What to look for

1. the route exists in `computing/urls.py`
2. the handler in `computing/api.py` receives the payload
3. the handler queues or triggers the actual computation boundary
4. a worker or callable function continues the real work
5. logs, outputs, and later metadata tell you whether the run succeeded

---

## Why This Page Matters

A developer usually becomes much faster after they can answer these four questions confidently:

- which file owns the route?
- which file owns the handler?
- which function or task owns the heavy work?
- where do the results show up next?

That is the whole purpose of this page.

---

## After One Manual Run

Once you have traced one request end to end, the next useful moves are usually:

- inspect the code map
- compare with the computing endpoint registry
- move into local-first experimentation for your own workflow

---

## Next Paths

- [Backend Code Map](backend-code-map.md)
- [Computing API Endpoints](../api/computing-endpoints.md)
- [Local Pipeline First](local-pipeline-first.md)
- [Setup Troubleshooting](setup-troubleshooting.md)
- [System Architecture](system-architecture.md)
