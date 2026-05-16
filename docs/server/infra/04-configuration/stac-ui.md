# STAC Website and Catalog (`stac.core-stack.org`, `catalog.core-stack.org`)

## Overview

This guide sets up:

- Private S3 bucket
- CloudFront distribution
- HTTPS enabled (default)
- Optional custom domain
- SPA routing support (React)

Final Architecture:

User → CloudFront (CDN + HTTPS) → S3 (Private Bucket)

## Prerequisites

- Built static assets available locally (`build/`)
- AWS IAM access for S3, CloudFront, and ACM
- DNS control for custom domain mapping (optional)

---

## 1. Create S3 Bucket

1. Go to AWS Console
2. Open **S3**
3. Click **Create Bucket**

Settings:

- Bucket name: my-react-app-bucket
- Region: Choose your region
- Block Public Access: ✅ Keep enabled (IMPORTANT)
- Bucket Versioning: Optional

Click **Create Bucket**

---

## 2. Upload Build Files

Build the Radient Earth app locally:

```bash
npm run build
```

Upload contents of:

```
build/
```

Upload ALL files inside build folder (not the folder itself).

---

## 3. Create CloudFront Distribution

1. Go to AWS Console
2. Open **CloudFront**
3. Click **Create Distribution**

Origin Settings:

- Origin Domain: Select your S3 bucket
- Origin Access: Choose **Origin Access Control (Recommended)**
- Create new OAC
- Signing behavior: Sign requests

Click **Create**

---

## 4. Update S3 Bucket Policy (Important)

After creating distribution:

Go to:
S3 → Bucket → Permissions → Bucket Policy

Click **Edit**

Paste the policy provided by CloudFront automatically.

It will look like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-react-app-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

Save changes.

---

## 5. Enable Default Root Object

In CloudFront:

- Go to Distribution
- Click **General**
- Set Default Root Object:

```
index.html
```

Save changes.

---

## 6. Enable SPA Routing (React Router Fix)

Go to:

CloudFront → Distribution → Error Pages → Create Custom Error Response

Create two entries:

404 Error:
- HTTP Error Code: 404
- Customize Error Response: Yes
- Response Page Path: /index.html
- HTTP Response Code: 200

403 Error:
- Same settings as above

This prevents refresh 404 errors.

---

## 7. Access Your Website

After deployment completes (5–10 minutes):

You will get URL like:

```
https://dxxxxxxxx.cloudfront.net
```

---

## 8. Add Custom Domain (Optional)

### Step 1: Request SSL Certificate

Go to:
AWS Certificate Manager (ACM)

- Region: US East (N. Virginia)
- Request Public Certificate
- Add domain: example.com
- Validate via DNS

---

### Step 2: Attach Certificate to CloudFront

Go to:
CloudFront → Distribution → Edit

- Alternate Domain Name (CNAME): stac.core-stac.org
- Custom SSL Certificate: Select ACM certificate

Save changes.

---

### Step 3: Update DNS

In Route53 (or your DNS provider):

Create A record:

- Type: A
- Alias: Yes
- Target: CloudFront distribution

Wait for DNS propagation.

Now access:

```
https://example.com
```

---

## 9. Cache Invalidation (After New Deployment)

If you upload new files:

Go to:
CloudFront → Distribution → Invalidations

Create invalidation:

```
/*
```

---

## 10. Recommended Security Settings

- Keep S3 bucket private
- Use OAC (Origin Access Control)
- Enable HTTPS only
- Enable compression (Brotli/Gzip)
- Enable HTTP/2 and HTTP/3

---

## Verify

- Open CloudFront URL and test deep-link routes.
- Confirm SPA refresh works on nested routes.
- If custom domain is configured, verify valid SSL and DNS resolution.

## Troubleshooting

- `403` from CloudFront: check S3 bucket policy and OAC linkage.
- Route refresh returns `404`: verify custom error response to `/index.html`.
- Old UI after deploy: create CloudFront invalidation `/*`.
- SSL pending for custom domain: confirm ACM certificate is in `us-east-1`.

---

## Related: OS Memory Tuning

STAC UI itself is static, but STAC backend/API memory tuning guidance is available at:

- `os-memory-tuning.md`


