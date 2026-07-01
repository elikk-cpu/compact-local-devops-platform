# LocalOps Status Platform — Architecture

## Purpose

LocalOps Status Platform is a compact local DevOps platform used to practice and demonstrate a full application delivery workflow:

- application development
- Docker image build
- local container registry
- Kubernetes deployment
- Helm packaging
- Argo CD GitOps delivery
- Ingress and TLS
- CI validation through GitHub Actions

The platform contains a status dashboard frontend, backend API, and background worker.

## High-level architecture

```text
User Browser
    |
    | HTTPS https://status.local:30443
    v
Ingress-NGINX
    |
    +--> localops-frontend Service
    |        |
    |        v
    |   React / Nginx frontend pods
    |
    +--> localops-api Service
             |
             v
        FastAPI backend pods

localops-worker runs separately as a background service.
```

## Main components

### Frontend

The frontend is a React application built with Vite and served by Nginx inside a container.

Responsibilities:

- display public status dashboard
- display admin dashboard
- show API connection status
- consume `/api/status` from the backend

Kubernetes object:

```text
Deployment: localops-frontend
Service:    localops-frontend
```

### API

The API is a FastAPI service.

Responsibilities:

- expose `/health`
- expose `/ready`
- expose `/api/status`
- provide service status, latency, uptime and last check data

Kubernetes object:

```text
Deployment: localops-api
Service:    localops-api
```

### Worker

The worker is a Python/FastAPI-based background service.

Responsibilities:

- simulate background jobs
- expose `/health`
- expose `/ready`
- expose `/metrics`

Kubernetes object:

```text
Deployment: localops-worker
```

## Container registry

The local Docker registry runs on the control-plane node:

```text
192.168.57.10:5000
```

Images:

```text
192.168.57.10:5000/localops-frontend:dev
192.168.57.10:5000/localops-api:dev
192.168.57.10:5000/localops-worker:dev
```

The Kubernetes nodes use containerd and are configured to pull images from this local insecure HTTP registry.

## Kubernetes namespace

The application is deployed into:

```text
ops-dev
```

## Helm chart

The application is packaged as a Helm chart:

```text
deploy/helm/localops-platform
```

The chart manages:

- frontend Deployment
- frontend Service
- API Deployment
- API Service
- worker Deployment
- Ingress
- TLS Certificate

## Argo CD GitOps flow

Argo CD manages the real application deployment.

```text
GitHub main repository
    |
    | deploy/helm/localops-platform
    v
Argo CD Application: localops-platform
    |
    v
Kubernetes namespace: ops-dev
```

The GitOps repository stores the Argo CD Application manifest:

```text
compact-local-devops-platform-gitops
└── argo/applications/localops-platform.yaml
```

## Current external URLs

```text
https://status.local:30443
https://status.local:30443/admin
https://argocd.status.local:30443
```

## CI

GitHub Actions validates the project on push:

- frontend build
- Python compile check for API and worker
- Docker build for frontend, API and worker

Workflow file:

```text
.github/workflows/ci.yml
```

## Delivery flow

```text
Developer changes code
    |
    v
git push
    |
    v
GitHub Actions CI
    |
    v
make release-dev
    |
    v
Docker images pushed to local registry
    |
    v
Helm values / chart updated in Git
    |
    v
Argo CD syncs Kubernetes
    |
    v
Application runs in ops-dev namespace
```
