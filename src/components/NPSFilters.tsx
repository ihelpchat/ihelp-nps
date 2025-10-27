import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { NPSFilters as NPSFiltersType } from '../types/nps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { Badge, Button, Input } from './ui';
import { cn } from '../lib/utils';

interface NPSFiltersProps {
  filters: NPSFiltersType;
  onFiltersChange: (filters: NPSFiltersType) => void;
  onClearFilters: () => void;
  className?: string;
  hideIndicators?: boolean;
}

const NPSFiltersComponent: React.FC<NPSFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  hideIndicators = false,
}) => {
  const handleInputChange = (field: keyof NPSFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = Boolean(
    filters.profile ||
    (filters.url && filters.url.length >= 3) ||
    filters.category
  );

  return (
    <Card className={cn('shadow-sm border border-gray-100', className)}>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Refine a visualização dos feedbacks conforme a necessidade.</CardDescription>
          </div>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-gray-600">
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="profile-filter" className="text-sm font-medium text-gray-700">
              Perfil
            </label>
            <select
              id="profile-filter"
              value={filters.profile}
              onChange={(e) => handleInputChange('profile', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os perfis</option>
              <option value="1">ADM (Perfil 1)</option>
              <option value="2">ATD (Perfil 2)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="url-filter" className="text-sm font-medium text-gray-700">
              URL (contém)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="url-filter"
                type="text"
                placeholder="Mínimo 3 caracteres..."
                value={filters.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="pl-9"
              />
              {filters.url.length > 0 && filters.url.length < 3 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {3 - filters.url.length} mais
                </span>
              )}
            </div>
            {filters.url.length > 0 && filters.url.length < 3 && (
              <p className="text-xs text-gray-500">
                Digite pelo menos 3 caracteres para realizar a busca.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              <option value="promoters">Promotores (9-10)</option>
              <option value="passives">Neutros (7-8)</option>
              <option value="detractors">Detratores (0-6)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && !hideIndicators && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {filters.profile && (
              <Badge variant="info" size="sm">
                Perfil: {filters.profile === '1' ? 'ADM' : 'ATD'}
              </Badge>
            )}
            {filters.url && filters.url.length >= 3 && (
              <Badge variant="success" size="sm">
                URL: {filters.url}
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" size="sm">
                Categoria: {filters.category === 'promoters' ? 'Promotores' : filters.category === 'passives' ? 'Neutros' : 'Detratores'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NPSFiltersComponent;
