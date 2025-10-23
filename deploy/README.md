# 🚀 Guia de Deploy em Plataformas Cloud

Este diretório contém configurações para deploy do iHelp NPS em diferentes plataformas de cloud.

## 📦 Plataformas Suportadas

- [Coolify](#coolify) ⭐ **Recomendado** - Self-hosted, open-source
- [Railway](#railway)
- [Render](#render)
- [Fly.io](#flyio)
- [AWS ECS](#aws-ecs)
- [Google Cloud Run](#google-cloud-run)
- [Azure Container Instances](#azure-container-instances)
- [DigitalOcean App Platform](#digitalocean-app-platform)

---

## Coolify

⭐ **Recomendado para quem tem VPS próprio!**

Coolify é uma plataforma self-hosted open-source alternativa ao Heroku/Netlify. Deploy fácil com interface web.

### Deploy via Interface Web

1. **Novo Projeto**: Click em "+ New" → "Resource" → "Public Repository"
2. **Configure Repo**: Cole URL do seu repositório Git
3. **Build Pack**: Selecione "Dockerfile"
4. **Variáveis de Ambiente**:
   ```env
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   ```
   ⚠️ Marque como **"Build Time"**!
5. **Port**: `80` (porta interna)
6. **Deploy**: Click em "Deploy" e aguarde!

### Recursos

- ✅ SSL/HTTPS automático (Let's Encrypt)
- ✅ CI/CD via webhooks
- ✅ Logs em tempo real
- ✅ Health checks automáticos
- ✅ Múltiplos ambientes (staging/prod)
- ✅ Zero-downtime deploys

### Custos

| Provider | Specs | Custo/mês |
|----------|-------|-----------|
| Hetzner | 2 vCPU, 4GB | ~€4.50 |
| DigitalOcean | 2 vCPU, 4GB | $24 |

**Guia completo**: [COOLIFY.md](./COOLIFY.md) 📖

---

## Railway

### Deploy Automático

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Deploy Manual

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Criar novo projeto
railway init

# Adicionar variáveis de ambiente
railway variables set VITE_SUPABASE_URL=sua_url
railway variables set VITE_SUPABASE_ANON_KEY=sua_chave

# Deploy
railway up
```

**Arquivo de configuração**: `railway.json`

---

## Render

### Deploy via Dashboard

1. Conecte seu repositório GitHub
2. Selecione "Web Service" → "Docker"
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em "Deploy"

### Deploy via CLI

```bash
# Instalar Render CLI
brew install render

# Deploy
render deploy
```

**Arquivo de configuração**: `render.yaml`

---

## Fly.io

### Setup Inicial

```bash
# Instalar flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Criar app
flyctl launch --no-deploy

# Adicionar secrets
flyctl secrets set VITE_SUPABASE_URL=sua_url
flyctl secrets set VITE_SUPABASE_ANON_KEY=sua_chave

# Deploy
flyctl deploy
```

### Comandos Úteis

```bash
# Ver logs
flyctl logs

# Abrir app
flyctl open

# SSH no container
flyctl ssh console

# Escalar
flyctl scale count 2
```

**Arquivo de configuração**: `fly.toml`

---

## AWS ECS

### Pré-requisitos

- AWS CLI instalado e configurado
- ECR repository criado
- ECS cluster configurado

### Deploy

```bash
# 1. Build e tag da imagem
docker build -t ihelp-nps:latest \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  .

# 2. Tag para ECR
docker tag ihelp-nps:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/ihelp-nps:latest

# 3. Login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# 4. Push para ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/ihelp-nps:latest

# 5. Atualizar serviço ECS
aws ecs update-service \
  --cluster seu-cluster \
  --service ihelp-nps \
  --force-new-deployment
```

### Task Definition (JSON)

```json
{
  "family": "ihelp-nps",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "ihelp-nps",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/ihelp-nps:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## Google Cloud Run

### Deploy

```bash
# 1. Configure o projeto
gcloud config set project seu-projeto-id

# 2. Build com Cloud Build
gcloud builds submit --tag gcr.io/seu-projeto-id/ihelp-nps \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# 3. Deploy no Cloud Run
gcloud run deploy ihelp-nps \
  --image gcr.io/seu-projeto-id/ihelp-nps \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1
```

---

## Azure Container Instances

### Deploy

```bash
# 1. Login no Azure
az login

# 2. Criar resource group
az group create --name ihelp-nps-rg --location eastus

# 3. Criar container registry
az acr create --resource-group ihelp-nps-rg \
  --name ihelpnpsregistry --sku Basic

# 4. Login no registry
az acr login --name ihelpnpsregistry

# 5. Build e push
az acr build --registry ihelpnpsregistry \
  --image ihelp-nps:latest \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  .

# 6. Deploy container instance
az container create \
  --resource-group ihelp-nps-rg \
  --name ihelp-nps \
  --image ihelpnpsregistry.azurecr.io/ihelp-nps:latest \
  --dns-name-label ihelp-nps \
  --ports 80
```

---

## DigitalOcean App Platform

### Deploy via Dashboard

1. Acesse o App Platform no painel da DigitalOcean
2. Clique em "Create App"
3. Conecte seu repositório GitHub
4. Selecione "Dockerfile"
5. Configure variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Escolha o plano e região
7. Clique em "Deploy"

### Deploy via CLI

```bash
# Instalar doctl
brew install doctl

# Autenticar
doctl auth init

# Criar app
doctl apps create --spec - <<EOF
name: ihelp-nps
services:
- name: web
  dockerfile_path: Dockerfile
  github:
    repo: seu-usuario/ihelp-nps
    branch: main
  envs:
  - key: VITE_SUPABASE_URL
    value: sua_url
  - key: VITE_SUPABASE_ANON_KEY
    value: sua_chave
  health_check:
    http_path: /health
  instance_count: 1
  instance_size_slug: basic-xxs
EOF
```

---

## 🔐 Segurança

### Variáveis de Ambiente

**Nunca commite** suas credenciais! Use secrets da plataforma:

- **Railway**: `railway variables`
- **Render**: Environment Variables no dashboard
- **Fly.io**: `flyctl secrets`
- **AWS**: AWS Secrets Manager ou Parameter Store
- **GCP**: Secret Manager
- **Azure**: Key Vault
- **DigitalOcean**: App-level environment variables

### HTTPS

Todas as plataformas listadas fornecem HTTPS automaticamente. Configure:

1. Domínio customizado
2. SSL/TLS certificate (gerado automaticamente)
3. Force HTTPS redirect (habilitado por padrão)

---

## 📊 Monitoramento

### Health Checks

Todas as configurações incluem health checks em `/health`:

```bash
# Testar
curl https://sua-app.com/health
```

### Logs

```bash
# Coolify
# Via interface web: Logs → Application Logs

# Railway
railway logs

# Render
render logs

# Fly.io
flyctl logs

# AWS ECS
aws logs tail /ecs/ihelp-nps --follow

# GCP
gcloud run logs read --service ihelp-nps

# Azure
az container logs --resource-group ihelp-nps-rg --name ihelp-nps

# DigitalOcean
doctl apps logs <app-id>
```

---

## 💰 Custos Estimados

| Plataforma | Free Tier | Custo Mensal (estimado) |
|------------|-----------|-------------------------|
| Coolify (Self-hosted) | N/A | €4.50-25 (VPS) ⭐ |
| Railway | $5 de crédito/mês | ~$5-10 |
| Render | 750h/mês grátis | $7+ |
| Fly.io | 3 VMs grátis | $0-5 |
| AWS ECS | 12 meses grátis | $10-30 |
| GCP Cloud Run | 2M requests/mês | $0-10 |
| Azure ACI | 12 meses $200 crédito | $10-20 |
| DigitalOcean | $200 crédito 60 dias | $5-12 |

*Valores aproximados para tráfego baixo/médio*

---

## 🆘 Troubleshooting

### Build Failures

```bash
# Verificar build args
docker build --progress=plain --no-cache \
  --build-arg VITE_SUPABASE_URL=test \
  --build-arg VITE_SUPABASE_ANON_KEY=test \
  .
```

### Container não inicia

- Verifique se as variáveis de ambiente estão configuradas
- Confirme que a porta 80 está exposta
- Valide o health check endpoint

### Erro 502/504

- Aumente timeout do health check
- Verifique logs do container
- Confirme que o NGINX está rodando

---

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)
- [GCP Cloud Run Docs](https://cloud.google.com/run/docs)
- [Azure Container Instances Docs](https://docs.microsoft.com/azure/container-instances/)
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
