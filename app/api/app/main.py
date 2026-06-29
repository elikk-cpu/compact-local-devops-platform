from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, Response
from pydantic import BaseModel
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST


app = FastAPI(
    title="LocalOps Status Platform API",
    version="0.1.0",
    description="Backend API for LocalOps Status Platform",
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
def platform_status() -> dict:
    REQUEST_COUNTER.labels(endpoint="/api/status").inc()

    degraded_services = [
        service for service in SERVICES if service.status != "operational"
    ]

    overall_status = "operational" if not degraded_services else "degraded"

    return {
        "platform": "LocalOps Status Platform",
        "overall_status": overall_status,
        "services": SERVICES,
        "active_incidents": INCIDENTS,
        "generated_at": datetime.now(timezone.utc).isoformat(),
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
