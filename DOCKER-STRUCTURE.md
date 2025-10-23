# 📂 Estrutura Docker - iHelp NPS

## 📁 Arquivos Criados

### Arquivos Docker Core

```
ihelp-nps/
├── Dockerfile                    # Build multi-stage da aplicação
├── docker-compose.yml            # Orquestração para desenvolvimento
├── docker-compose.prod.yml       # Override para produção
├── .dockerignore                 # Arquivos excluídos do build
├── nginx.conf                    # Configuração do NGINX
└── .env.example                  # Template de variáveis de ambiente
```

### Documentação

```
ihelp-nps/
├── DOCKER.md                     # Guia completo de Docker
├── DEPLOYMENT-CHECKLIST.md       # Checklist passo a passo
├── BEST-PRACTICES.md             # Melhores práticas e otimizações
└── DOCKER-STRUCTURE.md           # Este arquivo (overview)
```

### Scripts Auxiliares

```
ihelp-nps/
├── docker-deploy.sh              # Script de deploy automatizado
└── scripts/
    └── test-docker.sh            # Script de teste local
```

### Configurações de Deploy Cloud

```
ihelp-nps/
└── deploy/
    ├── README.md                 # Guia de deploy em plataformas cloud
    ├── railway.json              # Configuração Railway
    ├── render.yaml               # Configuração Render
    └── fly.toml                  # Configuração Fly.io
```

### CI/CD

```
ihelp-nps/
└── .github/
    └── workflows/
        └── docker-build.yml      # GitHub Actions workflow
```

---

## 🔍 Detalhamento dos Arquivos

### 🐳 Dockerfile

**Tipo:** Multi-stage build  
**Base Images:**
- Stage 1 (Builder): `node:18-alpine`
- Stage 2 (Runtime): `nginx:alpine`

**Features:**
- Build otimizado de assets Vite
- NGINX para servir SPA
- Health check integrado
- Variáveis de ambiente via build args
- Tamanho final: ~20-30 MB

### 📦 docker-compose.yml

**Desenvolvimento/Testing**
- Porta: 3000:80
- Health checks configurados
- Restart policy: unless-stopped
- Network: bridge isolada

### 🚀 docker-compose.prod.yml

**Produção (Override)**
- Porta: 80:80
- Resource limits (CPU/Memory)
- Logging com rotation
- Restart: always

### 🌐 nginx.conf

**Configurações:**
- Gzip compression
- Cache de assets (1 ano)
- Security headers
- SPA routing (fallback index.html)
- Health check endpoint: `/health`

### 🚫 .dockerignore

**Exclui:**
- node_modules
- .git
- Arquivos de documentação
- Build outputs locais
- Arquivos de IDE

### 🔧 docker-deploy.sh

**Comandos Disponíveis:**
```bash
build       # Build da imagem
start       # Inicia aplicação
stop        # Para aplicação
restart     # Reinicia aplicação
logs        # Exibe logs
status      # Status dos containers
health      # Verifica saúde
deploy      # Deploy completo
clean       # Remove recursos
```

### 🧪 scripts/test-docker.sh

**Testes Automáticos:**
- Verifica .env
- Build da imagem
- Inicia container de teste
- Health check
- Teste de página principal
- Relatório de sucesso/falha

---

## 🎯 Workflows Suportados

### 1️⃣ Development Local

```bash
# Setup
cp .env.example .env
# Editar .env

# Desenvolvimento
docker-compose up -d
docker-compose logs -f

# Parar
docker-compose down
```

### 2️⃣ Testing

```bash
# Teste automatizado
./scripts/test-docker.sh

# Teste manual
docker-compose up -d
curl http://localhost:3000/health
```

### 3️⃣ Deploy Produção

```bash
# Com script
./docker-deploy.sh deploy

# Manual
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 4️⃣ Deploy Cloud

**Opção A - Railway:**
```bash
railway up
```

**Opção B - Render:**
```bash
render deploy
```

**Opção C - Fly.io:**
```bash
flyctl deploy
```

**Opção D - AWS/GCP/Azure:**
Ver guia em `deploy/README.md`

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     Build Stage                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  node:18-alpine                                  │   │
│  │  - npm install                                   │   │
│  │  - vite build                                    │   │
│  │  Output: /app/dist                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Production Stage                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  nginx:alpine                                    │   │
│  │  - Copy dist files                               │   │
│  │  - Copy nginx.conf                               │   │
│  │  - Expose port 80                                │   │
│  │  - Health check: /health                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Runtime                              │
│                                                           │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐        │
│  │  Client  │────▶│  NGINX   │────▶│ Supabase │        │
│  │ Browser  │◀────│  :80     │◀────│   API    │        │
│  └──────────┘     └──────────┘     └──────────┘        │
│                         │                                 │
│                    Health Check                          │
│                    /health → OK                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Deploy

### Desenvolvimento → Produção

```
1. Desenvolvimento Local
   ├─ npm run dev
   └─ Testes manuais

2. Build Docker
   ├─ docker-compose build
   └─ ./scripts/test-docker.sh

3. Deploy Staging
   ├─ docker-compose up -d
   └─ Testes de integração

4. Tag & Push
   ├─ git tag v1.0.0
   ├─ git push --tags
   └─ GitHub Actions build

5. Deploy Produção
   ├─ Pull imagem do registry
   ├─ docker-compose -f docker-compose.prod.yml up -d
   └─ Health check

6. Monitoramento
   ├─ docker stats
   ├─ docker logs -f
   └─ Alertas configurados
```

---

## 🎓 Como Usar Esta Documentação

### Para Iniciantes

1. **Leia primeiro:** `README.md` → `DOCKER.md`
2. **Siga o checklist:** `DEPLOYMENT-CHECKLIST.md`
3. **Execute:** `./docker-deploy.sh deploy`

### Para Experientes

1. **Quick start:** `docker-compose up -d`
2. **Deploy cloud:** `deploy/README.md`
3. **Otimizações:** `BEST-PRACTICES.md`

### Para DevOps

1. **CI/CD:** `.github/workflows/docker-build.yml`
2. **Monitoring:** Health checks e logs
3. **Scaling:** `docker-compose.prod.yml` com replicas

---

## 📋 Checklist de Arquivos

Use este checklist para verificar se todos os arquivos foram criados:

### Docker Core
- [x] Dockerfile
- [x] docker-compose.yml
- [x] docker-compose.prod.yml
- [x] .dockerignore
- [x] nginx.conf
- [x] .env.example

### Documentação
- [x] DOCKER.md
- [x] DEPLOYMENT-CHECKLIST.md
- [x] BEST-PRACTICES.md
- [x] DOCKER-STRUCTURE.md

### Scripts
- [x] docker-deploy.sh
- [x] scripts/test-docker.sh

### Deploy Configs
- [x] deploy/README.md
- [x] deploy/railway.json
- [x] deploy/render.yaml
- [x] deploy/fly.toml

### CI/CD
- [x] .github/workflows/docker-build.yml

### Git
- [x] .gitignore (atualizado)

---

## 🚀 Próximos Passos

1. ✅ **Configure o .env**
   ```bash
   cp .env.example .env
   nano .env
   ```

2. ✅ **Teste localmente**
   ```bash
   ./scripts/test-docker.sh
   ```

3. ✅ **Deploy**
   ```bash
   ./docker-deploy.sh deploy
   ```

4. ✅ **Monitore**
   ```bash
   docker-compose logs -f
   ```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique `DEPLOYMENT-CHECKLIST.md` - Seção Troubleshooting
2. Execute `./scripts/test-docker.sh` para diagnóstico
3. Consulte logs: `docker-compose logs ihelp-nps`
4. Revise `BEST-PRACTICES.md` para otimizações

---

**Versão:** 1.0.0  
**Última atualização:** Outubro 2025  
**Mantido por:** Equipe iHelp NPS
