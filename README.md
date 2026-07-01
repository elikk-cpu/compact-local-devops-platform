[![CI](https://github.com/elikk-cpu/compact-local-devops-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/elikk-cpu/compact-local-devops-platform/actions/workflows/ci.yml)

# Compact Local DevOps Platform

Production-like local DevOps platform on three Linux VMs.

## Project goal

This project demonstrates a full self-managed DevOps platform lifecycle:

build -> scan -> publish -> deploy -> observe -> alert -> investigate -> restore

## Product

LocalOps Status Platform is a small B2B-style status platform with:

- public status page
- admin UI
- backend API
- PostgreSQL
- worker/notifier
- GitOps delivery
- monitoring
- logging
- alerts
- backup/restore
- runbooks
- postmortems

## Current infrastructure status

Completed:

- VMware lab network
- 3 Ubuntu Server VMs
- kubeadm Kubernetes cluster
- containerd runtime
- Calico CNI
- Helm
- Ingress-NGINX
- cert-manager with private PKI
- HTTPS for local domains
- Argo CD exposed through HTTPS
- first GitOps-managed placeholder app

## VM topology

| Node | Role | IP |
|---|---|---|
| localops-cp-1 | Kubernetes control-plane | 192.168.57.10 |
| localops-app-1 | Worker node for application workloads | 192.168.57.11 |
| localops-data-1 | Worker node for data/stateful workloads | 192.168.57.12 |

## Repositories

Main repository:

- application code
- Dockerfiles
- Docker Compose
- Helm chart
- Ansible
- documentation
- GitHub Actions

GitOps repository:

- Argo CD Applications
- environment desired state
- cluster deployment state

## Local URLs

- https://status.local:30443
- https://argocd.status.local:30443

## Repository structure

app/
  frontend/
  api/
  worker/
  db/

deploy/
  compose/
  helm/
  bootstrap/

ansible/
  inventory/
  playbooks/

docs/
  diagrams/
  incidents/
  postmortems/
  screenshots/

.github/
  workflows/
