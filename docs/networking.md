# Networking

## VMware networks

VMnet8:

- NAT network
- used for internet access from VMs

VMnet2:

- host-only network
- used for SSH, Kubernetes access and local service access

## IP plan

| Host | IP |
|---|---|
| Windows host | 192.168.57.1 |
| localops-cp-1 | 192.168.57.10 |
| localops-app-1 | 192.168.57.11 |
| localops-data-1 | 192.168.57.12 |

## Local hostnames

Windows hosts file contains:

- 192.168.57.11 status.local
- 192.168.57.11 admin.status.local
- 192.168.57.11 api.status.local
- 192.168.57.11 grafana.status.local
- 192.168.57.11 argocd.status.local

## Ingress access

Ingress-NGINX is exposed through NodePort:

- HTTP: 30080
- HTTPS: 30443
