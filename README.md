# iHelp NPS

Um sistema de coleta e análise de Net Promoter Score (NPS) com dashboard para visualização de dados.

## Funcionalidades

### Widget NPS

O widget NPS é um componente leve e personalizável que pode ser incorporado em qualquer site para coletar feedback dos usuários.

#### Principais recursos:

- **Verificação de avaliação prévia**: O widget verifica no Supabase se o usuário já avaliou anteriormente e não exibe o widget novamente.
- **Exibição inteligente**: Se o usuário fechar o widget, ele será exibido novamente após 24 horas.
- **Suporte para tags**: Possibilidade de adicionar tags ao feedback para categorização e análise.
- **Personalização visual**: Cores, textos e comportamentos personalizáveis.
- **Responsivo**: Adaptado para dispositivos móveis e desktop.
- **Armazenamento seguro**: Dados enviados e armazenados no Supabase.

### Dashboard

O dashboard oferece visualizações detalhadas dos dados de NPS coletados.

#### Visualizações disponíveis:

- **Pontuação NPS**: Cálculo e exibição da pontuação NPS geral.
- **Distribuição por categoria**: Promotores, Neutros e Detratores.
- **Nuvem de palavras**: Visualização das palavras mais frequentes nos feedbacks.
- **Filtros**: Possibilidade de filtrar dados por categoria de NPS.

## Instalação e Uso

### Configuração do Widget

```html
<script src="nps-widget.js"></script>
<script>
  initNPSWidget({
    apiUrl: 'https://sua-url-supabase.supabase.co/rest/v1/nps_feedback',
    apiKey: 'sua-chave-api',
    primaryColor: '#ea5f3d',
    userId: 'id-do-usuario',
    email: 'email@exemplo.com',
    businessId: 'id-da-empresa',
    profile: 'perfil-do-usuario',
    tags: ['website', 'homepage']
  });
</script>
```

### Parâmetros de Configuração

| Parâmetro | Descrição | Tipo | Padrão |
|-----------|-----------|------|--------|
| `userId` | Identificador único do usuário | String | 'anonymous' |
| `email` | Email do usuário | String | null |
| `businessId` | Identificador da empresa | String | null |
| `profile` | Perfil do usuário | String | null |
| `tags` | Array de tags associadas ao feedback | Array | [] |
| `autoOpen` | Abrir automaticamente após 3 segundos | Boolean | true |
| `primaryColor` | Cor principal do widget | String | '#ea5f3d' |
| `darkMode` | Ativar modo escuro | Boolean | false |

## Estrutura do Banco de Dados

O sistema utiliza o Supabase como backend, com a seguinte estrutura principal:

```sql
CREATE TABLE nps_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  website TEXT,
  category TEXT,
  session_id TEXT NOT NULL,
  business_id TEXT,
  profile TEXT,
  email TEXT,
  url TEXT,
  tags TEXT[] DEFAULT '{}'
);
```

## Exemplos

Veja exemplos de uso do widget e do dashboard na pasta `examples/`.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build
```

## 🐳 Deploy com Docker

O projeto está totalmente configurado para rodar com Docker. Veja o guia completo em [DOCKER.md](./DOCKER.md).

### Quick Start

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 2. Deploy com script auxiliar (recomendado)
./docker-deploy.sh deploy

# 3. Ou com Docker Compose manualmente
docker-compose up -d --build
```

A aplicação estará disponível em **http://localhost:3000**

### Comandos úteis

```bash
# Ver logs
./docker-deploy.sh logs

# Verificar status
./docker-deploy.sh status

# Health check
./docker-deploy.sh health

# Parar aplicação
./docker-deploy.sh stop
```

Para deploy em produção, consulte [DOCKER.md](./DOCKER.md) para instruções detalhadas.
