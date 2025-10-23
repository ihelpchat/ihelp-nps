# 🐳 Guia de Deploy com Docker

Este guia explica como fazer o build e deploy da aplicação iHelp NPS utilizando Docker.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 1.29 ou superior)
- Arquivo `.env` configurado com as credenciais do Supabase

## 🚀 Configuração Rápida

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 2. Build e Execução com Docker Compose

```bash
# Build e iniciar o container
docker-compose up -d --build

# Verificar logs
docker-compose logs -f

# Parar o container
docker-compose down
```

A aplicação estará disponível em: **http://localhost:3000**

## 🔧 Comandos Docker Úteis

### Build da Imagem

```bash
# Build da imagem manualmente
docker build -t ihelp-nps:latest \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua_chave_anon \
  .
```

### Executar Container

```bash
# Executar o container manualmente
docker run -d \
  --name ihelp-nps \
  -p 3000:80 \
  ihelp-nps:latest
```

### Gerenciamento de Containers

```bash
# Listar containers
docker ps

# Ver logs do container
docker logs ihelp-nps

# Parar container
docker stop ihelp-nps

# Remover container
docker rm ihelp-nps

# Remover imagem
docker rmi ihelp-nps:latest
```

## 🌐 Deploy em Produção

### Docker Registry

```bash
# Tag da imagem para registry
docker tag ihelp-nps:latest seu-registry.com/ihelp-nps:latest

# Push para registry
docker push seu-registry.com/ihelp-nps:latest
```

### Variáveis de Ambiente em Produção

Para ambientes de produção, recomenda-se usar secrets do Docker ou variáveis de ambiente do sistema:

```bash
docker run -d \
  --name ihelp-nps \
  -p 80:80 \
  -e VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  -e VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  ihelp-nps:latest
```

## 🏗️ Estrutura Docker

### Dockerfile Multi-Stage

O Dockerfile utiliza build multi-stage para otimizar o tamanho da imagem:

1. **Stage 1 (Builder)**: Instala dependências e faz build da aplicação
2. **Stage 2 (Production)**: Serve os arquivos estáticos com NGINX

### NGINX Configuration

O NGINX está configurado com:

- **Gzip compression** para otimizar transferência
- **Cache de assets estáticos** (1 ano)
- **Security headers**
- **SPA routing** (redireciona para index.html)
- **Health check endpoint** em `/health`

## 🔍 Health Check

A aplicação possui um health check configurado:

```bash
# Testar manualmente
curl http://localhost:3000/health
```

O Docker verifica automaticamente a saúde do container a cada 30 segundos.

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs ihelp-nps

# Inspecionar container
docker inspect ihelp-nps
```

### Problemas com variáveis de ambiente

```bash
# Verificar variáveis no container
docker exec ihelp-nps env

# Rebuild forçando sem cache
docker-compose build --no-cache
docker-compose up -d
```

### Porta já em uso

```bash
# Alterar porta no docker-compose.yml
# Trocar "3000:80" para "PORTA_DESEJADA:80"
ports:
  - "8080:80"
```

## 📦 Otimizações

### Tamanho da Imagem

A imagem final é otimizada e contém apenas:
- NGINX Alpine (imagem base pequena)
- Arquivos estáticos buildados
- Configuração NGINX customizada

Tamanho aproximado: **~20-30 MB**

### Build Cache

O `.dockerignore` está configurado para excluir arquivos desnecessários e acelerar o build.

## 🔐 Segurança

- **Nunca commite** o arquivo `.env` com credenciais reais
- Use `.env.example` como template
- Em produção, use secrets management (AWS Secrets, Docker Secrets, etc)
- Configure HTTPS em produção usando reverse proxy (Nginx, Traefik, etc)

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
