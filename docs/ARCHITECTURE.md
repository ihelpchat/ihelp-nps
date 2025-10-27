# Arquitetura do iHelp NPS

## Overview

O iHelp NPS é uma aplicação web moderna construída com React, TypeScript e Supabase, seguindo princípios de arquitetura limpa e design systems para garantir escalabilidade e manutenibilidade.

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Button, Input, Card, etc.)
│   ├── layout/         # Componentes de layout (Header, Sidebar, Layout)
│   ├── charts/         # Componentes de visualização (NPSChart, WordCloud)
│   └── features/       # Componentes de negócio (NPSStats, NPSFilters)
├── pages/              # Páginas da aplicação (Dashboard, Login, Companies)
├── hooks/              # Hooks customizados (useDebounce, useAuth)
├── lib/                # Utilitários e configurações
│   ├── supabase.ts     # Cliente Supabase
│   └── utils.ts        # Funções utilitárias
├── config/             # Configurações da aplicação
│   └── branding.ts     # Sistema de white-label
├── types/              # Definições TypeScript
└── widgets/            # Código do widget NPS standalone
```

## 🎨 Design System

### Componentes UI

A aplicação utiliza um design system próprio baseado em:

- **TailwindCSS**: Para estilização utilitária
- **Lucide React**: Para ícones consistentes
- **Componentes Customizados**: Button, Input, Card, Badge com variants

### Tokens de Design

```typescript
// Cores primárias configuráveis via branding
--primary-color: #3b82f6;
--secondary-color: #1e40af;

// Escala de cores semânticas
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
```

## 🔄 Estado da Aplicação

### Gerenciamento de Estado

- **React Query**: Para cache e sincronização de dados do servidor
- **React Context**: Para estado global (autenticação, branding)
- **Local State**: Para estado de componentes específicos

### Exemplo de Hook de Dados

```typescript
const useNPSData = (filters: NPSFilters) => {
  return useQuery({
    queryKey: ['nps-data', filters],
    queryFn: () => fetchNPSData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

## 🗄️ Arquitetura de Dados

### Supabase Integration

- **Realtime**: Para atualizações ao vivo dos dados
- **RLS**: Row Level Security para multi-tenancy
- **Storage**: Para arquivos e imagens
- **Auth**: Para autenticação de usuários

### Schema do Banco

```sql
-- Tabela principal de feedbacks
CREATE TABLE nps_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  business_id TEXT NOT NULL,
  profile TEXT,
  email TEXT,
  url TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Tabela de empresas para multi-tenancy
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧩 Arquitetura de Componentes

### Container/Presentational Pattern

```typescript
// Container Component - Lógica de negócio
const NPSDashboardContainer: React.FC = () => {
  const { data, loading, error } = useNPSData();
  const [filters, setFilters] = useState<NPSFilters>({});
  
  return (
    <NPSDashboard 
      data={data}
      loading={loading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
};

// Presentational Component - Apenas UI
const NPSDashboard: React.FC<NPSDashboardProps> = ({ 
  data, 
  loading, 
  error, 
  filters, 
  onFiltersChange 
}) => {
  // Renderização pura, sem lógica de negócio
};
```

### Component Composition

```typescript
const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <NPSStats {...statsData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NPSChart data={chartData} />
        <DistributionChart data={distributionData} />
      </div>
      <WordCloud words={wordCloudData} />
    </div>
  );
};
```

## 🔧 Sistema de White-Label

### Configuração Dinâmica

O sistema de branding permite customização completa via variáveis de ambiente:

```typescript
interface BrandingConfig {
  company: {
    name: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  layout: {
    showLogo: boolean;
    showCompanyName: boolean;
    showUserAvatar: boolean;
  };
  features: {
    enableAnalytics: boolean;
    enableWidgetConfig: boolean;
    enableMultiCompany: boolean;
  };
}
```

### Aplicação de Temas

```typescript
// Aplicação dinâmica de CSS custom properties
export function applyBrandingStyles(config: BrandingConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', config.company.primaryColor);
  root.style.setProperty('--secondary-color', config.company.secondaryColor);
}
```

## 📱 Widget NPS Standalone

### Arquitetura do Widget

O widget é construído como um bundle independente:

```javascript
// nps-widget.js - Bundle standalone
(function(window) {
  'use strict';
  
  const NPSWidget = {
    init: function(config) {
      // Inicialização do widget
    },
    show: function() {
      // Exibir widget
    },
    hide: function() {
      // Esconder widget
    }
  };
  
  window.initNPSWidget = NPSWidget.init;
})(window);
```

### Features do Widget

- **Zero Dependencies**: Funciona em qualquer site
- **Customização Visual**: Cores, textos, comportamento
- **Smart Display**: Verifica avaliações prévias
- **Responsive**: Adaptado para mobile/desktop
- **Cross-domain**: Funciona em diferentes domínios

## 🔐 Segurança

### Autenticação e Autorização

```typescript
// Supabase Auth com RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Políticas RLS para multi-tenancy
CREATE POLICY "Company data access" ON nps_feedback
  FOR ALL USING (
    business_id = current_setting('app.current_business_id', true)
  );
```

### Validação de Dados

```typescript
// Validação de scores NPS
const validateNPSScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 10;
};

// Sanitização de feedbacks
const sanitizeFeedback = (feedback: string): string => {
  return feedback.trim().substring(0, 1000); // Limita a 1000 caracteres
};
```

## 🚀 Performance

### Otimizações Implementadas

1. **Code Splitting**: Rotas lazy-loaded
2. **Memoization**: React.memo e useMemo
3. **Debounce**: Para inputs de filtro
4. **Virtual Scrolling**: Para listas longas
5. **Image Optimization**: Lazy loading e WebP

### Exemplo de Otimização

```typescript
// Debounce para filtros de URL
const debouncedUrl = useDebounce(urlInput, 500);

// Memoização de componentes pesados
const ExpensiveChart = React.memo(({ data }) => {
  // Renderização do gráfico
});

// Virtual scrolling para tabelas
const VirtualizedTable = ({ items }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
};
```

## 📊 Monitoramento e Analytics

### Métricas Coletadas

- **Performance**: Core Web Vitals
- **User Behavior**: Eventos de clique, navegação
- **Error Tracking**: Exceções e falhas
- **API Performance**: Latência das requisições

### Implementação

```typescript
// Performance monitoring
const reportWebVitals = (metric) => {
  // Envia métricas para analytics service
};

// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Reporta erros para monitoring service
  }
}
```

## 🔄 CI/CD Pipeline

### Build Process

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - run: npm run build:widget
```

### Deploy Strategies

- **Blue-Green Deploy**: Para zero downtime
- **Canary Releases**: Para testes graduais
- **Rollback Automático**: Em caso de falhas

## 🔮 Escalabilidade

### Arquitetura Escalável

1. **Horizontal Scaling**: Múltiplas instâncias
2. **Database Scaling**: Read replicas e sharding
3. **CDN**: Para assets estáticos
4. **Caching**: Redis para cache de consultas

### Multi-Tenancy

```typescript
// Isolamento de dados por empresa
const getTenantData = async (businessId: string) => {
  const { data } = await supabase
    .from('nps_feedback')
    .select('*')
    .eq('business_id', businessId);
    
  return data;
};
```

## 🧪 Testes

### Estratégia de Testes

- **Unit Tests**: Componentes e utilitários
- **Integration Tests**: Fluxos de usuário
- **E2E Tests**: Funcionalidades críticas
- **Performance Tests**: Carga e estresse

```typescript
// Exemplo de teste unitário
describe('NPS Calculations', () => {
  test('should calculate NPS correctly', () => {
    const result = calculateNPS(30, 20, 10);
    expect(result).toBe(33);
  });
});

// Exemplo de teste de componente
test('renders NPS chart with data', () => {
  const mockData = [{ date: '2024-01-01', score: 50 }];
  render(<NPSChart data={mockData} />);
  expect(screen.getByText('Evolução do NPS')).toBeInTheDocument();
});
```

## 📚 Boas Práticas

### Código Limpo

- **SOLID Principles**: Para design orientado a objetos
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **Type Safety**: TypeScript rigoroso

### Documentação

- **Code Comments**: Para lógica complexa
- **README**: Para setup e desenvolvimento
- **API Docs**: Para endpoints e contratos
- **Architecture Docs**: Para decisões técnicas

---

Esta arquitetura foi desenhada para ser:

🏗️ **Modular**: Componentes reutilizáveis e desacoplados  
🎨 **Customizável**: Sistema de white-label completo  
🔒 **Segura**: Autenticação e autorização robustas  
🚀 **Performática**: Otimizada para escala  
📱 **Responsiva**: Funciona em todos os dispositivos  
🔧 **Maintenível**: Código limpo e bem documentado
