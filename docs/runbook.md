# LocalOps Status Platform — Runbook

## Purpose

This runbook contains operational commands for starting, checking, troubleshooting, and stopping the LocalOps Status Platform lab.

## 1. Start the lab

Start the three virtual machines:

```text
localops-cp-1
localops-app-1
localops-data-1
```

Wait 1–2 minutes, then connect to the control-plane node:

```text
192.168.57.10
```

## 2. Basic cluster checks

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

Expected result:

```text
all nodes are Ready
system pods are Running
```

## 3. Application checks

```bash
kubectl get applications -n argocd
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev -o wide
kubectl get svc -n ops-dev
kubectl get ingress -n ops-dev
kubectl get certificate -n ops-dev
```

Expected result:

```text
localops-platform is Synced and Healthy
localops-api is Available
localops-frontend is Available
localops-worker is Available
certificate is Ready=True
```

## 4. External URLs

```text
https://status.local:30443
https://status.local:30443/admin
https://argocd.status.local:30443
```

## 5. Local registry checks

The local registry runs on the control-plane node:

```text
192.168.57.10:5000
```

Check registry container:

```bash
docker ps --filter name=localops-registry
```

Check catalog:

```bash
curl http://127.0.0.1:5000/v2/_catalog
```

Check tags:

```bash
curl http://127.0.0.1:5000/v2/localops-api/tags/list
curl http://127.0.0.1:5000/v2/localops-worker/tags/list
curl http://127.0.0.1:5000/v2/localops-frontend/tags/list
```

## 6. Build and push dev images

Use the local release workflow:

```bash
cd ~/compact-local-devops-platform
make release-dev
```

This command builds and pushes:

```text
192.168.57.10:5000/localops-api:dev
192.168.57.10:5000/localops-worker:dev
192.168.57.10:5000/localops-frontend:dev
```

## 7. GitOps proof

Scale worker replicas through Git:

```bash
cd ~/compact-local-devops-platform
grep -A5 "^worker:" deploy/helm/localops-platform/values.yaml
```

After changing `worker.replicas`, commit and push:

```bash
git add deploy/helm/localops-platform/values.yaml
git commit -m "scale worker replicas via GitOps"
git push
```

Then check Argo CD and Kubernetes:

```bash
kubectl get applications -n argocd
kubectl get deploy -n ops-dev
kubectl get pods -n ops-dev -o wide
```

## 8. Troubleshooting: ImagePullBackOff

Check pod events:

```bash
kubectl get events -n ops-dev --sort-by=.lastTimestamp | tail -n 30
```

Describe a failed pod:

```bash
kubectl describe pod -n ops-dev <pod-name>
```

If the error says:

```text
server gave HTTP response to HTTPS client
```

then containerd is trying to use HTTPS for the local HTTP registry.

Check containerd registry config on all nodes:

```bash
for host in 192.168.57.10 192.168.57.11 192.168.57.12; do
  echo "=== $host ==="
  ssh devops@$host 'grep -nE "cri.v1.images|config_path|certs.d" /etc/containerd/config.toml'
done
```

Expected config:

```text
[plugins.'io.containerd.cri.v1.images'.registry]
    config_path = "/etc/containerd/certs.d"
```

Check hosts.toml:

```bash
for host in 192.168.57.10 192.168.57.11 192.168.57.12; do
  echo "=== $host ==="
  ssh devops@$host 'cat /etc/containerd/certs.d/192.168.57.10:5000/hosts.toml'
done
```

Expected hosts.toml:

```toml
server = "http://192.168.57.10:5000"

[host."http://192.168.57.10:5000"]
  capabilities = ["pull", "resolve", "push"]
  skip_verify = true
```

Restart containerd and kubelet:

```bash
for host in 192.168.57.10 192.168.57.11 192.168.57.12; do
  echo "=== restart $host ==="
  ssh devops@$host 'sudo systemctl restart containerd && sudo systemctl restart kubelet'
done
```

Then recreate failed pods:

```bash
kubectl delete pod -n ops-dev --all
kubectl get pods -n ops-dev -w
```

## 9. Troubleshooting: Argo CD

Check applications:

```bash
kubectl get applications -n argocd
```

Describe application:

```bash
kubectl describe application localops-platform -n argocd | tail -n 60
```

Check Argo CD pods:

```bash
kubectl get pods -n argocd
```

## 10. Troubleshooting: Ingress and TLS

Check ingress:

```bash
kubectl get ingress -n ops-dev
kubectl describe ingress localops-platform -n ops-dev
```

Check certificate:

```bash
kubectl get certificate -n ops-dev
kubectl describe certificate status-local-tls -n ops-dev
```

Check cert-manager:

```bash
kubectl get pods -n cert-manager
kubectl get clusterissuer
```

## 11. Stop the lab

Stop application containers started by Docker Compose if any are running:

```bash
cd ~/compact-local-devops-platform/deploy/compose
docker compose down
```

Check Git state:

```bash
cd ~/compact-local-devops-platform
git status
```

Shut down virtual machines from Windows PowerShell:

```powershell
ssh devops@192.168.57.11 "sudo shutdown -h now"
ssh devops@192.168.57.12 "sudo shutdown -h now"
ssh devops@192.168.57.10 "sudo shutdown -h now"
```

Recommended order:

```text
1. localops-app-1
2. localops-data-1
3. localops-cp-1
```
