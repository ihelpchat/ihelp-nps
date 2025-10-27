# Estrutura do Projeto iHelp NPS

## 📁 Estrutura de Pastas

```
ihelp-nps/
├── 📁 docs/                          # Documentação
│   ├── CLIENT-SETUP.md              # Guia para clientes
│   ├── ARCHITECTURE.md               # Arquitetura técnica
│   ├── API.md                        # Referência da API
│   ├── CUSTOMIZATION.md              # Guia de customização
│   └── DEPLOYMENT.md                 # Guide de deploy
│
├── 📁 src/                           # Código fonte
│   ├── 📁 components/                # Componentes React
│   │   ├── 📁 ui/                   # Componentes base reutilizáveis
│   │   │   ├── Button.tsx           # Botão com variants
│   │   │   ├── Input.tsx            # Input com validação
│   │   │   ├── Card.tsx             # Card container
│   │   │   ├── Badge.tsx            # Badge colorido
│   │   │   └── index.ts             # Export centralizado
│   │   │
│   │   ├── 📁 layout/               # Componentes de layout
│   │   │   ├── Layout.tsx           # Layout principal
│   │   │   ├── Sidebar.tsx          # Menu lateral navegável
│   │   │   ├── Header.tsx           # Header com busca e notificações
│   │   │   └── index.ts             # Export centralizado
│   │   │
│   │   ├── 📁 charts/               # Componentes de visualização
│   │   │   ├── NPSChart.tsx         # Gráfico de linha NPS
│   │   │   ├── DistributionChart.tsx # Gráfico de barras distribuição
│   │   │   ├── WordCloud.tsx        # Nuvem de palavras
│   │   │   └── index.ts             # Export centralizado
│   │   │
│   │   └── 📁 features/             # Componentes de negócio
│   │       ├── 📁 NPSStats/         # Estatísticas NPS
│   │       │   ├── NPSStats.tsx     # Componente principal
│   │       │   └── index.ts         # Export
│   │       │
│   │       ├── 📁 NPSFilters/       # Filtros NPS (existente)
│   │       │   ├── NPSFilters.tsx   # Componente de filtros
│   │       │   └── index.ts         # Export
│   │       │
│   │       ├── 📁 NPSTable/         # Tabela de feedbacks
│   │       └── 📁 ExportButton/     # Botão de exportação
│   │
│   ├── 📁 pages/                     # Páginas da aplicação
│   │   ├── Dashboard.tsx            # Dashboard principal
│   │   ├── Login.tsx                # Página de login
│   │   ├── Companies.tsx            # Gestão de empresas
│   │   ├── Analytics.tsx            # Análises detalhadas
│   │   ├── Feedbacks.tsx            # Lista de feedbacks
│   │   ├── Widget.tsx               # Configuração do widget
│   │   └── Settings.tsx             # Configurações
│   │
│   ├── 📁 hooks/                     # Hooks customizados
│   │   ├── useDebounce.ts           # Hook para debounce
│   │   ├── useAuth.ts               # Hook de autenticação
│   │   ├── useNPSData.ts            # Hook para dados NPS
│   │   └── useBranding.ts           # Hook para branding
│   │
│   ├── 📁 lib/                       # Bibliotecas e utilitários
│   │   ├── supabase.ts              # Cliente Supabase
│   │   ├── utils.ts                 # Funções utilitárias
│   │   ├── validations.ts           # Validações de formulário
│   │   └── constants.ts             # Constantes da aplicação
│   │
│   ├── 📁 config/                    # Configurações
│   │   ├── branding.ts              # Sistema de white-label
│   │   ├── routes.ts                # Configuração de rotas
│   │   └── theme.ts                 # Configuração de tema
│   │
│   ├── 📁 types/                     # Tipos TypeScript
│   │   ├── nps.ts                   # Tipos relacionados a NPS
│   │   ├── auth.ts                  # Tipos de autenticação
│   │   ├── api.ts                   # Tipos da API
│   │   └── branding.ts              # Tipos de branding
│   │
│   ├── 📁 widgets/                   # Widget NPS standalone
│   │   ├── nps-widget.js            # Bundle principal
│   │   ├── nps-widget.css           # Estilos do widget
│   │   ├── nps-fix.js               # Polyfills e fixes
│   │   └── examples/                # Exemplos de uso
│   │       ├── teste-simples.html
│   │       ├── teste-widget.html
│   │       └── nps-widget-demo.html
│   │
│   ├── App.tsx                      # Componente principal
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts               # Tipos do Vite
│
├── 📁 public/                       # Arquivos estáticos
│   ├── index.html                   # HTML principal
│   ├── favicon.ico                  # Favicon padrão
│   └── manifest.json                # PWA manifest
│
├── 📁 deploy/                       # Scripts de deploy
│   ├── docker/                      # Configurações Docker
│   ├── nginx/                       # Configurações Nginx
│   └── scripts/                     # Scripts auxiliares
│
├── 📁 supabase/                     # Configurações Supabase
│   ├── migrations/                  # Migrações do banco
│   ├── functions/                   # Edge functions
│   └── seed.sql                     # Dados iniciais
│
├── 📁 examples/                     # Exemplos de uso
│   ├── basic-integration/           # Integração básica
│   ├── advanced-config/             # Configuração avançada
│   └── multi-tenant/               # Exemplo multi-tenant
│
├── 📁 scripts/                      # Scripts de desenvolvimento
│   ├── build.sh                     # Script de build
│   ├── deploy.sh                    # Script de deploy
│   └── test.sh                      # Script de testes
│
├── 📄 package.json                  # Dependências e scripts
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 vite.config.ts                # Configuração Vite
├── 📄 tailwind.config.js            # Configuração Tailwind
├── 📄 docker-compose.yml            # Docker Compose
├── 📄 Dockerfile                    # Docker image
├── 📄 .env.example                  # Variáveis de ambiente exemplo
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
└── 📄 README.md                     # Documentação principal
```

## 🏗️ Padrão Arquitetural

### 1. **Component-First Design**
- Componentes pequenos e reutilizáveis
- Composição sobre herança
- Props bem definidas com TypeScript

### 2. **Feature-Based Organization**
- Componentes agrupados por funcionalidade
- Cada feature tem seus próprios componentes
- Facilita manutenção e escalabilidade

### 3. **Separation of Concerns**
- **UI Components**: Apenas apresentação
- **Layout Components**: Estrutura e navegação
- **Feature Components**: Lógica de negócio
- **Pages**: Composição de componentes

### 4. **Configuration-Driven**
- White-label via variáveis de ambiente
- Configurações centralizadas
- Temas customizáveis

## 🔄 Fluxo de Dados

```
User Interaction
    ↓
Page Component
    ↓
Feature Components
    ↓
Custom Hooks (useNPSData, useAuth)
    ↓
Lib Layer (supabase, utils)
    ↓
External API (Supabase)
```

## 🎨 Design System Integration

```
Branding Config
    ↓
Theme Provider
    ↓
CSS Custom Properties
    ↓
UI Components (Button, Input, Card)
    ↓
Feature Components
    ↓
Pages
```

## 📱 Multi-Platform Support

### Web Application
- React + TypeScript
- Vite para build
- TailwindCSS para estilos

### Widget Standalone
- Vanilla JavaScript
- Zero dependencies
- Cross-domain compatibility

### Mobile (Futuro)
- React Native
- Componentes compartilhados
- API consistente

## 🔧 Development Workflow

### 1. **Feature Development**
```
src/components/features/[FeatureName]/
├── [FeatureName].tsx    # Componente principal
├── index.ts            # Export
└── types.ts            # Tipos específicos
```

### 2. **UI Component Development**
```
src/components/ui/[ComponentName].tsx
├── Componente com variants
├── Props interface
└── Storybook stories (futuro)
```

### 3. **Page Development**
```
src/pages/[PageName].tsx
├── Composição de features
├── Lógica de roteamento
└── Layout integration
```

## 📦 Build Process

### 1. **Main Application**
```bash
npm run build          # Build da aplicação web
npm run build:widget   # Build do widget standalone
```

### 2. **Output Structure**
```
dist/
├── assets/            # CSS, JS, imagens
├── widget/            # Arquivos do widget
│   ├── nps-widget.js
│   └── nps-widget.css
└── index.html         # Aplicação principal
```

## 🚀 Deploy Considerations

### 1. **Static Hosting**
- Vercel, Netlify, CloudFront
- CDN para assets globais
- Edge functions para API

### 2. **Container Deploy**
- Docker multi-stage
- Nginx para serving
- Environment variables

### 3. **Multi-Tenant**
- Subdomínios por cliente
- Configurações dinâmicas
- Isolamento de dados

## 🧪 Testing Strategy

### 1. **Unit Tests**
- Componentes UI
- Funções utilitárias
- Hooks customizados

### 2. **Integration Tests**
- Fluxos de usuário
- API integration
- Component composition

### 3. **E2E Tests**
- Playwright ou Cypress
- Funcionalidades críticas
- Multi-browser testing

---

Esta estrutura foi projetada para:

✅ **Escalabilidade**: Suporta múltiplos clientes e features  
✅ **Manutenibilidade**: Código organizado e documentado  
✅ **Customização**: White-label completo  
✅ **Performance**: Build otimizado e lazy loading  
✅ **Developer Experience**: Ferramentas modernas e fluxo claro
