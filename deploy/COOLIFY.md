# 🚀 Deploy no Coolify - iHelp NPS

## 📋 Sobre o Coolify

Coolify é uma plataforma self-hosted open-source alternativa ao Heroku, Netlify e Vercel. Permite fazer deploy de aplicações Docker facilmente.

---

## 🎯 Pré-requisitos

- Servidor com Coolify instalado (VPS, Cloud, etc.)
- Acesso ao painel do Coolify
- Repositório Git (GitHub, GitLab, Bitbucket)
- Credenciais do Supabase

---

## 🚀 Deploy via Interface Web (Recomendado)

### 1. Criar Novo Projeto

1. Acesse seu painel do Coolify
2. Clique em **"+ New"** → **"Resource"**
3. Selecione **"Public Repository"** ou conecte seu Git

### 2. Configurar Repositório

**Informações do Repositório:**
- **Repository URL**: `https://github.com/seu-usuario/ihelp-nps`
- **Branch**: `main` ou `master`
- **Build Pack**: Selecione **"Dockerfile"**

### 3. Configurar Build

**Build Settings:**
- **Dockerfile Location**: `/Dockerfile` (raiz do projeto)
- **Docker Compose**: Deixe desmarcado (vamos usar Dockerfile direto)
- **Port**: `80` (porta interna do container)

### 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Como adicionar:**
1. Vá em **"Environment Variables"**
2. Clique em **"+ Add"**
3. Adicione cada variável
4. Marque como **"Build Time"** (importante!)

### 5. Configurar Domínio

**Opções:**
- Use o domínio gerado pelo Coolify: `app-name.coolify.io`
- Ou configure domínio customizado

**Para domínio customizado:**
1. Vá em **"Domains"**
2. Adicione seu domínio
3. Configure DNS:
   ```
   A record: seu-dominio.com → IP do servidor
   ```
4. SSL será configurado automaticamente (Let's Encrypt)

### 6. Deploy

1. Clique em **"Deploy"**
2. Acompanhe os logs de build
3. Aguarde conclusão (2-5 minutos)

---

## 🔧 Deploy via Docker Compose (Alternativo)

Se preferir usar Docker Compose no Coolify:

### 1. Criar docker-compose.coolify.yml

```yaml
services:
  ihelp-nps:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 2. Configurar no Coolify

1. Selecione **"Docker Compose"** como tipo
2. Cole o conteúdo do `docker-compose.coolify.yml`
3. Configure as variáveis de ambiente
4. Deploy!

---

## 🔄 Deploy Automático (CI/CD)

### Webhook de Deploy

Coolify gera um webhook único para deploys automáticos:

1. Vá em **"Webhooks"** no seu projeto
2. Copie a URL do webhook
3. Configure no GitHub:
   - Settings → Webhooks → Add webhook
   - Payload URL: Cole a URL do Coolify
   - Content type: `application/json`
   - Events: `push` e `release`

**Agora cada push dispara deploy automático!** 🎉

---

## 📊 Configurações Avançadas

### Health Checks

O Coolify detectará automaticamente o health check do Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

### Resource Limits

Configure limites de recursos no Coolify:

1. Vá em **"Resource Limits"**
2. Configure:
   - **Memory**: 512 MB
   - **CPU**: 0.5 cores
   - **Storage**: 1 GB

### Logs e Monitoramento

**Ver logs em tempo real:**
1. Acesse o projeto no Coolify
2. Clique em **"Logs"**
3. Logs são atualizados automaticamente

**Métricas:**
- CPU usage
- Memory usage
- Network traffic
- Uptime

---

## 🔐 Segurança

### 1. Variáveis de Ambiente

✅ **Sempre use Secrets** para dados sensíveis:
- No Coolify, marque variáveis como **"Secret"**
- Não serão exibidas nos logs

### 2. HTTPS/SSL

- Coolify configura SSL automaticamente via Let's Encrypt
- Força HTTPS por padrão
- Renovação automática de certificados

### 3. Firewall

Certifique-se que apenas portas necessárias estão abertas:
- `80` (HTTP - redirect para HTTPS)
- `443` (HTTPS)
- `22` (SSH para admin)

---

## 🐛 Troubleshooting

### Build Falha

**Erro: Variáveis de ambiente não encontradas**

Verifique se marcou as variáveis como **"Build Time"**:
1. Edite cada variável
2. Habilite **"Available during buildtime"**
3. Redeploy

**Erro: Out of memory**

Aumente recursos:
1. Resource Limits → Memory: 1 GB
2. Ou otimize build (já está otimizado com multi-stage)

### Container não inicia

**Verifique logs:**
```bash
# No painel Coolify
Logs → Application Logs
```

**Porta incorreta:**
- Certifique-se que expôs porta `80` no Dockerfile
- Coolify faz proxy reverso automático

### Health Check Falha

**Endpoint não responde:**
1. Verifique se `/health` está acessível
2. Teste manualmente via SSH:
   ```bash
   curl http://localhost/health
   ```

---

## 🔄 Rollback

### Reverter para versão anterior:

1. Vá em **"Deployments"**
2. Encontre o deploy funcionando
3. Clique em **"Redeploy"** naquela versão

### Via Git:

```bash
# Reverter commit
git revert HEAD
git push

# Coolify fará deploy automaticamente
```

---

## 📈 Scaling

### Horizontal Scaling

Coolify suporta múltiplas réplicas:

1. Vá em **"Scale"**
2. Aumente número de réplicas
3. Load balancer automático

**Exemplo:**
- 1 réplica: ~100 usuários simultâneos
- 2 réplicas: ~200 usuários simultâneos
- 3 réplicas: ~300 usuários simultâneos

### Vertical Scaling

Aumente recursos por container:
- Memory: 512 MB → 1 GB
- CPU: 0.5 → 1.0 cores

---

## 💾 Backup

### Backup de Configuração

Coolify faz backup automático de:
- Configurações do projeto
- Variáveis de ambiente
- Histórico de deploys

### Backup Manual

```bash
# Conectar via SSH ao servidor
ssh user@seu-servidor

# Backup do container
docker export ihelp-nps > ihelp-nps-backup.tar

# Baixar backup
scp user@seu-servidor:~/ihelp-nps-backup.tar ./
```

---

## 🌐 Múltiplos Ambientes

### Staging + Production

**1. Criar dois projetos no Coolify:**
- `ihelp-nps-staging` (branch: `develop`)
- `ihelp-nps-production` (branch: `main`)

**2. Configurar domínios:**
- Staging: `staging.seu-dominio.com`
- Production: `app.seu-dominio.com`

**3. Workflow:**
```
Develop → Push → staging.seu-dominio.com
Test → Merge to main → app.seu-dominio.com
```

---

## 💰 Custos Estimados

### Servidor VPS Recomendado

| Provider | Specs | Custo Mensal |
|----------|-------|--------------|
| Hetzner | 2 vCPU, 4GB RAM | ~€4.50 |
| DigitalOcean | 2 vCPU, 4GB RAM | $24 |
| Vultr | 2 vCPU, 4GB RAM | $18 |
| Contabo | 4 vCPU, 8GB RAM | €5.99 |

**Recomendação:** Hetzner (melhor custo-benefício)

---

## 🎓 Recursos Adicionais

- [Coolify Documentation](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Coolify Discord](https://discord.gg/coolify)

---

## ✅ Checklist de Deploy

- [ ] Coolify instalado no servidor
- [ ] Repositório Git configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Variáveis marcadas como "Build Time"
- [ ] Domínio configurado
- [ ] DNS apontando para servidor
- [ ] Deploy executado com sucesso
- [ ] Health check OK
- [ ] SSL configurado (automático)
- [ ] Webhook configurado (opcional)
- [ ] Logs verificados
- [ ] Aplicação testada no navegador

---

## 🚀 Quick Start

### Deploy em 5 minutos:

```bash
# 1. Push código para Git
git add .
git commit -m "Deploy to Coolify"
git push

# 2. No Coolify:
# - New Resource → Public Repository
# - Cole URL do repo
# - Selecione "Dockerfile"
# - Adicione variáveis de ambiente
# - Configure porta: 80
# - Deploy!

# 3. Aguarde build (2-5 min)

# 4. Acesse sua aplicação!
```

---

**Pronto! Sua aplicação está no ar com Coolify!** 🎉

**Dúvidas?** Consulte a [documentação oficial](https://coolify.io/docs)
