#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-ops-dev}"
REGISTRY_NAME="${REGISTRY_NAME:-localops-registry}"

ok() {
  echo "OK: $1"
}

fail() {
  echo "FAIL: $1"
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 && ok "$1 found" || fail "$1 not found"
}

echo "== LocalOps doctor =="

need_cmd kubectl
need_cmd docker
need_cmd curl
need_cmd git

echo
echo "== Kubernetes access =="
kubectl cluster-info >/dev/null 2>&1 && ok "cluster reachable" || fail "cluster not reachable"

kubectl get ns "$NAMESPACE" >/dev/null 2>&1 && ok "namespace $NAMESPACE exists" || fail "namespace $NAMESPACE missing"

kubectl get ns argocd >/dev/null 2>&1 && ok "namespace argocd exists" || fail "namespace argocd missing"

echo
echo "== LocalOps workloads =="
kubectl get deploy localops-api -n "$NAMESPACE" >/dev/null 2>&1 && ok "localops-api deployment exists" || fail "localops-api missing"
kubectl get deploy localops-frontend -n "$NAMESPACE" >/dev/null 2>&1 && ok "localops-frontend deployment exists" || fail "localops-frontend missing"
kubectl get deploy localops-worker -n "$NAMESPACE" >/dev/null 2>&1 && ok "localops-worker deployment exists" || fail "localops-worker missing"

echo
echo "== Argo CD =="
kubectl get application localops-platform -n argocd >/dev/null 2>&1 && ok "Argo CD application exists" || fail "Argo CD application missing"

echo
echo "== Local registry =="
docker ps --filter "name=$REGISTRY_NAME" --format '{{.Names}}' | grep -q "$REGISTRY_NAME" \
  && ok "local registry container is running" \
  || fail "local registry container is not running"

echo
echo "Doctor passed"
