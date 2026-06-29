.PHONY: api-dev api-test worker-dev worker-test compose-up compose-down git-status

api-dev:
cd app/api && . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000

api-test:
curl -f http://127.0.0.1:8000/health
curl -f http://127.0.0.1:8000/ready
curl -f http://127.0.0.1:8000/api/status
curl -f http://127.0.0.1:8000/metrics | head

worker-dev:
cd app/worker && . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 9000

worker-test:
curl -f http://127.0.0.1:9000/health
curl -f http://127.0.0.1:9000/ready
curl -f http://127.0.0.1:9000/metrics | head

compose-up:
cd deploy/compose && docker compose up --build

compose-down:
cd deploy/compose && docker compose down

git-status:
git status
