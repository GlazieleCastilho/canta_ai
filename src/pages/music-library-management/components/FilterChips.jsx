import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll }) => {
  if (!activeFilters || activeFilters?.length === 0) {
    return null;
  }

  const getFilterIcon = (type) => {
    switch (type) {
      case 'genre':
        return 'Music';
      case 'language':
        return 'Globe';
      case 'difficulty':
        return 'Target';
      case 'recently_added':
        return 'Clock';
      case 'rating':
        return 'Star';
      default:
        return 'Filter';
    }
  };

  const getFilterLabel = (filter) => {
    switch (filter?.type) {
      case 'genre':
        return `Gênero: ${filter?.value}`;
      case 'language':
        return `Idioma: ${filter?.value}`;
      case 'difficulty':
        return `Dificuldade: ${filter?.value}`;
      case 'recently_added':
        return 'Adicionadas recentemente';
      case 'rating':
        return `Avaliação: ${filter?.value}+ estrelas`;
      default:
        return filter?.value;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto">
      <div className="flex items-center space-x-2 min-w-0">
        <Icon name="Filter" size={16} className="text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Filtros ativos:
        </span>
      </div>
      <div className="flex items-center space-x-2 min-w-0">
        {activeFilters?.map((filter, index) => (
          <div
            key={`${filter?.type}-${filter?.value}-${index}`}
            className="flex items-center space-x-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-sm whitespace-nowrap"
          >
            <Icon name={getFilterIcon(filter?.type)} size={12} />
            <span className="truncate max-w-[120px]">
              {getFilterLabel(filter)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveFilter(filter)}
              className="w-4 h-4 p-0 hover:bg-primary/20 rounded-full ml-1"
            >
              <Icon name="X" size={10} />
            </Button>
          </div>
        ))}

        {activeFilters?.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            Limpar todos
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterChips;