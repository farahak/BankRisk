# Script PowerShell pour déployer et vérifier Prometheus & Grafana
# Usage: .\DEPLOY.ps1

Write-Host "`n🚀 Déploiement de Prometheus & Grafana" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Déployer Prometheus
Write-Host "📊 Déploiement de Prometheus..." -ForegroundColor Cyan
kubectl apply -f prometheus-configmap.yaml
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f prometheus-service.yaml

# Déployer Grafana
Write-Host "`n📈 Déploiement de Grafana..." -ForegroundColor Cyan
kubectl apply -f grafana-datasource-configmap.yaml
kubectl apply -f dash-provider.yaml
kubectl apply -f grafana-deployment.yaml
kubectl apply -f grafana-service.yaml

# Attendre le démarrage
Write-Host "`n⏳ Attente du démarrage des pods (30s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérification
Write-Host "`n✅ Vérification des déploiements`n" -ForegroundColor Green
Write-Host "=== PODS ===" -ForegroundColor Cyan
kubectl get pods -l app=prometheus-server
kubectl get pods -l app=grafana

Write-Host "`n=== SERVICES ===" -ForegroundColor Cyan
kubectl get svc | Select-String "prometheus|grafana"

Write-Host "`n🌐 URLs d'accès:" -ForegroundColor Green
Write-Host "---------------" -ForegroundColor Green

Write-Host "`nPrometheus: " -NoNewline -ForegroundColor Yellow
minikube service prometheus-service --url

Write-Host "`nGrafana: " -NoNewline -ForegroundColor Yellow
minikube service grafana-service --url

Write-Host "`n✨ Déploiement terminé!" -ForegroundColor Green
Write-Host "Credentials Grafana: admin/admin`n" -ForegroundColor Yellow
