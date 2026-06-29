import asyncio
import os
from datetime import datetime, timezone

from fastapi import FastAPI, Response
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST


app = FastAPI(
    title="LocalOps Worker",
    version="0.1.0",
    description="Background worker for LocalOps Status Platform",
)

WORKER_LOOPS_TOTAL = Counter(
    "localops_worker_loops_total",
    "Total worker processing loops",
)

WORKER_JOBS_PROCESSED_TOTAL = Counter(
    "localops_worker_jobs_processed_total",
    "Total simulated jobs processed by worker",
)

WORKER_UP = Gauge(
    "localops_worker_up",
    "Worker health status: 1 up, 0 down",
)

WORKER_MODE = os.getenv("WORKER_MODE", "local")
WORKER_INTERVAL_SECONDS = int(os.getenv("WORKER_INTERVAL_SECONDS", "10"))


async def worker_loop() -> None:
    while True:
        WORKER_UP.set(1)
        WORKER_LOOPS_TOTAL.inc()
        WORKER_JOBS_PROCESSED_TOTAL.inc()
        print(
            {
                "event": "worker_loop",
                "mode": WORKER_MODE,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            flush=True,
        )
        await asyncio.sleep(WORKER_INTERVAL_SECONDS)


@app.on_event("startup")
async def startup_event() -> None:
    WORKER_UP.set(1)
    asyncio.create_task(worker_loop())


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "localops-worker",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/ready")
def ready() -> dict:
    return {
        "status": "ready",
        "worker_mode": WORKER_MODE,
        "interval_seconds": WORKER_INTERVAL_SECONDS,
    }


@app.get("/metrics")
def metrics() -> Response:
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )
