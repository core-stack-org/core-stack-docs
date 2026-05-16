# Deploy React App on AWS Amplify (Hosting)

## Overview

This guide explains how to deploy a React application to AWS Amplify Hosting using:

- GitHub repository
- CI/CD automatic deployments
- HTTPS enabled by default
- Custom domain (optional)

Final URL format:
https://branch-name.amplifyapp.com

## CoreStack App Examples (LE / KYL / Dashboard / CC)

Use separate Amplify apps per frontend. Do not reuse App IDs/domains across products unless intentionally consolidated.

Example inventory template:

| Product | GitHub Repo | Amplify App ID | Branch | Domain | Notes |
|---|---|---|---|---|---|
| LE | `core-stack-org/landscape-explorer` | `d2s4eeyazvtd2g` | `main` | `explorer.core-stack.org` | Known value |
| KYL | `<repo>` | `<app-id>` | `<branch>` | `<domain>` | Fill from owner/Amplify console |
| Dashboard | `<repo>` | `<app-id>` | `<branch>` | `dashboard.core-stack.org` | Verify current mapping |
| CC | `<repo>` | `<app-id>` | `<branch>` | `<domain>` | Fill from owner/Amplify console |

Before production cutover, verify each row from:
- Amplify console app settings
- connected GitHub repo/branch
- Route53 (or DNS provider) record
- cert/domain status

---

## Prerequisites

- AWS Account
- GitHub repository with your React app
- Node.js installed locally

---



## 1. Deploy Using AWS Amplify Console

1. Login to AWS Console
2. Search for **Amplify**
3. Click **New App**
4. Select **Host Web App**
5. Choose **GitHub**
6. Authorize AWS Amplify to access GitHub
7. Select:
   - Repository
   - Branch (main)

Click **Next**

---

## 2. Build Settings

Amplify usually auto-detects React and generates this build config:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

For Vite:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Click **Next → Save and Deploy**

---

## 3. Wait for Deployment

Amplify will:

- Install dependencies
- Build your app
- Deploy to CDN
- Enable HTTPS automatically

Deployment takes 2–5 minutes.

---

## 4. Access Your App

After deployment, you will get:

```
https://main.xxxxxx.amplifyapp.com
```

Every new push to GitHub triggers automatic redeployment.

---

## 5. Configure Custom Domain (Optional)

1. Open Amplify App
2. Go to **Domain Management**
3. Click **Add Domain**
4. Enter your domain (explorer.core-stack.org)
5. Follow DNS configuration steps

Amplify provides SSL automatically via AWS Certificate Manager.

---

## 6. Environment Variables (If Needed)

If your React app needs API URLs or runtime configuration:

1. Go to Amplify → App Settings → Environment Variables
2. Add variables:

```
REACT_APP_API_URL=https://api.example.com
```

Redeploy app.

Suggested per-app variable examples:

```bash
# LE
REACT_APP_PRODUCT=LE
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

# KYL
REACT_APP_PRODUCT=KYL
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

# Dashboard
REACT_APP_PRODUCT=DASHBOARD
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1

# CC
REACT_APP_PRODUCT=CC
REACT_APP_API_URL=https://geoserver.core-stack.org/api/v1
```

---

## 7. Enable SPA Redirect (Important for React Router)

Go to:

Amplify → Rewrites and Redirects

Add rule:

```
Source: </^[^.]+$/>
Target: /index.html
Type: 200 (Rewrite)
```

OR use:

```
Source address: /<*>
Target address: /index.html
Type: 200
```

This prevents 404 errors on refresh.

---

## 8. Manual Deployment (Without GitHub)

If you don’t want CI/CD:

```bash
npm run build
```

Then:

1. Amplify → Deploy without Git provider
2. Drag and drop `build/` folder

---

## 9. Troubleshooting

### Build Fails

Check logs in:

Amplify → Build Logs

Common issues:
- Wrong Node version
- Missing environment variables

You can specify Node version:

```yaml
runtime:
  nodejs: 18
```

---

## 10. Final Architecture

User → CloudFront CDN → Amplify Hosting → React Static Build

---

## 11. Cost

Amplify Hosting Free Tier includes:
- 1000 build minutes
- 5GB storage
- 15GB data transfer

After that, pay-as-you-go pricing applies.

---

## 12. Recommended for Production

- Enable custom domain
- Configure caching headers
- Use environment variables for API URLs
- Enable monitoring in CloudWatch
- Enable branch protection on GitHub

---

## Related: OS Memory Tuning

Amplify-hosted React apps do not need host-level memory tuning, but backend services they call often do. See:

- `os-memory-tuning.md`
