# Current State

## Completed platform foundation

The current lab already includes:

- Windows 10 host
- VMware Workstation Pro
- 3 Ubuntu Server 24.04 VMs
- kubeadm Kubernetes cluster
- containerd runtime
- Calico CNI
- Ingress-NGINX
- cert-manager
- private local PKI
- Argo CD
- first GitOps-managed application

## Current Kubernetes nodes

Expected nodes:

- localops-cp-1: Ready, control-plane
- localops-app-1: Ready, worker
- localops-data-1: Ready, worker

## Current GitOps proof

The GitOps repository manages the status-placeholder application.

Argo CD verified:

- automated sync
- self-heal
- Git-driven replica change
- drift correction after manual kubectl scale
