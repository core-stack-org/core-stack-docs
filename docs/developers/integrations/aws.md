# AWS S3 Integration

Store and retrieve geospatial data using AWS S3.

---

## Overview

CoRE Stack can export computation results to S3 for long-term storage and sharing.

---

## Configuration

```python
# nrm_app/settings.py
AWS_ACCESS_KEY_ID = "your-access-key"
AWS_SECRET_ACCESS_KEY = "your-secret-key"
AWS_STORAGE_BUCKET_NAME = "corestack-data"
AWS_S3_REGION_NAME = "ap-south-1"
```

---

## Usage

Results are automatically uploaded to S3 when configured:

```json
{
  "output_url": "https://corestack-data.s3.ap-south-1.amazonaws.com/outputs/swb/result.geojson"
}
```

---

## See Also

- [Google Earth Engine](google-earth-engine.md)
- [GeoServer](geoserver.md)
