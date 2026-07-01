import os
from datetime import datetime, timezone
from typing import Any

from kubernetes import client, config
from kubernetes.client import ApiException


NAMESPACE = os.getenv("KUBERNETES_NAMESPACE", "ops-dev")


def _load_kubernetes_config() -> None:
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()


def _pod_ready(pod: client.V1Pod) -> bool:
    conditions = pod.status.conditions or []
    return any(condition.type == "Ready" and condition.status == "True" for condition in conditions)


def _pod_reason(pod: client.V1Pod) -> str:
    waiting_reasons: list[str] = []

    for container_status in pod.status.container_statuses or []:
        state = container_status.state
        if state and state.waiting and state.waiting.reason:
            waiting_reasons.append(state.waiting.reason)

    if waiting_reasons:
        return ", ".join(waiting_reasons)

    if pod.status.reason:
        return pod.status.reason

    return pod.status.phase or "Unknown"


def _service_status(ready: int, desired: int) -> str:
    if desired == 0:
        return "down"
    if ready == desired:
        return "operational"
    if ready > 0:
        return "degraded"
    return "down"


def get_kubernetes_status() -> dict[str, Any]:
    _load_kubernetes_config()

    apps_api = client.AppsV1Api()
    core_api = client.CoreV1Api()

    deployments = apps_api.list_namespaced_deployment(namespace=NAMESPACE)
    pods = core_api.list_namespaced_pod(namespace=NAMESPACE)

    deployment_items: list[dict[str, Any]] = []
    incidents: list[dict[str, Any]] = []

    watched_apps = {
        "localops-api": "Public API",
        "localops-frontend": "Frontend UI",
        "localops-worker": "Worker / Notifier",
    }

    for deployment in deployments.items:
        name = deployment.metadata.name

        if name not in watched_apps:
            continue

        desired = deployment.spec.replicas or 0
        ready = deployment.status.ready_replicas or 0
        available = deployment.status.available_replicas or 0
        status = _service_status(ready=ready, desired=desired)

        deployment_items.append(
            {
                "name": watched_apps[name],
                "kubernetes_name": name,
                "status": status,
                "desired_replicas": desired,
                "ready_replicas": ready,
                "available_replicas": available,
                "ready": f"{ready}/{desired}",
            }
        )

        if status != "operational":
            incidents.append(
                {
                    "id": len(incidents) + 1,
                    "title": f"{watched_apps[name]} is {status}",
                    "status": "active",
                    "severity": "critical" if status == "down" else "warning",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "details": f"Deployment {name} has {ready}/{desired} ready replicas",
                }
            )

    pod_items: list[dict[str, Any]] = []

    for pod in pods.items:
        owner_name = None

        if pod.metadata.owner_references:
            owner_name = pod.metadata.owner_references[0].name

        ready = _pod_ready(pod)
        phase = pod.status.phase or "Unknown"
        reason = _pod_reason(pod)

        pod_items.append(
            {
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "node": pod.spec.node_name,
                "phase": phase,
                "ready": ready,
                "reason": reason,
                "owner": owner_name,
                "pod_ip": pod.status.pod_ip,
            }
        )

        if not ready:
            incidents.append(
                {
                    "id": len(incidents) + 1,
                    "title": f"Pod {pod.metadata.name} is not ready",
                    "status": "active",
                    "severity": "warning",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "details": f"Pod phase={phase}, reason={reason}, node={pod.spec.node_name}",
                }
            )

    overall_status = "operational"

    if any(item["status"] == "down" for item in deployment_items):
        overall_status = "major_outage"
    elif incidents:
        overall_status = "degraded"

    return {
        "platform": "LocalOps Status Platform",
        "namespace": NAMESPACE,
        "overall_status": overall_status,
        "deployments": deployment_items,
        "pods": pod_items,
        "active_incidents": incidents,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_kubernetes_status_safe() -> dict[str, Any]:
    try:
        return get_kubernetes_status()
    except ApiException as exc:
        return {
            "platform": "LocalOps Status Platform",
            "namespace": NAMESPACE,
            "overall_status": "unknown",
            "deployments": [],
            "pods": [],
            "active_incidents": [
                {
                    "id": 1,
                    "title": "Kubernetes API request failed",
                    "status": "active",
                    "severity": "critical",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "details": f"{exc.status}: {exc.reason}",
                }
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        return {
            "platform": "LocalOps Status Platform",
            "namespace": NAMESPACE,
            "overall_status": "unknown",
            "deployments": [],
            "pods": [],
            "active_incidents": [
                {
                    "id": 1,
                    "title": "Kubernetes status check failed",
                    "status": "active",
                    "severity": "critical",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "details": str(exc),
                }
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
