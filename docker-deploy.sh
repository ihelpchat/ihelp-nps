#!/bin/bash

# Script para deploy da aplicação iHelp NPS com Docker
# Uso: ./docker-deploy.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    print_success "Docker e Docker Compose detectados"
}

# Verificar arquivo .env
check_env() {
    if [ ! -f .env ]; then
        print_warning "Arquivo .env não encontrado!"
        print_info "Copiando .env.example para .env..."
        cp .env.example .env
        print_warning "Configure o arquivo .env com suas credenciais antes de continuar!"
        exit 1
    fi
    print_success "Arquivo .env encontrado"
}

# Build da aplicação
build() {
    print_info "Iniciando build da aplicação..."
    docker-compose build --no-cache
    print_success "Build concluído!"
}

# Iniciar aplicação
start() {
    print_info "Iniciando aplicação..."
    docker-compose up -d
    print_success "Aplicação iniciada!"
    print_info "Acesse: http://localhost:8080"
}

# Parar aplicação
stop() {
    print_info "Parando aplicação..."
    docker-compose down
    print_success "Aplicação parada!"
}

# Restart aplicação
restart() {
    print_info "Reiniciando aplicação..."
    docker-compose restart
    print_success "Aplicação reiniciada!"
}

# Ver logs
logs() {
    print_info "Exibindo logs (Ctrl+C para sair)..."
    docker-compose logs -f
}

# Status
status() {
    print_info "Status dos containers:"
    docker-compose ps
}

# Health check
health() {
    print_info "Verificando saúde da aplicação..."
    if curl -f http://localhost:8080/health &> /dev/null; then
        print_success "Aplicação está saudável!"
    else
        print_error "Aplicação não está respondendo!"
        exit 1
    fi
}

# Deploy completo
deploy() {
    check_docker
    check_env
    build
    stop
    start
    sleep 5
    health
    print_success "Deploy concluído com sucesso!"
}

# Limpar recursos
clean() {
    print_warning "Isso irá remover todos os containers, imagens e volumes!"
    read -p "Tem certeza? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Limpando recursos..."
        docker-compose down -v
        docker rmi ihelp-nps_ihelp-nps 2>/dev/null || true
        print_success "Recursos limpos!"
    else
        print_info "Operação cancelada"
    fi
}

# Menu de ajuda
help() {
    echo "🐳 Script de Deploy - iHelp NPS"
    echo ""
    echo "Uso: ./docker-deploy.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build      - Faz build da imagem Docker"
    echo "  start      - Inicia a aplicação"
    echo "  stop       - Para a aplicação"
    echo "  restart    - Reinicia a aplicação"
    echo "  logs       - Exibe logs em tempo real"
    echo "  status     - Mostra status dos containers"
    echo "  health     - Verifica saúde da aplicação"
    echo "  deploy     - Deploy completo (build + start)"
    echo "  clean      - Remove containers e imagens"
    echo "  help       - Exibe esta mensagem"
    echo ""
    echo "Exemplos:"
    echo "  ./docker-deploy.sh deploy    # Deploy completo"
    echo "  ./docker-deploy.sh logs      # Ver logs"
    echo "  ./docker-deploy.sh health    # Verificar saúde"
}

# Main
case "$1" in
    build)
        check_docker
        check_env
        build
        ;;
    start)
        check_docker
        check_env
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    health)
        health
        ;;
    deploy)
        deploy
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        help
        exit 1
        ;;
esac
