# Google Earth Engine

Google Earth Engine is not an optional edge integration in the current CoRE Stack backend. Most computing pipelines, many local API-triggered runs, and several publication flows depend on a valid backend-side GEE account.

If you see `gee_account_id` in pipeline docs, API examples, or direct Python calls, it refers to a Django `GEEAccount` record created from a Google Cloud service account that has Earth Engine access.

!!! warning
    For the current backend, you should assume GEE setup is required before trying to run most computing pipelines end-to-end. Without it, many local and queued compute paths will fail during `ee_initialize(...)`.

---

## What You Need Before Running Pipelines

Set up these pieces in order:

1. a Google Cloud project with Earth Engine enabled
2. a service account with the required permissions
3. a downloaded JSON key for that service account
4. a Django admin `GEEAccount` entry
5. the resulting `gee_account_id` for API calls, Celery tasks, and shell usage

---

## Step 1: Configure Google Cloud for Earth Engine

1. Go to the Google Cloud Earth Engine configuration page:
   [`https://console.cloud.google.com/earth-engine/configuration`](https://console.cloud.google.com/earth-engine/configuration)
2. Create a new Google Cloud project, or select an existing one.

   ![Create a Google Cloud project for Earth Engine](../../assets/create-project.png)

3. Register that project for Earth Engine use.

   ![Register the project with Earth Engine](../../assets/register-project.png)

4. Review IAM permissions and make sure the account you are using can manage the project and service accounts.

   ![Set Google Cloud permissions for Earth Engine setup](../../assets/set-permissions.png)

5. Create a service account in that project.

   ![Create a service account for Earth Engine](../../assets/service-account.png)

6. Create a JSON key for that service account and download it.

   ![Download a service account JSON key](../../assets/service-keys.png)

The downloaded file will look something like `<project-name>-12345-356644b54.json`.

!!! Warning
    Save the JSON key securely. It grants access to your Google Cloud resources. Do not commit it to git, do not place it under `docs/`, and do not share it in issues or chat logs.

---

## Step 2: Add the Service Account to Django

### Option A: Through Django Admin

For the current backend, this is the operator-facing path that lines up with how `utilities/gee_utils.py` loads credentials from the database.

1. Open the Django admin add form for GEE accounts:
   `http://127.0.0.1:8000/admin/gee_computing/geeaccount/add/`
2. Fill in:
   - **Name:** a recognizable label such as `production` or `geo_org_gee`
   - **Service Account Email:** the email from the JSON key, such as `name@project-id.iam.gserviceaccount.com`
   - **Helper Account:** leave blank unless you already know you need to chain to another stored account
   - **Is Visible:** usually enabled
   - **Credentials File:** upload the downloaded service account JSON key

   ![Create a GEE account record in Django admin](../../assets/add-gee.png)

3. Save the record.
4. After creation, copy the numeric account ID from the URL.
   - Example URL: `http://127.0.0.1:8000/admin/gee_computing/geeaccount/21/change/`
   - In this case, the `gee_account_id` is `21`

Use that `gee_account_id` in compute API requests, direct function calls, and Celery task submissions.

### Option B: Scripted or Shell-Based Setup

If you prefer to create the encrypted `GEEAccount` record from the backend repo instead of using the admin UI, use the lower-level guide here:

- [First Manual API Run](../first-manual-api-run.md)

That page covers `test_gee_auth.py`, manual Django-shell creation, `.env` defaults, and troubleshooting.

---

## Step 3: Use `gee_account_id` When Running Pipelines

Once the Django record exists, the ID becomes part of normal compute execution.

Example API body:

```json
{
  "state": "karnataka",
  "district": "raichur",
  "block": "devadurga",
  "gee_account_id": 21
}
```

Example direct Python usage:

```python
generate_facilities_proximity("Odisha", "Koraput", "Jaypur", gee_account_id=21)
```

You will see this parameter throughout the docs because it is how many handlers pass the GEE credential context into Celery-backed pipeline code.

!!! note
    Some backend paths may fall back to `GEE_DEFAULT_ACCOUNT_ID`, but you should still create and verify a real `GEEAccount` first. Treat the admin-created account as part of baseline environment setup for computing work.

---

## Where GEE Is Wired in the Backend

The main helper module is:

- [utilities/gee_utils.py](https://github.com/core-stack-org/core-stack-backend/blob/main/utilities/gee_utils.py#L30-L219)

Key responsibilities there:

- initialize Earth Engine from stored credentials
- initialize Google Cloud Storage access
- validate and build asset paths
- poll task status
- create asset folders

Many compute handlers accept a `gee_account_id` parameter and pass it into Celery-backed pipeline tasks.

Examples:

- hydrology handlers in [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L218-L279)
- LULC handlers in [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L280-L455)
- SWB handler in [computing/api.py](https://github.com/core-stack-org/core-stack-backend/blob/main/computing/api.py#L485-L512)

The public API also uses Earth Engine for spatial lookups:

- admin lookup by coordinates in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L117-L177)
- report and MWS lookup helpers in [public_api/views.py](https://github.com/core-stack-org/core-stack-backend/blob/main/public_api/views.py#L378-L409)

---

## Related Docs

- [Local Pipeline First](../local-pipeline-first.md)
- [Common Pipeline Design / Integration Patterns](../../pipelines/common-design-and-integration-patterns.md)
- [Computing API Endpoints](../../api/computing-endpoints.md)
- [System Architecture](../system-architecture.md)
- [Backend Code Map](../backend-code-map.md)

---

## See Also

- [AWS](aws.md)
- [GeoServer](geoserver.md)
- [Add and Integrate Public / New Data Resources](../add-new-data-resources.md)
