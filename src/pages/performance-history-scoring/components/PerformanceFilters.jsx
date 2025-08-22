import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PerformanceFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const dateRangeOptions = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: '3months', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Este ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const scoreRangeOptions = [
    { value: 'all', label: 'Todas as pontuações' },
    { value: '90-100', label: 'Ouro (90-100)' },
    { value: '75-89', label: 'Prata (75-89)' },
    { value: '60-74', label: 'Bronze (60-74)' },
    { value: '0-59', label: 'Iniciante (0-59)' }
  ];

  const performanceTypeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'solo', label: 'Solo' },
    { value: 'duet', label: 'Dueto' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Mais recentes primeiro' },
    { value: 'date-asc', label: 'Mais antigos primeiro' },
    { value: 'score-desc', label: 'Maior pontuação primeiro' },
    { value: 'score-asc', label: 'Menor pontuação primeiro' },
    { value: 'song-asc', label: 'Nome da música (A-Z)' },
    { value: 'artist-asc', label: 'Nome do artista (A-Z)' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value && value !== 'all' && value !== ''
  );

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center">
          <Icon name="Filter" size={18} className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
            iconSize={16}
          >
            Limpar
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <Select
          label="Período"
          options={dateRangeOptions}
          value={filters?.dateRange || 'all'}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />

        {/* Score Range Filter */}
        <Select
          label="Pontuação"
          options={scoreRangeOptions}
          value={filters?.scoreRange || 'all'}
          onChange={(value) => handleFilterChange('scoreRange', value)}
        />

        {/* Performance Type Filter */}
        <Select
          label="Tipo"
          options={performanceTypeOptions}
          value={filters?.performanceType || 'all'}
          onChange={(value) => handleFilterChange('performanceType', value)}
        />

        {/* Sort Options */}
        <Select
          label="Ordenar por"
          options={sortOptions}
          value={filters?.sortBy || 'date-desc'}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>
      {/* Custom Date Range */}
      {filters?.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <Input
            label="Data inicial"
            type="date"
            value={filters?.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
          />
          <Input
            label="Data final"
            type="date"
            value={filters?.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
          />
        </div>
      )}
      {/* Search by Song/Artist */}
      <div className="mt-4 pt-4 border-t border-border">
        <Input
          label="Buscar por música ou artista"
          type="search"
          placeholder="Digite o nome da música ou artista..."
          value={filters?.searchQuery || ''}
          onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default PerformanceFilters;