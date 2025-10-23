# 🎯 Melhores Práticas - Deploy Docker

## 🏗️ Arquitetura

### Multi-Stage Build

O Dockerfile usa multi-stage build para:
- ✅ Reduzir tamanho da imagem final (20-30 MB vs 200+ MB)
- ✅ Separar dependências de build das de runtime
- ✅ Melhorar segurança (menos ferramentas no container final)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
# ... build da aplicação

# Stage 2: Runtime
FROM nginx:alpine
# ... apenas arquivos necessários
```

### NGINX como Web Server

Usar NGINX em vez de servir com Vite/Node:
- ✅ Muito mais eficiente para servir arquivos estáticos
- ✅ Menor uso de memória (≈10 MB vs 50+ MB)
- ✅ Melhor performance sob carga
- ✅ Cache e compressão nativos

## 🔐 Segurança

### Variáveis de Ambiente

**❌ Nunca faça:**
```dockerfile
ENV VITE_SUPABASE_URL=https://meu-projeto.supabase.co
ENV VITE_SUPABASE_ANON_KEY=minha_chave_secreta
```

**✅ Sempre use build args:**
```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
```

### Security Headers

O `nginx.conf` inclui headers de segurança:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Permissões

- ✅ NGINX roda como usuário não-root
- ✅ Arquivos estáticos são read-only
- ✅ Container não precisa de privilégios especiais

## ⚡ Performance

### Cache de Assets

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Benefícios:**
- Reduz carregamento em visitas subsequentes
- Menos uso de bandwidth
- Melhor experiência do usuário

### Gzip Compression

```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/javascript;
```

**Economia típica:**
- HTML: ~60% menor
- CSS: ~70% menor
- JavaScript: ~50-60% menor

### Build Optimizations

**.dockerignore** remove arquivos desnecessários:
- node_modules (será reinstalado)
- .git (histórico não necessário)
- documentação e arquivos de dev

**Resultado:** Build 3-5x mais rápido

## 🔄 CI/CD

### GitHub Actions

O workflow em `.github/workflows/docker-build.yml`:

1. Build automático em cada push
2. Tag com versão semântica
3. Cache de layers do Docker
4. Push para registry

### Versionamento

```bash
# Desenvolvimento
docker tag ihelp-nps:latest ihelp-nps:dev

# Staging
docker tag ihelp-nps:latest ihelp-nps:staging

# Produção
docker tag ihelp-nps:latest ihelp-nps:1.0.0
docker tag ihelp-nps:latest ihelp-nps:latest
```

## 📊 Monitoramento

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

**Docker irá:**
- Verificar saúde a cada 30s
- Reiniciar container se falhar
- Remover container de load balancer se unhealthy

### Logging

**Estrutura recomendada:**
```bash
# Logs em JSON para parsing
docker-compose.yml:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

### Métricas

```bash
# Uso de recursos
docker stats ihelp-nps --no-stream

# CPU e memória por período
docker stats ihelp-nps --format "table {{.CPUPerc}}\t{{.MemUsage}}"
```

## 🌍 Deploy Multi-Região

### Load Balancing

Para alta disponibilidade:

```yaml
# docker-compose com replicas
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
```

### CDN

Coloque CDN na frente para:
- Cache de assets estáticos
- SSL/TLS termination
- DDoS protection
- Edge locations globais

**Opções populares:**
- Cloudflare (grátis)
- AWS CloudFront
- Fastly
- Vercel Edge Network

## 🔧 Manutenção

### Updates

```bash
# Pull nova versão
git pull

# Rebuild e restart sem downtime
docker-compose up -d --build --no-deps --force-recreate ihelp-nps
```

### Rollback

```bash
# Voltar para versão anterior
docker tag ihelp-nps:1.0.0 ihelp-nps:latest
docker-compose up -d
```

### Backups

Apesar de ser stateless, backup de configuração:

```bash
# Backup de configs
tar czf backup-$(date +%Y%m%d).tar.gz \
  docker-compose*.yml \
  nginx.conf \
  Dockerfile \
  .env.example
```

## 💾 Otimização de Storage

### Limpar Recursos Antigos

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não usadas
docker image prune -a -f

# Remover volumes órfãos
docker volume prune -f

# Limpeza completa (cuidado!)
docker system prune -a --volumes -f
```

### Cache de Layers

O Docker cacheia layers do build:
- ✅ COPY package.json antes do código
- ✅ Instale deps antes de copiar source
- ✅ Use .dockerignore agressivamente

## 🧪 Testes

### Teste Local Antes de Deploy

```bash
# Script de teste completo
./scripts/test-docker.sh

# Testes manuais
docker-compose up -d
curl http://localhost:3000/health
curl http://localhost:3000/
```

### Load Testing

```bash
# Instalar apache bench
brew install httpd

# Teste de carga
ab -n 1000 -c 10 http://localhost:3000/

# Com autocannon (mais moderno)
npx autocannon -c 10 -d 10 http://localhost:3000/
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
deploy:
  replicas: 3
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
```

### Vertical Scaling

```yaml
# Aumentar recursos por container
resources:
  limits:
    cpus: '1.0'
    memory: 512M
```

## 🎓 Recursos de Aprendizado

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NGINX Optimization](https://www.nginx.com/blog/tuning-nginx/)
- [12 Factor App](https://12factor.net/)
- [Container Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

## ✅ Checklist de Review

Antes de fazer deploy em produção:

- [ ] Multi-stage build implementado
- [ ] .dockerignore configurado
- [ ] Health checks funcionando
- [ ] HTTPS habilitado
- [ ] Secrets não commitados
- [ ] Logs configurados
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] Rollback testado
- [ ] Load testing realizado
- [ ] Security headers configurados
- [ ] CDN configurado (opcional)
- [ ] Documentação atualizada
