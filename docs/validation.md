# LocalOps Status Platform — Validation Checklist

This document contains the final validation checklist for the LocalOps Status Platform lab.

## 1. Git state

```bash
git status
git log --oneline -10
```

Expected:

```text
nothing to commit, working tree clean
```

## 2. Kubernetes cluster

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

Expected:

```text
all nodes are Ready
system pods are Running
```

## 3. Argo CD

```bash
kubectl get applications -n argocd
```

Expected:

```text
localops-platform   Synced   Healthy
```

## 4. Application namespace

```bash
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev -o wide
kubectl get svc -n ops-dev
kubectl get ingress -n ops-dev
kubectl get certificate -n ops-dev
```

Expected:

```text
localops-api        Available
localops-frontend   Available
localops-worker     Available
status-local-tls    Ready=True
status.local        Ingress exists
```

## 5. Local registry

```bash
docker ps --filter name=localops-registry
curl http://127.0.0.1:5000/v2/_catalog
curl http://127.0.0.1:5000/v2/localops-api/tags/list
curl http://127.0.0.1:5000/v2/localops-worker/tags/list
curl http://127.0.0.1:5000/v2/localops-frontend/tags/list
```

Expected repositories:

```text
localops-api
localops-worker
localops-frontend
```

Expected tag:

```text
dev
```

## 6. Application endpoints

From browser:

```text
https://status.local:30443
https://status.local:30443/admin
```

Expected:

```text
public status dashboard opens
admin dashboard opens
API connected badge is visible
```

## 7. API through Ingress

```bash
curl -k https://status.local:30443/api/status
```

Expected:

```text
JSON response with overall_status, services, active_incidents, generated_at
```

## 8. Helm chart render

```bash
helm template localops-platform deploy/helm/localops-platform
```

Expected:

```text
Helm renders without errors
```

## 9. GitOps proof

Current worker replicas are managed from:

```text
deploy/helm/localops-platform/values.yaml
```

Check current value:

```bash
grep -A5 "^worker:" deploy/helm/localops-platform/values.yaml
kubectl get deploy localops-worker -n ops-dev
```

Expected:

```text
worker.replicas: 2
localops-worker 2/2
```

## 10. CI proof

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

Expected on GitHub:

```text
CI workflow is green
```

CI validates:

```text
frontend build
Python compile for api and worker
Docker build for api, worker and frontend
```

## 11. Release workflow

```bash
make release-dev
```

Expected:

```text
all images are built
all images are pushed to 192.168.57.10:5000
registry-check passes
```

## 12. Final acceptance criteria

The lab is considered successful when:

```text
Kubernetes cluster is Ready
Argo CD Application is Synced and Healthy
frontend/api/worker pods are Running
Ingress status.local works
TLS certificate is Ready
frontend shows API connected
GitHub Actions CI is green
release workflow works
documentation exists in docs/
```

## Live Kubernetes incident validation

This scenario validates that the frontend status page receives live Kubernetes health data from the backend API and shows real incidents when a workload becomes unavailable.

### Preconditions

- Kubernetes cluster is running.
- Ingress-NGINX is available through `https://status.local:30443`.
- `localops-api`, `localops-frontend`, and `localops-worker` are deployed in the `ops-dev` namespace.
- The frontend shows `API connected`.
- Argo CD application `localops-platform` is `Synced` and `Healthy`.

### Baseline check

```bash
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev
curl -s -H "Host: status.local" https://192.168.57.10:30443/api/kubernetes/status -k | grep -E "overall_status|active_incidents"
```

Expected result:

- `overall_status` is `operational`.
- `active_incidents` is empty.
- The status page shows `All Systems Operational`.
- `Worker / Notifier` is `Operational`.

### Incident simulation

Scale the worker deployment down to zero replicas:

```bash
kubectl scale deployment/localops-worker -n ops-dev --replicas=0
```

Then check the Kubernetes status API:

```bash
curl -s -H "Host: status.local" https://192.168.57.10:30443/api/kubernetes/status -k | grep -E "overall_status|active_incidents"
```

Expected result:

- `overall_status` changes to `major_outage`.
- `active_incidents` contains one or more active incidents.
- The frontend hero section shows `Major Platform Outage`.
- The active incidents counter is greater than `0`.
- The `Worker / Notifier` service card shows `Down`.
- The incidents panel shows real Kubernetes incident details.

### Recovery

Restore the worker deployment:

```bash
kubectl scale deployment/localops-worker -n ops-dev --replicas=2
kubectl rollout status deployment/localops-worker -n ops-dev
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev
```

Expected result:

- `localops-worker` returns to `2/2`.
- The API returns `overall_status: operational`.
- The status page returns to `All Systems Operational`.
- The active incidents counter returns to `0`.
- `Worker / Notifier` returns to `Operational`.
