#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-ops-dev}"
DEPLOYMENT="${DEPLOYMENT:-localops-worker}"
STATUS_HOST="${STATUS_HOST:-status.local}"
STATUS_URL="${STATUS_URL:-https://192.168.57.10:30443}"

restore() {
  echo
  echo "== Restoring ${DEPLOYMENT} to 2 replicas =="
  kubectl scale deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" --replicas=2 >/dev/null
  kubectl rollout status deployment/"${DEPLOYMENT}" -n "${NAMESPACE}"
}

trap restore EXIT

echo "== Simulating incident =="
kubectl scale deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" --replicas=0 >/dev/null

echo
echo "== Waiting for Kubernetes status API to detect incident =="
sleep 8

STATUS_JSON="$(curl -k -sS -H "Host: ${STATUS_HOST}" "${STATUS_URL}/api/kubernetes/status")"

echo "${STATUS_JSON}" | grep -E '"overall_status"|"active_incidents"'

echo
echo "== Checking expected outage state =="

if echo "${STATUS_JSON}" | grep -q '"overall_status":"operational"'; then
  echo "ERROR: status is still operational"
  exit 1
fi

if echo "${STATUS_JSON}" | grep -q '"active_incidents":\[\]'; then
  echo "ERROR: no active incidents found"
  exit 1
fi

echo "Incident detected successfully"
