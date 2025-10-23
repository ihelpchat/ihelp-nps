#!/bin/bash

# Script para testar o build Docker localmente
# Uso: ./scripts/test-docker.sh

set -e

echo "🧪 Testando build Docker do iHelp NPS..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Copie .env.example para .env e configure as variáveis"
    exit 1
fi

# Carregar variáveis do .env
source .env

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Variáveis de ambiente carregadas"
echo ""

# Build da imagem
echo "📦 Fazendo build da imagem..."
docker build -t ihelp-nps:test \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build concluído com sucesso!"
else
    echo -e "${RED}❌ Build falhou!${NC}"
    exit 1
fi
echo ""

# Verificar tamanho da imagem
echo "📊 Tamanho da imagem:"
docker images ihelp-nps:test --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""

# Iniciar container de teste
echo "🚀 Iniciando container de teste na porta 3001..."
docker run -d --name ihelp-nps-test -p 3001:80 ihelp-nps:test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Container iniciado!"
else
    echo -e "${RED}❌ Falha ao iniciar container!${NC}"
    exit 1
fi
echo ""

# Aguardar container iniciar
echo "⏳ Aguardando container inicializar (10s)..."
sleep 10

# Testar health check
echo "🏥 Testando health check..."
if curl -f http://localhost:3001/health &> /dev/null; then
    echo -e "${GREEN}✓${NC} Health check OK!"
else
    echo -e "${RED}❌ Health check falhou!${NC}"
    docker logs ihelp-nps-test
    docker stop ihelp-nps-test
    docker rm ihelp-nps-test
    exit 1
fi
echo ""

# Testar página principal
echo "🌐 Testando página principal..."
if curl -f http://localhost:3001/ &> /dev/null; then
    echo -e "${GREEN}✓${NC} Página principal carregou!"
else
    echo -e "${RED}❌ Página principal falhou!${NC}"
    docker logs ihelp-nps-test
    docker stop ihelp-nps-test
    docker rm ihelp-nps-test
    exit 1
fi
echo ""

# Verificar logs
echo "📋 Últimas linhas do log:"
docker logs --tail 5 ihelp-nps-test
echo ""

# Resumo
echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
echo ""
echo "Container de teste está rodando em: http://localhost:3001"
echo ""
echo "Para parar e remover o container de teste:"
echo "  docker stop ihelp-nps-test && docker rm ihelp-nps-test"
echo ""
echo "Para ver logs em tempo real:"
echo "  docker logs -f ihelp-nps-test"
