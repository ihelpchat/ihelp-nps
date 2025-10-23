# ⚡ Quick Start - Deploy Docker

## 🚀 3 Passos para Deploy

### 1. Configurar Credenciais (30 segundos)

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais do Supabase
nano .env
```

### 2. Deploy Automático (2-5 minutos)

```bash
# Executar script de deploy
./docker-deploy.sh deploy
```

### 3. Acessar Aplicação

Abra no navegador: **http://localhost:3000**

---

## 🎯 É isso!

Sua aplicação está rodando no Docker!

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [README.md](./README.md) | Visão geral do projeto |
| [DOCKER.md](./DOCKER.md) | Guia completo de Docker |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Checklist detalhado |
| [BEST-PRACTICES.md](./BEST-PRACTICES.md) | Otimizações e práticas |
| [DOCKER-STRUCTURE.md](./DOCKER-STRUCTURE.md) | Estrutura dos arquivos |
| [deploy/README.md](./deploy/README.md) | Deploy em cloud |

---

## 🔧 Comandos Úteis

```bash
# Ver logs
./docker-deploy.sh logs

# Verificar status
./docker-deploy.sh status

# Parar aplicação
./docker-deploy.sh stop

# Reiniciar
./docker-deploy.sh restart

# Health check
./docker-deploy.sh health

# Ver todas opções
./docker-deploy.sh help
```

---

## 🌐 Deploy em Produção

### Railway (Recomendado - Mais Fácil)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Render

```bash
# Conectar repositório GitHub no dashboard
# https://render.com/
```

### Fly.io

```bash
flyctl launch
flyctl deploy
```

### Mais Opções

Veja [deploy/README.md](./deploy/README.md) para AWS, GCP, Azure, etc.

---

## ❓ Problemas?

1. **Container não inicia:**
   ```bash
   docker-compose logs ihelp-nps
   ```

2. **Erro de build:**
   ```bash
   ./scripts/test-docker.sh
   ```

3. **Verificar configuração:**
   ```bash
   docker-compose config
   ```

---

## ✅ Checklist Rápido

- [ ] Arquivo .env configurado
- [ ] Docker instalado e rodando
- [ ] Script de deploy executado
- [ ] Aplicação acessível em localhost:3000
- [ ] Health check retorna OK
- [ ] Dashboard carrega dados do Supabase

---

**Dúvidas?** Consulte a [documentação completa](./DOCKER.md)
