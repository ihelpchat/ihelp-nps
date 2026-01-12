import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface NPSFilters {
  profile: string;
  url: string;
  category: string;
  campaignId?: string;
}

interface NPSFiltersProps {
  filters: NPSFilters;
  onFiltersChange: (filters: NPSFilters) => void;
  onClearFilters: () => void;
  campaignOptions?: {
    id: string;
    name: string;
    is_active: boolean;
    start_date?: string | null;
    end_date?: string | null;
  }[];
}

const NPSFiltersComponent: React.FC<NPSFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  campaignOptions = [],
}) => {
  const handleInputChange = (field: keyof NPSFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters =
    filters.profile ||
    (filters.url && filters.url.length >= 3) ||
    filters.category ||
    filters.campaignId;

  const selectedCampaign = campaignOptions.find((c) => c.id === filters.campaignId);
  const campaignLabel =
    filters.campaignId === 'none'
      ? 'Sem campanha'
      : selectedCampaign
      ? selectedCampaign.name
      : undefined;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Filter className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Filtros avançados</h2>
            <p className="text-sm text-gray-500">Refine por perfil, campanha ou URL</p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Filtro por Campanha */}
        <div className="col-span-1">
          <label htmlFor="campaign-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Campanha NPS
          </label>
          <select
            id="campaign-filter"
            value={filters.campaignId || ''}
            onChange={(e) => handleInputChange('campaignId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as campanhas</option>
            <option value="none">Sem campanha (respostas não vinculadas)</option>
            {campaignOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.is_active ? '' : '(inativa)'}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Perfil */}
        <div>
          <label htmlFor="profile-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Perfil
          </label>
          <select
            id="profile-filter"
            value={filters.profile}
            onChange={(e) => handleInputChange('profile', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os perfis</option>
            <option value="1">ADM (Perfil 1)</option>
            <option value="2">ATD (Perfil 2)</option>
          </select>
        </div>

        {/* Filtro por URL */}
        <div>
          <label htmlFor="url-filter" className="block text-sm font-medium text-gray-700 mb-2">
            URL (contém)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="url-filter"
              type="text"
              placeholder="Mínimo 3 caracteres..."
              value={filters.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {filters.url.length > 0 && filters.url.length < 3 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">{3 - filters.url.length} mais</span>
              </div>
            )}
          </div>
          {filters.url.length > 0 && filters.url.length < 3 && (
            <p className="text-xs text-gray-500 mt-1">
              Digite pelo menos 3 caracteres para buscar
            </p>
          )}
        </div>

        {/* Filtro por Categoria */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as categorias</option>
            <option value="promoters">Promotores (9-10)</option>
            <option value="passives">Neutros (7-8)</option>
            <option value="detractors">Detratores (0-6)</option>
          </select>
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {filters.campaignId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Campanha: {campaignLabel || 'Selecionada'}
              </span>
            )}
            {filters.profile && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Perfil: {filters.profile === '1' ? 'ADM' : 'ATD'}
              </span>
            )}
            {filters.url && filters.url.length >= 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                URL: {filters.url}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Categoria: {filters.category === 'promoters' ? 'Promotores' : 
                           filters.category === 'passives' ? 'Neutros' : 'Detratores'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NPSFiltersComponent;
