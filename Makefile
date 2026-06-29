.PHONY: api-dev api-test git-status

api-dev:
cd app/api && . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000

api-test:
curl -f http://127.0.0.1:8000/health
curl -f http://127.0.0.1:8000/ready
curl -f http://127.0.0.1:8000/api/status
curl -f http://127.0.0.1:8000/metrics | head

git-status:
git status
