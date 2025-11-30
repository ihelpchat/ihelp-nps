import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface NPSFilters {
  profile: string;
  url: string;
  category: string;
}

interface NPSFiltersProps {
  filters: NPSFilters;
  onFiltersChange: (filters: NPSFilters) => void;
  onClearFilters: () => void;
}

const NPSFiltersComponent: React.FC<NPSFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleInputChange = (field: keyof NPSFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = filters.profile || (filters.url && filters.url.length >= 3) || filters.category;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-medium text-gray-900">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
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
