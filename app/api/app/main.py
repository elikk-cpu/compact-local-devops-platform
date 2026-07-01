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
