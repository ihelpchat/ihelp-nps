# Guia de Configuração para Clientes - iHelp NPS

## Overview

O iHelp NPS é uma solução completa de Net Promoter Score que pode ser facilmente customizada e implantada para diferentes clientes. Este guia mostra como configurar a aplicação com sua própria identidade visual e configurações.

## 🚀 Setup Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/sua-empresa/ihelp-nps.git
cd ihelp-nps
```

### 2. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.cliente
```

Edite o arquivo `.env.cliente` com suas configurações:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Configurações de Branding (White-label)
VITE_COMPANY_NAME=Nome da Sua Empresa
VITE_PRIMARY_COLOR=#3b82f6
VITE_SECONDARY_COLOR=#1e40af
VITE_COMPANY_LOGO=https://seusite.com/logo.png
VITE_COMPANY_FAVICON=https://seusite.com/favicon.ico

# Configurações de Layout
VITE_SHOW_LOGO=true
VITE_SHOW_COMPANY_NAME=true
VITE_SHOW_USER_AVATAR=true
VITE_SHOW_NOTIFICATIONS=true
VITE_SHOW_SEARCH=true

# Configurações de Funcionalidades
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WIDGET_CONFIG=true
VITE_ENABLE_MULTI_COMPANY=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_WORD_CLOUD=true

# Mensagens Customizadas
VITE_WELCOME_MESSAGE=Bem-vindo ao seu dashboard NPS
VITE_DASHBOARD_TITLE=Dashboard NPS - Sua Empresa
VITE_FOOTER_MESSAGE=© 2024 Sua Empresa. Todos os direitos reservados.
```

### 3. Instale as Dependências

```bash
npm install
# ou
yarn install
```

### 4. Configure o Banco de Dados

Execute as migrações do Supabase:

```bash
# Acesse o painel do Supabase
# Vá para SQL Editor > New Query
# Execute o script em database/schema.sql
```

### 5. Inicie a Aplicação

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🎨 Personalização Visual

### Cores e Identidade Visual

As cores principais podem ser configuradas via variáveis de ambiente:

- `VITE_PRIMARY_COLOR`: Cor principal dos botões, links e elementos interativos
- `VITE_SECONDARY_COLOR`: Cor secundária para hover e estados

Exemplos de cores:
- Azul: `#3b82f6` (padrão)
- Verde: `#10b981`
- Roxo: `#8b5cf6`
- Vermelho: `#ef4444`

### Logo e Favicon

- `VITE_COMPANY_LOGO`: URL completa para o logo da empresa (recomendado: 200x50px)
- `VITE_COMPANY_FAVICON`: URL para o favicon (recomendado: 32x32px)

## ⚙️ Configurações de Funcionalidades

Você pode habilitar/desabilitar funcionalidades específicas:

| Funcionalade | Variável | Descrição |
|-------------|----------|-----------|
| Analytics | `VITE_ENABLE_ANALYTICS` | Habilita página de análises detalhadas |
| Widget Config | `VITE_ENABLE_WIDGET_CONFIG` | Permite configuração do widget NPS |
| Multi-company | `VITE_ENABLE_MULTI_COMPANY` | Suporte a múltiplas empresas |
| Export | `VITE_ENABLE_EXPORT` | Funcionalidade de exportar dados |
| Word Cloud | `VITE_ENABLE_WORD_CLOUD` | Nuvem de palavras no dashboard |

## 🐳 Deploy com Docker

### 1. Build da Imagem

```bash
docker build -t ihelp-nps-cliente .
```

### 2. Docker Compose

Crie um arquivo `docker-compose.cliente.yml`:

```yaml
version: '3.8'

services:
  app:
    image: ihelp-nps-cliente
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_COMPANY_NAME=${VITE_COMPANY_NAME}
      - VITE_PRIMARY_COLOR=${VITE_PRIMARY_COLOR}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 3. Execute o Deploy

```bash
docker-compose -f docker-compose.cliente.yml up -d
```

## 🔧 Configuração do Widget

O widget NPS pode ser facilmente integrado em qualquer site:

### 1. Build do Widget

```bash
npm run build:widget
```

### 2. Integração HTML

Adicione ao seu site:

```html
<script src="https://seu-dominio.com/nps-widget.js"></script>
<script>
  initNPSWidget({
    apiUrl: 'https://seu-projeto.supabase.co/rest/v1/nps_feedback',
    apiKey: 'sua-chave-api',
    primaryColor: '#3b82f6',
    userId: 'id-do-usuario',
    email: 'email@exemplo.com',
    businessId: 'id-da-empresa',
    profile: 'perfil-do-usuario',
    tags: ['website', 'homepage']
  });
</script>
```

## 📊 Estrutura do Banco de Dados

### Tabela Principal

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

### Índices Recomendados

```sql
CREATE INDEX idx_nps_feedback_business_id ON nps_feedback(business_id);
CREATE INDEX idx_nps_feedback_created_at ON nps_feedback(created_at);
CREATE INDEX idx_nps_feedback_score ON nps_feedback(score);
```

## 🔐 Segurança

### Configurações Recomendadas

1. **RLS (Row Level Security)**: Habilite no Supabase
2. **API Keys**: Use chaves de API restritas
3. **CORS**: Configure domínios permitidos
4. **HTTPS**: Sempre use em produção

### Exemplo de Política RLS

```sql
-- Apenas usuários autenticados podem ver dados da própria empresa
CREATE POLICY "Users can view their company data" ON nps_feedback
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    business_id = current_setting('app.current_business_id', true)
  );
```

## 🚀 Performance e Monitoramento

### Métricas Importantes

- Tempo de carregamento do dashboard
- Taxa de resposta do widget
- Uso de memória e CPU
- Latência das consultas ao Supabase

### Ferramentas Sugeridas

- **Vercel Analytics**: Para monitoramento de performance
- **Supabase Dashboard**: Para métricas do banco
- **Sentry**: Para error tracking

## 📞 Suporte

### Recursos Disponíveis

- 📖 [Documentação Completa](./README.md)
- 🐳 [Guia Docker](./DOCKER.md)
- 🔧 [API Reference](./API.md)
- 🎨 [Guia de Customização](./CUSTOMIZATION.md)

### Contato

- Email: suporte@ihelp.com.br
- Discord: [Link do servidor]
- Documentation: [Link da docs]

## 🔄 Atualizações

### Versão Automática

Para manter sua instância atualizada:

```bash
git pull origin main
npm install
npm run build
docker-compose up -d --build
```

### Backup de Dados

```bash
# Export do Supabase
pg_dump sua_url_supabase > backup_$(date +%Y%m%d).sql
```

---

## ✅ Checklist de Implantação

- [ ] Configurar variáveis de ambiente
- [ ] Setup do banco de dados Supabase
- [ ] Configurar branding (cores, logo)
- [ ] Habilitar funcionalidades desejadas
- [ ] Configurar políticas de segurança (RLS)
- [ ] Testar widget NPS
- [ ] Configurar monitoramento
- [ ] Setup de backup automático
- [ ] Documentar acesso administrativo
- [ ] Treinar equipe cliente

Parabéns! 🎉 Sua instância do iHelp NPS está pronta para uso.
