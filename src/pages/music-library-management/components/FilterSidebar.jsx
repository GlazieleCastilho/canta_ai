import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange, 
  onClearFilters 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    genre: true,
    language: true,
    difficulty: false,
    rating: false,
    duration: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleFilterToggle = (category, value) => {
    const currentFilters = filters?.[category] || [];
    const newFilters = currentFilters?.includes(value)
      ? currentFilters?.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFilterChange(category, newFilters);
  };

  const filterSections = [
    {
      key: 'genre',
      title: 'Gênero Musical',
      icon: 'Music',
      options: [
        { value: 'Rock', label: 'Rock', count: 45 },
        { value: 'Pop', label: 'Pop', count: 38 },
        { value: 'MPB', label: 'MPB', count: 29 },
        { value: 'Sertanejo', label: 'Sertanejo', count: 52 },
        { value: 'Funk', label: 'Funk', count: 23 },
        { value: 'Samba', label: 'Samba', count: 18 },
        { value: 'Forró', label: 'Forró', count: 15 },
        { value: 'Eletrônica', label: 'Eletrônica', count: 12 }
      ]
    },
    {
      key: 'language',
      title: 'Idioma',
      icon: 'Globe',
      options: [
        { value: 'Português', label: 'Português', count: 156 },
        { value: 'Inglês', label: 'Inglês', count: 89 },
        { value: 'Espanhol', label: 'Espanhol', count: 34 },
        { value: 'Francês', label: 'Francês', count: 12 },
        { value: 'Italiano', label: 'Italiano', count: 8 }
      ]
    },
    {
      key: 'difficulty',
      title: 'Dificuldade',
      icon: 'Target',
      options: [
        { value: 'Fácil', label: 'Fácil', count: 78 },
        { value: 'Médio', label: 'Médio', count: 134 },
        { value: 'Difícil', label: 'Difícil', count: 67 },
        { value: 'Expert', label: 'Expert', count: 23 }
      ]
    },
    {
      key: 'rating',
      title: 'Avaliação',
      icon: 'Star',
      options: [
        { value: '5', label: '5 estrelas', count: 45 },
        { value: '4', label: '4+ estrelas', count: 89 },
        { value: '3', label: '3+ estrelas', count: 156 },
        { value: '2', label: '2+ estrelas', count: 234 },
        { value: '1', label: '1+ estrela', count: 302 }
      ]
    }
  ];

  const activeFiltersCount = Object.values(filters)?.flat()?.length;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-auto w-80 bg-card border-r border-border z-50
        transform transition-transform duration-300 ease-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-primary" />
            <h2 className="font-semibold">Filtros</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Filter sections */}
        <div className="p-4 space-y-4">
          {filterSections?.map((section) => (
            <div key={section?.key} className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection(section?.key)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Icon name={section?.icon} size={16} className="text-muted-foreground" />
                  <span className="font-medium">{section?.title}</span>
                  {filters?.[section?.key]?.length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {filters?.[section?.key]?.length}
                    </span>
                  )}
                </div>
                <Icon 
                  name={expandedSections?.[section?.key] ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-muted-foreground"
                />
              </button>

              {expandedSections?.[section?.key] && (
                <div className="px-3 pb-3 space-y-2">
                  {section?.options?.map((option) => (
                    <div key={option?.value} className="flex items-center justify-between">
                      <Checkbox
                        checked={filters?.[section?.key]?.includes(option?.value) || false}
                        onChange={(e) => handleFilterToggle(section?.key, option?.value)}
                        label={option?.label}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground ml-2">
                        {option?.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Duration range */}
          <div className="border border-border rounded-lg">
            <button
              onClick={() => toggleSection('duration')}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <span className="font-medium">Duração</span>
              </div>
              <Icon 
                name={expandedSections?.duration ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-muted-foreground"
              />
            </button>

            {expandedSections?.duration && (
              <div className="px-3 pb-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0:30</span>
                    <span>8:00</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full w-3/4"></div>
                    </div>
                    <div className="absolute top-0 left-1/4 w-4 h-4 bg-primary rounded-full -mt-1 cursor-pointer"></div>
                    <div className="absolute top-0 right-1/4 w-4 h-4 bg-primary rounded-full -mt-1 cursor-pointer"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>1:30</span>
                    <span>6:00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recently added */}
          <div className="border border-border rounded-lg p-3">
            <Checkbox
              checked={filters?.recently_added || false}
              onChange={(e) => onFilterChange('recently_added', e?.target?.checked)}
              label="Adicionadas recentemente"
              description="Últimos 7 dias"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;