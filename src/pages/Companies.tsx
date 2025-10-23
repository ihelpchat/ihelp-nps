import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Building2, Activity, Users, MessageSquare, Filter, ArrowDownWideNarrow, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

type BusinessSummary = {
  id: string;
  displayName: string;
  feedbacks: NPSFeedback[];
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  comments: number;
  averageScore: number;
  nps: number;
  lastFeedbackAt: string | null;
};

type TrendPoint = {
  period: string;
  label: string;
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
};

type CategoryDistribution = {
  promoters: number;
  passives: number;
  detractors: number;
  promotersPercentage: number;
  passivesPercentage: number;
  detractorsPercentage: number;
};

const calculateNPS = (data: NPSFeedback[]) => {
  if (!data?.length) return 0;
  const promoters = data.filter(f => f.score >= 9).length;
  const detractors = data.filter(f => f.score <= 6).length;
  const total = data.length;
  return Math.round(((promoters - detractors) / total) * 100);
};

const getCategoryDistribution = (data: NPSFeedback[]): CategoryDistribution => {
  if (!data?.length) {
    return {
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercentage: 0,
      passivesPercentage: 0,
      detractorsPercentage: 0
    };
  }
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

const getTrendData = (feedbacks: NPSFeedback[]): TrendPoint[] => {
  if (!feedbacks?.length) return [];
  const buckets = new Map<string, NPSFeedback[]>();
  feedbacks.forEach(item => {
    const key = format(new Date(item.created_at), 'yyyy-MM');
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key)!.push(item);
  });
  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, items]) => {
      const baseDate = new Date(`${period}-01T00:00:00`);
      return {
        period,
        label: format(baseDate, 'MMM yyyy'),
        nps: calculateNPS(items),
        promoters: items.filter(f => f.score >= 9).length,
        passives: items.filter(f => f.score >= 7 && f.score <= 8).length,
        detractors: items.filter(f => f.score <= 6).length,
        total: items.length
      };
    });
};

const formatBusinessName = (id: string) => {
  if (!id) return 'Sem identificação';
  return id;
};

const Companies = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [minResponses, setMinResponses] = React.useState(0);
  const [scoreFilter, setScoreFilter] = React.useState<'all' | 'negative' | 'neutral' | 'positive'>('all');
  const [sortOrder, setSortOrder] = React.useState<'npsAsc' | 'npsDesc' | 'responsesDesc'>('npsAsc');
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(null);

  const { data: feedbacks, isLoading, error } = useQuery({
    queryKey: ['nps-feedback', 'companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nps_feedback')
        .select('id, score, feedback, created_at, business_id, profile, category, website, email, user_id, session_id, url')
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return (data || []) as NPSFeedback[];
    }
  });

  const businessSummaries = React.useMemo(() => {
    if (!feedbacks) return [];
    const map = new Map<string, BusinessSummary & { sumScores: number }>();
    feedbacks.forEach(feedback => {
      if (!feedback.business_id) {
        return;
      }
      if (!map.has(feedback.business_id)) {
        map.set(feedback.business_id, {
          id: feedback.business_id,
          displayName: formatBusinessName(feedback.business_id),
          feedbacks: [],
          totalResponses: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          comments: 0,
          averageScore: 0,
          nps: 0,
          lastFeedbackAt: null,
          sumScores: 0
        });
      }
      const entry = map.get(feedback.business_id)!;
      entry.feedbacks.push(feedback);
      entry.totalResponses += 1;
      entry.sumScores += feedback.score;
      if (feedback.score >= 9) {
        entry.promoters += 1;
      } else if (feedback.score >= 7) {
        entry.passives += 1;
      } else {
        entry.detractors += 1;
      }
      if (feedback.feedback && feedback.feedback.trim() !== '') {
        entry.comments += 1;
      }
      if (!entry.lastFeedbackAt || new Date(feedback.created_at) > new Date(entry.lastFeedbackAt)) {
        entry.lastFeedbackAt = feedback.created_at;
      }
    });
    return Array.from(map.values()).map(entry => ({
      id: entry.id,
      displayName: entry.displayName,
      feedbacks: entry.feedbacks,
      totalResponses: entry.totalResponses,
      promoters: entry.promoters,
      passives: entry.passives,
      detractors: entry.detractors,
      comments: entry.comments,
      averageScore: entry.totalResponses > 0 ? entry.sumScores / entry.totalResponses : 0,
      nps: calculateNPS(entry.feedbacks),
      lastFeedbackAt: entry.lastFeedbackAt
    }));
  }, [feedbacks]);

  const filteredBusinesses = React.useMemo(() => {
    return businessSummaries.filter(business => {
      if (searchTerm && !business.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (minResponses > 0 && business.totalResponses < minResponses) {
        return false;
      }
      if (scoreFilter === 'negative' && business.nps >= 0) {
        return false;
      }
      if (scoreFilter === 'neutral' && (business.nps < 0 || business.nps > 50)) {
        return false;
      }
      if (scoreFilter === 'positive' && business.nps <= 50) {
        return false;
      }
      return true;
    });
  }, [businessSummaries, searchTerm, minResponses, scoreFilter]);

  const sortedBusinesses = React.useMemo(() => {
    const data = [...filteredBusinesses];
    if (sortOrder === 'npsAsc') {
      data.sort((a, b) => a.nps - b.nps);
    } else if (sortOrder === 'npsDesc') {
      data.sort((a, b) => b.nps - a.nps);
    } else if (sortOrder === 'responsesDesc') {
      data.sort((a, b) => b.totalResponses - a.totalResponses);
    }
    return data;
  }, [filteredBusinesses, sortOrder]);

  React.useEffect(() => {
    if (!selectedBusinessId && sortedBusinesses.length > 0) {
      setSelectedBusinessId(sortedBusinesses[0].id);
      return;
    }
    if (selectedBusinessId && !sortedBusinesses.some(item => item.id === selectedBusinessId)) {
      setSelectedBusinessId(sortedBusinesses.length > 0 ? sortedBusinesses[0].id : null);
    }
  }, [sortedBusinesses, selectedBusinessId]);

  const selectedBusiness = React.useMemo(() => {
    if (!selectedBusinessId) {
      return null;
    }
    return sortedBusinesses.find(item => item.id === selectedBusinessId) || null;
  }, [sortedBusinesses, selectedBusinessId]);

  const trendData = React.useMemo(() => {
    if (!selectedBusiness) return [];
    return getTrendData(selectedBusiness.feedbacks);
  }, [selectedBusiness]);

  const categoryDistribution = React.useMemo(() => {
    if (!selectedBusiness) {
      return {
        promoters: 0,
        passives: 0,
        detractors: 0,
        promotersPercentage: 0,
        passivesPercentage: 0,
        detractorsPercentage: 0
      };
    }
    return getCategoryDistribution(selectedBusiness.feedbacks);
  }, [selectedBusiness]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link
              to="/"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                location.pathname === '/' ? 'text-white bg-primary' : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <Activity className="mr-3 h-5 w-5 flex-shrink-0" />
              Dashboard
            </Link>
            <Link
              to="/empresas"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                location.pathname === '/empresas' ? 'text-white bg-primary' : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <Building2 className="mr-3 h-5 w-5 flex-shrink-0" />
              Empresas
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary rounded-md group"
            >
              <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="ml-64 p-8 mt-16 mr-8">
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                  <Filter className="h-5 w-5 text-primary-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar empresa</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                        className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Nome ou ID"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo de respostas</label>
                    <input
                      type="number"
                      min={0}
                      value={minResponses}
                      onChange={event => setMinResponses(Number(event.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faixa de NPS</label>
                    <select
                      value={scoreFilter}
                      onChange={event => setScoreFilter(event.target.value as typeof scoreFilter)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="all">Todos</option>
                      <option value="negative">Abaixo de 0</option>
                      <option value="neutral">Entre 0 e 50</option>
                      <option value="positive">Acima de 50</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação</label>
                    <div className="flex items-center gap-2">
                      <ArrowDownWideNarrow className="h-5 w-5 text-primary-600" />
                      <select
                        value={sortOrder}
                        onChange={event => setSortOrder(event.target.value as typeof sortOrder)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="npsAsc">Menor NPS primeiro</option>
                        <option value="npsDesc">Maior NPS primeiro</option>
                        <option value="responsesDesc">Mais respostas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Empresas</h2>
                  <span className="text-sm text-gray-500">{sortedBusinesses.length} resultados</span>
                </div>
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
                  {sortedBusinesses.map(business => (
                    <button
                      key={business.id}
                      onClick={() => setSelectedBusinessId(business.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedBusinessId === business.id
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-primary hover:bg-primary-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{business.displayName}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            business.nps >= 50
                              ? 'bg-green-100 text-green-800'
                              : business.nps <= 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          NPS {business.nps}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{business.totalResponses} respostas</span>
                        <span>
                          Último feedback{' '}
                          {business.lastFeedbackAt ? format(new Date(business.lastFeedbackAt), 'dd/MM/yyyy') : 'n/d'}
                        </span>
                      </div>
                    </button>
                  ))}
                  {sortedBusinesses.length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-6">Nenhuma empresa encontrada</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {selectedBusiness ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedBusiness.displayName}</h2>
                        <p className="text-sm text-gray-500">
                          Último feedback{' '}
                          {selectedBusiness.lastFeedbackAt
                            ? format(new Date(selectedBusiness.lastFeedbackAt), 'dd/MM/yyyy HH:mm')
                            : 'n/d'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-50 rounded-md">
                          <Building2 className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NPS</span>
                          <Activity className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="text-3xl font-bold text-primary">{selectedBusiness.nps}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Respostas</span>
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="text-3xl font-bold text-primary">{selectedBusiness.totalResponses}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Média</span>
                          <Activity className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="text-3xl font-bold text-primary">{selectedBusiness.averageScore.toFixed(1)}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Comentários</span>
                          <MessageSquare className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="text-3xl font-bold text-primary">{selectedBusiness.comments}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">Detratores 🔴</span>
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {categoryDistribution.detractorsPercentage}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-red-600">{categoryDistribution.detractors}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-700">Neutros 🟡</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          {categoryDistribution.passivesPercentage}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">{categoryDistribution.passives}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Promotores 🟢</span>
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {categoryDistribution.promotersPercentage}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-green-600">{categoryDistribution.promoters}</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Histórico de NPS</h3>
                    </div>
                    {trendData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                              contentStyle={{ borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
                              formatter={(value: number) => value.toString()}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="nps" stroke="#ea5f3d" strokeWidth={2} dot={true} name="NPS" />
                            <Line type="monotone" dataKey="promoters" stroke="#16a34a" strokeWidth={2} dot={false} name="Promotores" />
                            <Line type="monotone" dataKey="detractors" stroke="#dc2626" strokeWidth={2} dot={false} name="Detratores" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-12">Sem dados suficientes para gerar o histórico</div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Feedbacks recentes</h3>
                      <span className="text-sm text-gray-500">{selectedBusiness.feedbacks.length} registros</span>
                    </div>
                    {selectedBusiness.feedbacks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Score
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoria
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Feedback
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Perfil
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedBusiness.feedbacks
                              .slice()
                              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                              .slice(0, 20)
                              .map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.score}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.category || '-'}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                    {item.feedback ? item.feedback : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.profile || '-'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-12">Nenhum feedback disponível</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
                  Selecione uma empresa para visualizar os detalhes
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Companies;
