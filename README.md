# LocalOps Status Platform

[![CI](https://github.com/elikk-cpu/compact-local-devops-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/elikk-cpu/compact-local-devops-platform/actions/workflows/ci.yml)

LocalOps Status Platform is a compact local DevOps platform built for practicing the full application delivery lifecycle.

The project includes:

- React/Vite frontend
- FastAPI backend
- Python worker service
- Docker and Docker Compose
- local Docker registry
- Kubernetes deployment
- Helm chart
- Argo CD GitOps delivery
- Ingress-NGINX
- cert-manager TLS
- GitHub Actions CI
- operational documentation

## Current status

The application is deployed to a local Kubernetes cluster through Argo CD.

```text
Argo CD Application: localops-platform
Namespace:           ops-dev
Frontend:            localops-frontend
API:                 localops-api
Worker:              localops-worker
```

## External URLs

```text
https://status.local:30443
https://status.local:30443/admin
https://argocd.status.local:30443
```

## Architecture

```text
Browser
  |
  | HTTPS status.local:30443
  v
Ingress-NGINX
  |
  +--> localops-frontend Service
  |       |
  |       v
  |   React frontend pods
  |
  +--> localops-api Service
          |
          v
      FastAPI backend pods

localops-worker runs as a separate background deployment.
```

## Repository structure

```text
app/
  frontend/        React/Vite frontend served by Nginx
  api/             FastAPI backend
  worker/          background worker service

deploy/
  compose/         Docker Compose workflow
  helm/            Helm chart for Kubernetes

docs/
  architecture.md  platform architecture
  runbook.md       operational runbook

.github/
  workflows/       GitHub Actions CI
```

## Local development

### API

```bash
cd app/api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Worker

```bash
cd app/worker
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 9000
```

### Frontend

```bash
cd app/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Development URLs:

```text
http://192.168.57.10:5173
http://192.168.57.10:5173/admin
```

## Docker Compose

Production-like local container check:

```bash
cd deploy/compose
docker compose up --build
```

Compose URLs:

```text
http://192.168.57.10:3000
http://192.168.57.10:3000/admin
```

Stop Compose:

```bash
docker compose down
```

## Local registry

The local registry runs on the control-plane node:

```text
192.168.57.10:5000
```

Images:

```text
192.168.57.10:5000/localops-api:dev
192.168.57.10:5000/localops-worker:dev
192.168.57.10:5000/localops-frontend:dev
```

Check registry:

```bash
curl http://127.0.0.1:5000/v2/_catalog
```

## Release workflow

Build and push all dev images to the local registry:

```bash
make release-dev
```

This builds and pushes:

```text
localops-api:dev
localops-worker:dev
localops-frontend:dev
```

## Kubernetes and Helm

Helm chart:

```text
deploy/helm/localops-platform
```

Manual install or upgrade:

```bash
helm upgrade --install localops-platform deploy/helm/localops-platform \
  -n ops-dev \
  --create-namespace
```

Check Kubernetes state:

```bash
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev -o wide
kubectl get ingress -n ops-dev
kubectl get certificate -n ops-dev
```

## Argo CD GitOps

Argo CD manages the application deployment from the Helm chart in this repository.

Check application:

```bash
kubectl get applications -n argocd
kubectl describe application localops-platform -n argocd | tail -n 60
```

Expected state:

```text
localops-platform   Synced   Healthy
```

## CI

GitHub Actions validates:

- frontend build
- Python API compile check
- Python worker compile check
- Docker image build for frontend, API and worker

Workflow:

```text
.github/workflows/ci.yml
```

## Documentation

More details:

- [Architecture](docs/architecture.md)
- [Runbook](docs/runbook.md)
