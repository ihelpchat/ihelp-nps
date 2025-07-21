// Importação do React para usar hooks
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Download, BarChart3, Users, LogOut, MessageSquare, MessageCircle, Activity, Building, Headphones } from 'lucide-react';
import NPSFiltersComponent, { NPSFilters } from '../components/NPSFilters';
import useDebounce from '../hooks/useDebounce';

type NPSFeedback = {
  id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  website: string;
  category: string;
  business_id: string | null;
  profile: string | null;
  email: string | null;
  user_id: string;
  session_id: string;
  url: string | null;
};

// Interface para a palavra na nuvem
interface WordCloudItem {
  text: string;
  value: number;
}

function Dashboard() {
  // Estado para filtrar a nuvem de palavras por categoria
  const [wordCloudFilter, setWordCloudFilter] = React.useState<'promoters' | 'passives' | 'detractors' | undefined>(undefined);
  
  // Estados para os filtros
  const [filters, setFilters] = React.useState<NPSFilters>({
    profile: '',
    url: '',
    category: ''
  });
  
  // Estado separado para o input da URL (sem debounce)
  const [urlInput, setUrlInput] = React.useState('');
  
  // Debounce da URL com delay de 500ms
  const debouncedUrl = useDebounce(urlInput, 500);
  
  // Filtros efetivos que são usados na query
  const effectiveFilters = React.useMemo(() => ({
    ...filters,
    url: debouncedUrl.length >= 3 ? debouncedUrl : '' // Só aplica filtro se tiver 3 ou mais caracteres
  }), [filters, debouncedUrl]);
  const { data: feedbacks, isLoading, error } = useQuery({
    queryKey: ['nps-feedback', effectiveFilters],
    queryFn: async () => {
      let query = supabase
        .from('nps_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtro de perfil
      if (effectiveFilters.profile) {
        query = query.eq('profile', effectiveFilters.profile);
      }

      // Aplicar filtro de URL (ilike para busca case-insensitive que contém)
      if (effectiveFilters.url) {
        query = query.ilike('url', `%${effectiveFilters.url}%`);
      }

      const { data: nps_feedback, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados do NPS:', error);
        throw error;
      }
      
      let filteredData = nps_feedback as NPSFeedback[];
      
      // Aplicar filtro de categoria (feito no client-side)
      if (effectiveFilters.category) {
        switch (effectiveFilters.category) {
          case 'promoters':
            filteredData = filteredData.filter(f => f.score >= 9);
            break;
          case 'passives':
            filteredData = filteredData.filter(f => f.score >= 7 && f.score <= 8);
            break;
          case 'detractors':
            filteredData = filteredData.filter(f => f.score <= 6);
            break;
        }
      }
      
      console.log('Dados do NPS carregados:', filteredData);
      return filteredData;
    },
  });

  const calculateNPS = (data: NPSFeedback[]) => {
    if (!data?.length) return 0;
    
    const promoters = data.filter(f => f.score >= 9).length;
    const detractors = data.filter(f => f.score <= 6).length;
    const total = data.length;
    
    return Math.round(((promoters - detractors) / total) * 100);
  };

  // Funções para manipulação dos filtros
  const handleFiltersChange = (newFilters: NPSFilters) => {
    setFilters({
      profile: newFilters.profile,
      category: newFilters.category,
      url: newFilters.url // Este valor não é usado diretamente, mas mantemos por compatibilidade
    });
    // Atualizar o input da URL separadamente
    setUrlInput(newFilters.url);
  };

  const handleClearFilters = () => {
    setFilters({
      profile: '',
      url: '',
      category: ''
    });
    setUrlInput(''); // Limpar também o input da URL
  };
  
  const getScoreDistribution = (data: NPSFeedback[]) => {
    if (!data?.length) return [];
    
    const distribution = Array(11).fill(0);
    data.forEach(f => {
      if (f.score >= 0 && f.score <= 10) {
        distribution[f.score]++;
      }
    });
    
    return distribution.map((count, score) => ({
      score,
      count,
      percentage: Math.round((count / data.length) * 100)
    }));
  };
  
  // Interface para o objeto de negócio
  interface BusinessData {
    id: string;
    count: number;
    scores: number[];
  }

  const getBusinessDistribution = (data: NPSFeedback[]) => {
    if (!data?.length) return [];
    
    const businesses: Record<string, BusinessData> = {};
    data.forEach(f => {
      const businessId = f.business_id || 'unknown';
      if (!businesses[businessId]) {
        businesses[businessId] = {
          id: businessId,
          count: 0,
          scores: []
        };
      }
      businesses[businessId].count++;
      businesses[businessId].scores.push(f.score);
    });
    
    return Object.values(businesses).map(b => ({
      ...b,
      averageScore: b.scores.reduce((sum: number, score: number) => sum + score, 0) / b.scores.length,
      nps: calculateNPS(data.filter(f => f.business_id === b.id))
    }));
  };
  
  // Função para obter métricas específicas para ADM (profile = 1)
  const getAdmMetrics = (data: NPSFeedback[]) => {
    if (!data?.length) return {
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercentage: 0,
      passivesPercentage: 0,
      detractorsPercentage: 0,
      nps: 0,
      commentsCount: 0
    };
    
    const admData = data.filter(f => f.profile === '1');
    if (!admData.length) return {
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercentage: 0,
      passivesPercentage: 0,
      detractorsPercentage: 0,
      nps: 0,
      commentsCount: 0
    };
    
    const promoters = admData.filter(f => f.score >= 9).length;
    const passives = admData.filter(f => f.score >= 7 && f.score <= 8).length;
    const detractors = admData.filter(f => f.score <= 6).length;
    const commentsCount = admData.filter(f => f.feedback && f.feedback.trim() !== '').length;
    
    return {
      totalResponses: admData.length,
      promoters,
      passives,
      detractors,
      promotersPercentage: Math.round((promoters / admData.length) * 100),
      passivesPercentage: Math.round((passives / admData.length) * 100),
      detractorsPercentage: Math.round((detractors / admData.length) * 100),
      nps: Math.round(((promoters - detractors) / admData.length) * 100),
      commentsCount
    };
  };
  
  // Função para obter métricas específicas para ATD (profile = 2 ou 3)
  const getAtdMetrics = (data: NPSFeedback[]) => {
    if (!data?.length) return {
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercentage: 0,
      passivesPercentage: 0,
      detractorsPercentage: 0,
      nps: 0,
      commentsCount: 0
    };
    
    const atdData = data.filter(f => f.profile === '2' || f.profile === '3');
    if (!atdData.length) return {
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercentage: 0,
      passivesPercentage: 0,
      detractorsPercentage: 0,
      nps: 0,
      commentsCount: 0
    };
    
    const promoters = atdData.filter(f => f.score >= 9).length;
    const passives = atdData.filter(f => f.score >= 7 && f.score <= 8).length;
    const detractors = atdData.filter(f => f.score <= 6).length;
    const commentsCount = atdData.filter(f => f.feedback && f.feedback.trim() !== '').length;
    
    return {
      totalResponses: atdData.length,
      promoters,
      passives,
      detractors,
      promotersPercentage: Math.round((promoters / atdData.length) * 100),
      passivesPercentage: Math.round((passives / atdData.length) * 100),
      detractorsPercentage: Math.round((detractors / atdData.length) * 100),
      nps: Math.round(((promoters - detractors) / atdData.length) * 100),
      commentsCount
    };
  };
  
  // Função para categorizar comentários do ADM
  const categorizeAdmComments = (data: NPSFeedback[]) => {
    if (!data?.length) return {
      bugNaPlataforma: 0,
      elogiado: 0,
      instabilidadeTravaOscilacao: 0,
      lentidao: 0,
      melhoriasSuporte: 0,
      neutroNaoEntendido: 0,
      podeMelhorarOuFaltaAlgo: 0
    };
    
    const admData = data.filter(f => f.profile === '1' && f.feedback && f.feedback.trim() !== '');
    if (!admData.length) return {
      bugNaPlataforma: 0,
      elogiado: 0,
      instabilidadeTravaOscilacao: 0,
      lentidao: 0,
      melhoriasSuporte: 0,
      neutroNaoEntendido: 0,
      podeMelhorarOuFaltaAlgo: 0
    };
    
    // Palavras-chave para cada categoria
    const keywords = {
      bugNaPlataforma: ['bug', 'erro', 'falha', 'problema', 'não funciona'],
      elogiado: ['bom', 'ótimo', 'excelente', 'parabéns', 'gosto', 'gostei', 'maravilhoso', 'perfeito'],
      instabilidadeTravaOscilacao: ['instável', 'instabilidade', 'trava', 'travando', 'oscila', 'oscilação', 'cai', 'caindo'],
      lentidao: ['lento', 'lentidão', 'devagar', 'demorado', 'demora'],
      melhoriasSuporte: ['suporte', 'atendimento', 'ajuda', 'melhorar', 'assistência'],
      neutroNaoEntendido: ['não entendi', 'não compreendi', 'confuso', 'confusão', 'não sei'],
      podeMelhorarOuFaltaAlgo: ['pode melhorar', 'falta', 'precisa', 'adicionar', 'incluir', 'implementar']
    };
    
    const categories = {
      bugNaPlataforma: 0,
      elogiado: 0,
      instabilidadeTravaOscilacao: 0,
      lentidao: 0,
      melhoriasSuporte: 0,
      neutroNaoEntendido: 0,
      podeMelhorarOuFaltaAlgo: 0
    };
    
    admData.forEach(feedback => {
      const text = feedback.feedback?.toLowerCase() || '';
      
      // Verificar cada categoria
      let categorized = false;
      
      for (const [category, terms] of Object.entries(keywords)) {
        for (const term of terms) {
          if (text.includes(term)) {
            categories[category as keyof typeof categories]++;
            categorized = true;
            break;
          }
        }
        if (categorized) break;
      }
      
      // Se não foi categorizado em nenhuma categoria específica
      if (!categorized) {
        // Verificar se é um comentário positivo (promoter)
        if (feedback.score >= 9) {
          categories.elogiado++;
        }
        // Verificar se é um comentário neutro (passive)
        else if (feedback.score >= 7 && feedback.score <= 8) {
          categories.neutroNaoEntendido++;
        }
        // Verificar se é um comentário negativo (detractor)
        else {
          categories.podeMelhorarOuFaltaAlgo++;
        }
      }
    });
    
    return categories;
  };
  
  const getCategoryDistribution = (data: NPSFeedback[]) => {
    if (!data?.length) return { promoters: 0, passives: 0, detractors: 0 };
    
    const promoters = data.filter(f => f.score >= 9).length;
    const passives = data.filter(f => f.score >= 7 && f.score <= 8).length;
    const detractors = data.filter(f => f.score <= 6).length;
    
    return {
      promoters,
      passives,
      detractors,
      promotersPercentage: Math.round((promoters / data.length) * 100),
      passivesPercentage: Math.round((passives / data.length) * 100),
      detractorsPercentage: Math.round((detractors / data.length) * 100)
    };
  };
  
  // Função para processar feedbacks e gerar dados para a nuvem de palavras
  const generateWordCloudData = (feedbacks: NPSFeedback[] = [], category?: string): WordCloudItem[] => {
    if (!feedbacks?.length) return [];
    
    // Filtrar por categoria se especificada (promoters, passives, detractors)
    let filteredFeedbacks = feedbacks;
    if (category === 'promoters') {
      filteredFeedbacks = feedbacks.filter(f => f.score >= 9);
    } else if (category === 'passives') {
      filteredFeedbacks = feedbacks.filter(f => f.score >= 7 && f.score <= 8);
    } else if (category === 'detractors') {
      filteredFeedbacks = feedbacks.filter(f => f.score <= 6);
    }
    
    // Verificar se há feedbacks com texto após a filtragem
    const feedbacksWithText = filteredFeedbacks.filter(f => f.feedback && f.feedback.trim() !== '');
    if (feedbacksWithText.length === 0) return [];
    
    // Concatenar todos os feedbacks em um único texto
    const allFeedbacks = filteredFeedbacks
      .filter(f => f.feedback && f.feedback.trim() !== '')
      .map(f => f.feedback as string)
      .join(' ');
    
    // Remover caracteres especiais e converter para minúsculas
    const cleanText = allFeedbacks.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\d+/g, '');
    
    // Dividir o texto em palavras
    const words = cleanText.split(/\s+/);
    
    // Palavras para ignorar (stopwords em português e inglês)
    const stopwords = [
      'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 
      'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi',
      'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito',
      'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso',
      'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem',
      'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num',
      'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia',
      'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas',
      'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas',
      'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas',
      'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo',
      'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram',
      'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'it', 'was', 'for', 'on', 'are',
      'as', 'with', 'they', 'be', 'at', 'this', 'have', 'from', 'or', 'had', 'by', 'but',
      'what', 'some', 'you', 'there', 'we', 'can', 'an', 'may', 'these', 'could', 'would'
    ];
    
    // Contar a frequência das palavras (excluindo stopwords)
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (word && word.length > 2 && !stopwords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Converter para o formato esperado pela nuvem de palavras
    return Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .filter(item => item.value > 1) // Filtrar palavras que aparecem apenas uma vez
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Limitar a 100 palavras mais frequentes
  };

  const exportToCSV = () => {
    if (!feedbacks) return;
    
    const csvContent = [
      ['Date', 'Score', 'Feedback', 'Website', 'Category', 'Business ID', 'Profile', 'Email', 'URL'].join(','),
      ...feedbacks.map(f => [
        format(new Date(f.created_at), 'yyyy-MM-dd HH:mm:ss'),
        f.score,
        `"${f.feedback || ''}"`,
        f.website,
        f.category,
        f.business_id || '',
        `"${f.profile || ''}"`,
        f.email || '',
        `"${f.url || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nps-feedback-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Erro ao carregar dados</div>
        <div className="text-sm text-gray-600">{(error as Error).message}</div>
      </div>
    );
  }

  const npsScore = calculateNPS(feedbacks || []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="px-6 pt-8 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-primary-600"
                >
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">iHelp NPS</h1>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <a
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium text-white bg-primary rounded-md group"
            >
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary rounded-md group"
            >
              <Users className="mr-3 h-5 w-5 flex-shrink-0" />
              Customers
            </a>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary rounded-md group"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8 mt-16 mr-8">
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">NPS Dashboard</h1>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </header>

        <main className="p-8">
          {/* Filtros */}
          <NPSFiltersComponent
            filters={{ ...filters, url: urlInput }} // Usar o urlInput para exibir o valor atual
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
          
          {/* NPS GERAL */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">NPS GERAL</h2>
              <div className="p-2 bg-primary-50 rounded-md">
                <Activity className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">NPS SCORE</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <BarChart3 className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{npsScore}</div>
                <p className="text-xs text-gray-500">Based on {feedbacks?.length || 0} responses</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">RESPOSTAS TOTAL</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{feedbacks?.length || 0}</div>
                <p className="text-xs text-gray-500">From all websites</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">COMENTÁRIOS TOTAL</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <MessageCircle className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{feedbacks?.filter(f => f.feedback && f.feedback.trim() !== '').length || 0}</div>
                <p className="text-xs text-gray-500">{feedbacks && feedbacks.length > 0 ? `${Math.round((feedbacks.filter(f => f.feedback && f.feedback.trim() !== '').length / feedbacks.length) * 100)}% response rate` : 'No comments yet'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-700">DETRATORES 🔴</h3>
                  <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {getCategoryDistribution(feedbacks || []).detractorsPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-red-600">{getCategoryDistribution(feedbacks || []).detractors}</div>
                <p className="text-xs text-red-500">Scores 0-6</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-yellow-700">NEUTROS 🟡</h3>
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {getCategoryDistribution(feedbacks || []).passivesPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{getCategoryDistribution(feedbacks || []).passives}</div>
                <p className="text-xs text-yellow-500">Scores 7-8</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-700">PROMOTORES 🟢</h3>
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {getCategoryDistribution(feedbacks || []).promotersPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">{getCategoryDistribution(feedbacks || []).promoters}</div>
                <p className="text-xs text-green-500">Scores 9-10</p>
              </div>
            </div>
          </div>
          
          {/* NPS ADM (1e2) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">NPS ADM (Profile 1)</h2>
              <div className="p-2 bg-primary-50 rounded-md">
                <Building className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">NPS SCORE</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <BarChart3 className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{getAdmMetrics(feedbacks || []).nps}</div>
                <p className="text-xs text-gray-500">Based on {getAdmMetrics(feedbacks || []).totalResponses} responses</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">TOTAL DE RESPOSTAS</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{getAdmMetrics(feedbacks || []).totalResponses}</div>
                <p className="text-xs text-gray-500">Profile 1</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-700">DETRATORES 🔴</h3>
                  <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {getAdmMetrics(feedbacks || []).detractorsPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-red-600">{getAdmMetrics(feedbacks || []).detractors}</div>
                <p className="text-xs text-red-500">Scores 0-6</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-yellow-700">NEUTROS 🟡</h3>
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {getAdmMetrics(feedbacks || []).passivesPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{getAdmMetrics(feedbacks || []).passives}</div>
                <p className="text-xs text-yellow-500">Scores 7-8</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-700">PROMOTORES 🟢</h3>
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {getAdmMetrics(feedbacks || []).promotersPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">{getAdmMetrics(feedbacks || []).promoters}</div>
                <p className="text-xs text-green-500">Scores 9-10</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">COMENTÁRIOS ADM</h3>
                <div className="p-1 bg-primary-50 rounded-md">
                  <MessageCircle className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{getAdmMetrics(feedbacks || []).commentsCount}</div>
              <p className="text-xs text-gray-500">{getAdmMetrics(feedbacks || []).totalResponses > 0 ? `${Math.round((getAdmMetrics(feedbacks || []).commentsCount / getAdmMetrics(feedbacks || []).totalResponses) * 100)}% response rate` : 'No comments yet'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Bug na Plataforma</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).bugNaPlataforma}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Elogiado</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).elogiado}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Instabilidade, Trava e Oscilação</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).instabilidadeTravaOscilacao}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Lentidão</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).lentidao}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Melhorias Suporte</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).melhoriasSuporte}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Neutro - Não entendido</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).neutroNaoEntendido}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Pode melhorar ou falta algo</h3>
                <div className="text-2xl font-bold text-gray-800">{categorizeAdmComments(feedbacks || []).podeMelhorarOuFaltaAlgo}</div>
              </div>
            </div>
          </div>
          
          {/* NPS ATD (3) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">NPS ATD (Profile 2 e 3)</h2>
              <div className="p-2 bg-primary-50 rounded-md">
                <Headphones className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">NPS SCORE</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <BarChart3 className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{getAtdMetrics(feedbacks || []).nps}</div>
                <p className="text-xs text-gray-500">Based on {getAtdMetrics(feedbacks || []).totalResponses} responses</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">RESPOSTAS</h3>
                  <div className="p-1 bg-primary-50 rounded-md">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{getAtdMetrics(feedbacks || []).totalResponses}</div>
                <p className="text-xs text-gray-500">Profile 2 e 3</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-700">DETRATORES 🔴</h3>
                  <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {getAtdMetrics(feedbacks || []).detractorsPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-red-600">{getAtdMetrics(feedbacks || []).detractors}</div>
                <p className="text-xs text-red-500">Scores 0-6</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-yellow-700">PASSIVOS 🟡</h3>
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {getAtdMetrics(feedbacks || []).passivesPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{getAtdMetrics(feedbacks || []).passives}</div>
                <p className="text-xs text-yellow-500">Scores 7-8</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-700">PROMOTORES 🟢</h3>
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {getAtdMetrics(feedbacks || []).promotersPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">{getAtdMetrics(feedbacks || []).promoters}</div>
                <p className="text-xs text-green-500">Scores 9-10</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">COMENTÁRIOS ATD</h3>
                <div className="p-1 bg-primary-50 rounded-md">
                  <MessageCircle className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{getAtdMetrics(feedbacks || []).commentsCount}</div>
              <p className="text-xs text-gray-500">{getAtdMetrics(feedbacks || []).totalResponses > 0 ? `${Math.round((getAtdMetrics(feedbacks || []).commentsCount / getAtdMetrics(feedbacks || []).totalResponses) * 100)}% response rate` : 'No comments yet'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">NPS Trend</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={feedbacks || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                      stroke="#9ca3af"
                    />
                    <YAxis domain={[0, 10]} stroke="#9ca3af" />
                    <Tooltip
                      labelFormatter={(date) => format(new Date(date), 'yyyy-MM-dd HH:mm')}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#ea5f3d" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#ea5f3d', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#ea5f3d', stroke: '#fbd0c7', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">NPS Distribution</h2>
              {feedbacks && (
                <div className="space-y-4">
                  {/* Promoters */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Promoters (9-10)</span>
                      <span className="text-sm font-medium text-green-600">
                        {getCategoryDistribution(feedbacks).promotersPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${getCategoryDistribution(feedbacks).promotersPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Passives */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Passives (7-8)</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {getCategoryDistribution(feedbacks).passivesPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${getCategoryDistribution(feedbacks).passivesPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Detractors */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Detractors (0-6)</span>
                      <span className="text-sm font-medium text-red-600">
                        {getCategoryDistribution(feedbacks).detractorsPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${getCategoryDistribution(feedbacks).detractorsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getScoreDistribution(feedbacks || [])}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="score" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value) => [`${value} responses`, 'Count']}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ea5f3d" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#ea5f3d', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#ea5f3d', stroke: '#fbd0c7', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Business Distribution Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Business Distribution</h2>
            {feedbacks && getBusinessDistribution(feedbacks).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responses
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NPS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getBusinessDistribution(feedbacks).map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              business.averageScore >= 9
                                ? 'bg-green-100 text-green-800'
                                : business.averageScore <= 6
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {business.averageScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              business.nps >= 50
                                ? 'bg-green-100 text-green-800'
                                : business.nps <= 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {business.nps}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No business data available
              </div>
            )}
          </div>

          {/* Word Cloud Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Feedback Word Cloud</h2>
              <div className="p-2 bg-primary-50 rounded-md">
                <MessageSquare className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            
            {/* Filtros para a nuvem de palavras */}
            <div className="flex flex-wrap gap-2 mb-4">
              <p className="text-sm text-gray-500 mr-2 self-center">Filtrar por:</p>
              <button 
                onClick={() => setWordCloudFilter(undefined)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${wordCloudFilter === undefined ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setWordCloudFilter('promoters')}
                className={`px-3 py-1 text-sm rounded-full transition-all ${wordCloudFilter === 'promoters' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                title="Clientes que deram notas 9 ou 10"
              >
                Promotores
              </button>
              <button 
                onClick={() => setWordCloudFilter('passives')}
                className={`px-3 py-1 text-sm rounded-full transition-all ${wordCloudFilter === 'passives' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                title="Clientes que deram notas 7 ou 8"
              >
                Neutros
              </button>
              <button 
                onClick={() => setWordCloudFilter('detractors')}
                className={`px-3 py-1 text-sm rounded-full transition-all ${wordCloudFilter === 'detractors' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                title="Clientes que deram notas de 0 a 6"
              >
                Detratores
              </button>
            </div>
            
            {feedbacks && feedbacks.length > 0 ? (
              <div className="h-[400px] w-full relative overflow-hidden">
                {(() => {
                  // Calcular os dados da nuvem de palavras uma única vez
                  const wordCloudData = generateWordCloudData(feedbacks, wordCloudFilter);
                  const maxValue = wordCloudData.length > 0 ? wordCloudData[0].value : 1;
                  const totalPalavras = wordCloudData.reduce((acc, item) => acc + item.value, 0);
                  
                  // Mostrar mensagem específica para cada filtro quando não há dados
                  if (wordCloudData.length === 0) {
                    let mensagem = 'Não há palavras suficientes nos feedbacks para gerar uma nuvem';
                    if (wordCloudFilter === 'promoters') {
                      mensagem = 'Não há feedbacks de promotores suficientes para gerar uma nuvem';
                    } else if (wordCloudFilter === 'passives') {
                      mensagem = 'Não há feedbacks de neutros suficientes para gerar uma nuvem';
                    } else if (wordCloudFilter === 'detractors') {
                      mensagem = 'Não há feedbacks de detratores suficientes para gerar uma nuvem';
                    }
                    return (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {mensagem}
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      <div className="text-center mb-4">
                        <span className="text-sm text-gray-500">
                          {wordCloudData.length} palavras únicas | {totalPalavras} ocorrências totais
                          {wordCloudFilter && ` | Filtro: ${wordCloudFilter === 'promoters' ? 'Promotores' : wordCloudFilter === 'passives' ? 'Neutros' : 'Detratores'}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 p-4">
                        {wordCloudData.map((word, index) => {
                          // Usar o índice e o texto como seed para gerar rotação consistente
                          const seed = word.text.charCodeAt(0) + index;
                          const rotation = (seed % 20) - 10; // Entre -10 e 10 graus
                          const margin = (seed % 5) + 2; // Entre 2 e 7px
                          
                          return (
                            <div 
                              key={index}
                              className={`px-3 py-1 rounded-full transition-all duration-300 hover:scale-110 cursor-default
                                ${wordCloudFilter === 'promoters' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 
                                  wordCloudFilter === 'passives' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 
                                  wordCloudFilter === 'detractors' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 
                                  'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                              style={{ 
                                fontSize: `${Math.min(14 + word.value * 2, 40)}px`,
                                opacity: 0.6 + (word.value / maxValue) * 0.4,
                                fontWeight: word.value > maxValue / 2 ? 'bold' : 'normal',
                                transform: `rotate(${rotation}deg)`,
                                margin: `${margin}px`
                              }}
                              title={`${word.text}: ${word.value} ocorrências`}
                            >
                              {word.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()} 
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                Nenhum feedback disponível
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Feedback Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks?.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(feedback.created_at), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            feedback.score >= 9
                              ? 'bg-green-100 text-green-800'
                              : feedback.score <= 6
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {feedback.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {feedback.feedback || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.website}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.business_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.profile || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.email || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;