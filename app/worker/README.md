# LocalOps Worker

Background worker service for the LocalOps Status Platform.

## Purpose

The worker will be responsible for background jobs such as:

- notification processing
- Telegram alert delivery
- incident state updates
- periodic health checks
- future scheduled tasks

## Current endpoints

- GET /health
- GET /ready
- GET /metrics
