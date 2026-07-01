#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-ops-dev}"
STATUS_HOST="${STATUS_HOST:-status.local}"
STATUS_URL="${STATUS_URL:-https://192.168.57.10:30443}"

echo "== LocalOps smoke test =="

echo
echo "== Nodes =="
kubectl get nodes -o wide

echo
echo "== Deployments =="
kubectl get deploy -n "$NAMESPACE"

echo
echo "== Pods =="
kubectl get pods -n "$NAMESPACE" -o wide

echo
echo "== Argo CD =="
kubectl get applications -n argocd

echo
echo "== Frontend check =="
curl -k -sS -H "Host: $STATUS_HOST" "$STATUS_URL" >/dev/null
echo "Frontend OK"

echo
echo "== Kubernetes status API =="
STATUS_JSON="$(curl -k -sS -H "Host: $STATUS_HOST" "$STATUS_URL/api/kubernetes/status")"
echo "$STATUS_JSON" | grep -E '"overall_status"|"active_incidents"'

echo "$STATUS_JSON" | grep -q '"overall_status":"operational"'
echo "$STATUS_JSON" | grep -q '"active_incidents":\[\]'

echo
echo "Smoke test passed"
