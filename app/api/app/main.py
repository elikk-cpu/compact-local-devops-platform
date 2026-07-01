from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, Response
from pydantic import BaseModel
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.middleware.cors import CORSMiddleware

from app.kubernetes_status import get_kubernetes_status_safe

app = FastAPI(
    title="LocalOps Status Platform API",
    version="0.1.0",
    description="Backend API for LocalOps Status Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://192.168.57.10:5173",
    "http://localhost:5173",
    "http://192.168.57.10:3000",
    "http://localhost:3000",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUEST_COUNTER = Counter(
    "localops_api_requests_total",
    "Total API requests",
    ["endpoint"],
)

SERVICE_HEALTH = Gauge(
    "localops_service_health",
    "Service health status: 1 operational, 0 degraded",
    ["service"],
)


class ServiceStatus(BaseModel):
    name: str
    status: str
    description: str


class Incident(BaseModel):
    id: int
    title: str
    status: str
    severity: str
    created_at: str
    updated_at: str


SERVICES: List[ServiceStatus] = [
    ServiceStatus(
        name="Public API",
        status="operational",
        description="Backend API is responding normally",
    ),
    ServiceStatus(
        name="Admin UI",
        status="operational",
        description="Admin interface is available",
    ),
    ServiceStatus(
        name="PostgreSQL",
        status="operational",
        description="Database connectivity is healthy",
    ),
    ServiceStatus(
        name="Worker / Notifier",
        status="operational",
        description="Background jobs are processing normally",
    ),
    ServiceStatus(
        name="Ingress",
        status="operational",
        description="External routing is healthy",
    ),
]

INCIDENTS: List[Incident] = []


@app.on_event("startup")
def set_initial_metrics() -> None:
    for service in SERVICES:
        SERVICE_HEALTH.labels(service=service.name).set(
            1 if service.status == "operational" else 0
        )


@app.get("/health")
def health() -> dict:
    REQUEST_COUNTER.labels(endpoint="/health").inc()
    return {
        "status": "ok",
        "service": "localops-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/ready")
def ready() -> dict:
    REQUEST_COUNTER.labels(endpoint="/ready").inc()
    return {
        "status": "ready",
        "dependencies": {
            "database": "not_configured_yet",
            "worker": "not_configured_yet",
        },
    }


@app.get("/api/status")
def get_platform_status() -> dict:
    generated_at = datetime.now(timezone.utc).isoformat()

    return {
        "platform": "LocalOps Status Platform",
        "overall_status": "operational",
        "services": [
            {
                "name": "Public API",
                "status": "operational",
                "description": "Backend API is responding normally",
                "latency": "112ms",
                "uptime": "99.987%",
                "last_check": generated_at,
            },
            {
                "name": "Admin UI",
                "status": "operational",
                "description": "Admin interface is available",
                "latency": "98ms",
                "uptime": "99.991%",
                "last_check": generated_at,
            },
            {
                "name": "PostgreSQL",
                "status": "operational",
                "description": "Database connectivity is healthy",
                "latency": "1.42ms",
                "uptime": "99.997%",
                "last_check": generated_at,
            },
            {
                "name": "Worker / Notifier",
                "status": "operational",
                "description": "Background jobs are processing normally",
                "latency": "164ms",
                "uptime": "99.972%",
                "last_check": generated_at,
            },
            {
                "name": "Ingress",
                "status": "operational",
                "description": "External routing is healthy",
                "latency": "76ms",
                "uptime": "99.988%",
                "last_check": generated_at,
            },
        ],
        "active_incidents": [],
        "generated_at": generated_at,
    }

@app.get("/api/services")
def list_services() -> List[ServiceStatus]:
    REQUEST_COUNTER.labels(endpoint="/api/services").inc()
    return SERVICES


@app.get("/api/incidents")
def list_incidents() -> List[Incident]:
    REQUEST_COUNTER.labels(endpoint="/api/incidents").inc()
    return INCIDENTS


@app.get("/metrics")
def metrics() -> Response:
    REQUEST_COUNTER.labels(endpoint="/metrics").inc()
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )

@app.get("/api/kubernetes/status")
def get_real_kubernetes_status() -> dict:
    return get_kubernetes_status_safe()

import os
import urllib.parse
import urllib.request


PROMETHEUS_URL = os.getenv(
    "PROMETHEUS_URL",
    "http://monitoring-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090",
)


def query_prometheus(query: str) -> list[dict]:
    REQUEST_COUNTER.labels(endpoint="/api/monitoring/summary").inc()

    url = f"{PROMETHEUS_URL}/api/v1/query?{urllib.parse.urlencode({'query': query})}"

    with urllib.request.urlopen(url, timeout=5) as response:
        payload = response.read().decode("utf-8")

    import json
    data = json.loads(payload)

    if data.get("status") != "success":
        return []

    return data.get("data", {}).get("result", [])


def prometheus_value(result: list[dict], default: float = 0.0) -> float:
    if not result:
        return default

    try:
        return float(result[0]["value"][1])
    except (KeyError, IndexError, TypeError, ValueError):
        return default


def query_prometheus_range(query: str, minutes: int = 60, step: str = "5m") -> list[dict]:
    import json
    import time

    end = int(time.time())
    start = end - minutes * 60

    params = urllib.parse.urlencode({
        "query": query,
        "start": start,
        "end": end,
        "step": step,
    })

    url = f"{PROMETHEUS_URL}/api/v1/query_range?{params}"

    with urllib.request.urlopen(url, timeout=5) as response:
        payload = response.read().decode("utf-8")

    data = json.loads(payload)

    if data.get("status") != "success":
        return []

    return data.get("data", {}).get("result", [])


@app.get("/api/monitoring/summary")
def get_monitoring_summary() -> dict:
    api_targets = query_prometheus('sum(up{job="localops-api"})')
    request_rate = query_prometheus("sum(rate(localops_api_requests_total[1m]))")
    requests_by_endpoint = query_prometheus(
        "sum(localops_api_requests_total) by (exported_endpoint)"
    )
    service_health = query_prometheus("max(localops_service_health) by (service)")
    firing_alerts = query_prometheus(
        'count(ALERTS{alertstate="firing", alertname=~"LocalOps.*"})'
    )
    availability = query_prometheus(
        'avg_over_time(up{job="localops-api"}[1h]) * 100'
    )
    availability_range = query_prometheus_range(
        'avg(up{job="localops-api"}) * 100',
        minutes=60,
        step="5m",
    )

    availability_series = []
    if availability_range:
        for point in availability_range[0].get("values", []):
            try:
                availability_series.append({
                    "timestamp": float(point[0]),
                    "value": float(point[1]),
                })
            except (IndexError, TypeError, ValueError):
                continue

    return {
        "api_targets_up": prometheus_value(api_targets),
        "api_request_rate": prometheus_value(request_rate),
        "firing_alerts": prometheus_value(firing_alerts),
        "api_availability_percent": prometheus_value(availability),
        "availability_series": availability_series,
        "requests_by_endpoint": [
            {
                "endpoint": item.get("metric", {}).get("exported_endpoint", "unknown"),
                "value": float(item.get("value", [0, "0"])[1]),
            }
            for item in requests_by_endpoint
        ],
        "service_health": [
            {
                "service": item.get("metric", {}).get("service", "unknown"),
                "value": float(item.get("value", [0, "0"])[1]),
            }
            for item in service_health
        ],
    }
