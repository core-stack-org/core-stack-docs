# AWS S3 Integration

CoRE Stack can store selected outputs in S3-backed storage, but S3 is not part of the baseline local installer validation.

Treat AWS settings as deployment-specific configuration, not as a prerequisite for every local install.

---

## When AWS Matters

AWS configuration is usually only needed when:

- your deployment writes generated artifacts to S3 instead of keeping them only on local disk
- your workflow depends on DPR-specific S3 buckets
- downstream consumers expect cloud-hosted output URLs rather than local filesystem artifacts

For many local development tasks, these values can stay blank.

---

## Configure It In `nrm_app/.env`

The current backend installation guide documents these S3-facing env variables:

```env
S3_BUCKET=your-bucket-name
S3_REGION=ap-south-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

DPR_S3_BUCKET=your-dpr-bucket
DPR_S3_FOLDER=your-folder
DPR_S3_ACCESS_KEY=your-access-key
DPR_S3_SECRET_KEY=your-secret-key
DPR_S3_REGION=ap-south-1
```

The installer generates `nrm_app/.env`, but it does not validate S3 connectivity for you.

---

## Practical Guidance

- Keep these values blank on a local-only install unless a specific workflow needs them.
- Fill both the generic S3 and `DPR_*` settings only if your project actually uses both surfaces.
- Treat them as secrets and keep them out of git.
