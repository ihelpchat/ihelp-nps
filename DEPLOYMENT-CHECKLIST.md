# ✅ Checklist de Deploy - iHelp NPS

## 📋 Pré-Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Credenciais do Supabase configuradas
- [ ] Repositório Git atualizado
- [ ] Build local testado

## 🔧 Configuração

### 1. Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais
nano .env
```

**Variáveis obrigatórias:**
- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_ANON_KEY`

### 2. Teste Local

```bash
# Build da imagem
docker-compose build

# Iniciar aplicação
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Testar health check
curl http://localhost:3000/health
```

**Checklist de Teste:**
- [ ] Aplicação iniciou sem erros
- [ ] Dashboard carrega corretamente
- [ ] Dados do Supabase são exibidos
- [ ] Filtros funcionam
- [ ] Export CSV funciona
- [ ] Health check retorna OK

### 3. Otimização

```bash
# Verificar tamanho da imagem
docker images | grep ihelp-nps

# Limpar cache de build
docker builder prune
```

**Tamanho esperado da imagem final:** ~20-30 MB

## 🚀 Deploy

### Opção A: Script Automatizado (Recomendado)

```bash
./docker-deploy.sh deploy
```

### Opção B: Docker Compose Manual

```bash
# Desenvolvimento
docker-compose up -d --build

# Produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Opção C: Plataforma Cloud

Ver guia completo em: `deploy/README.md`

**Plataformas suportadas:**
- [ ] Railway
- [ ] Render
- [ ] Fly.io
- [ ] AWS ECS
- [ ] Google Cloud Run
- [ ] Azure Container Instances
- [ ] DigitalOcean App Platform

## 📊 Pós-Deploy

### Verificações

```bash
# Status do container
docker ps

# Logs em tempo real
docker-compose logs -f

# Health check
curl https://seu-dominio.com/health

# Recursos do container
docker stats ihelp-nps
```

**Checklist Pós-Deploy:**
- [ ] Container está rodando
- [ ] Aplicação acessível via navegador
- [ ] HTTPS configurado (produção)
- [ ] Health check respondendo
- [ ] Logs sem erros
- [ ] Dados do Supabase carregam
- [ ] Performance aceitável

### Monitoramento

```bash
# Ver uso de recursos
docker stats --no-stream ihelp-nps

# Verificar uptime
docker inspect ihelp-nps | grep "Status\|StartedAt"

# Logs das últimas 100 linhas
docker logs --tail 100 ihelp-nps
```

## 🔐 Segurança

- [ ] Arquivo `.env` não commitado no Git
- [ ] Secrets configurados na plataforma cloud
- [ ] HTTPS habilitado em produção
- [ ] Security headers configurados (verificar nginx.conf)
- [ ] CORS configurado no Supabase
- [ ] RLS (Row Level Security) habilitado no Supabase

## 🎯 Performance

### Otimizações Aplicadas

- [x] Build multi-stage (reduz tamanho da imagem)
- [x] NGINX Gzip compression
- [x] Cache de assets estáticos (1 ano)
- [x] Health checks configurados
- [x] Resource limits definidos (produção)

### Métricas Esperadas

| Métrica | Valor Esperado |
|---------|----------------|
| Tempo de build | < 5 minutos |
| Tempo de boot | < 30 segundos |
| Tamanho da imagem | 20-30 MB |
| Uso de memória | < 256 MB |
| Tempo de resposta | < 500ms |

## 🆘 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs ihelp-nps

# Verificar variáveis de ambiente
docker exec ihelp-nps env | grep VITE
```

### Build falha

```bash
# Build com output detalhado
docker build --progress=plain --no-cache .

# Verificar dependências
docker run --rm -it node:18-alpine npm --version
```

### Aplicação não carrega

```bash
# Verificar se NGINX está rodando
docker exec ihelp-nps ps aux | grep nginx

# Verificar arquivos buildados
docker exec ihelp-nps ls -la /usr/share/nginx/html

# Testar NGINX config
docker exec ihelp-nps nginx -t
```

### Erro de conexão com Supabase

```bash
# Verificar variáveis de ambiente
docker exec ihelp-nps sh -c 'echo $VITE_SUPABASE_URL'

# Testar conectividade
docker exec ihelp-nps wget -O- $VITE_SUPABASE_URL/rest/v1/
```

## 📝 Comandos Úteis

```bash
# Restart rápido
docker-compose restart

# Rebuild sem cache
docker-compose build --no-cache

# Ver recursos usados
docker stats ihelp-nps

# Limpar tudo
docker-compose down -v
docker system prune -a

# Backup de volume (se houver)
docker run --rm -v ihelp-nps_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## 📚 Documentação

- **Guia Docker Completo**: [DOCKER.md](./DOCKER.md)
- **Deploy em Cloud**: [deploy/README.md](./deploy/README.md)
- **README Principal**: [README.md](./README.md)
- **Script de Deploy**: `./docker-deploy.sh help`

## 🎉 Deploy Concluído!

Quando todos os checkboxes estiverem marcados, seu deploy está completo e pronto para produção!

---

**Última atualização**: $(date)
**Versão**: 1.0.0
