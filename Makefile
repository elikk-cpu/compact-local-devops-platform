.PHONY: api-dev api-test worker-dev worker-test frontend-dev frontend-build compose-up compose-down git-status

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

frontend-dev:
	cd app/frontend && npm run dev -- --host 0.0.0.0 --port 5173

frontend-build:
	cd app/frontend && npm run build

compose-up:
	cd deploy/compose && docker compose up --build

compose-down:
	cd deploy/compose && docker compose down

git-status:
	git status


# Local release workflow for Kubernetes dev environment
REGISTRY ?= 192.168.57.10:5000
TAG ?= dev
FRONTEND_API_BASE_URL ?= https://status.local:30443

.PHONY: release-dev build-api-image build-worker-image build-frontend-image push-dev-images registry-check

release-dev: build-api-image build-worker-image build-frontend-image push-dev-images registry-check

build-api-image:
	docker build -t $(REGISTRY)/localops-api:$(TAG) app/api

build-worker-image:
	docker build -t $(REGISTRY)/localops-worker:$(TAG) app/worker

build-frontend-image:
	docker build --build-arg VITE_API_BASE_URL=$(FRONTEND_API_BASE_URL) -t $(REGISTRY)/localops-frontend:$(TAG) app/frontend

push-dev-images:
	docker push $(REGISTRY)/localops-api:$(TAG)
	docker push $(REGISTRY)/localops-worker:$(TAG)
	docker push $(REGISTRY)/localops-frontend:$(TAG)

registry-check:
	curl -fsS http://127.0.0.1:5000/v2/_catalog
	curl -fsS http://127.0.0.1:5000/v2/localops-api/tags/list
	curl -fsS http://127.0.0.1:5000/v2/localops-worker/tags/list
	curl -fsS http://127.0.0.1:5000/v2/localops-frontend/tags/list
.PHONY: smoke
smoke:
	./scripts/smoke-test.sh

.PHONY: incident-test
incident-test:
	./scripts/incident-test.sh

.PHONY: status
status:
	@echo "== Nodes =="
	@kubectl get nodes -o wide
	@echo
	@echo "== Ops-dev deployments =="
	@kubectl get deploy -n ops-dev
	@echo
	@echo "== Ops-dev pods =="
	@kubectl get pods -n ops-dev -o wide
	@echo
	@echo "== Services =="
	@kubectl get svc -n ops-dev
	@echo
	@echo "== Ingress =="
	@kubectl get ingress -n ops-dev
	@echo
	@echo "== Argo CD =="
	@kubectl get applications -n argocd
	@echo
	@echo "== Local registry =="
	@docker ps --filter name=localops-registry

.PHONY: help
help:
	@echo "LocalOps commands:"
	@echo "  make status        - show platform state"
	@echo "  make doctor        - check local environment readiness"
	@echo "  make smoke         - run health smoke test"
	@echo "  make incident-test - simulate worker outage and restore"
	@echo "  make release-dev   - build and push dev images"

.PHONY: doctor
doctor:
	./scripts/doctor.sh
