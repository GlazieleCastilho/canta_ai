import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ 
  type = 'no-songs', 
  onAddSong, 
  onClearFilters,
  searchQuery = '',
  activeFiltersCount = 0 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-songs':
        return {
          icon: 'Music',
          title: 'Sua biblioteca está vazia',
          description: 'Comece adicionando suas primeiras músicas para criar sua coleção de karaokê personalizada.',
          primaryAction: {
            label: 'Adicionar Primeira Música',
            onClick: onAddSong,
            icon: 'Plus'
          },
          tips: [
            'Arraste arquivos MP3, MIDI, WAV ou KAR diretamente para a tela',
            'Use o botão "+" para selecionar múltiplos arquivos',
            'Edite as letras e sincronize com o áudio depois'
          ]
        };

      case 'no-results':
        return {
          icon: 'Search',
          title: 'Nenhuma música encontrada',
          description: searchQuery 
            ? `Não encontramos resultados para "${searchQuery}". Tente outros termos ou ajuste os filtros.`
            : 'Nenhuma música corresponde aos filtros aplicados.',
          primaryAction: activeFiltersCount > 0 ? {
            label: 'Limpar Filtros',
            onClick: onClearFilters,
            icon: 'X'
          } : {
            label: 'Adicionar Nova Música',
            onClick: onAddSong,
            icon: 'Plus'
          },
          tips: [
            'Verifique a ortografia dos termos de busca',
            'Tente usar palavras-chave mais gerais',
            'Remova alguns filtros para ampliar os resultados'
          ]
        };

      case 'loading':
        return {
          icon: 'Loader2',
          title: 'Carregando biblioteca...',
          description: 'Aguarde enquanto organizamos suas músicas.',
          loading: true
        };

      default:
        return {
          icon: 'Music',
          title: 'Biblioteca de Músicas',
          description: 'Gerencie sua coleção de karaokê.'
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`
        w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6
        ${content?.loading ? 'animate-pulse' : ''}
      `}>
        <Icon 
          name={content?.icon} 
          size={48} 
          className={`text-muted-foreground ${content?.loading ? 'animate-spin' : ''}`} 
        />
      </div>
      <h2 className="text-2xl font-semibold mb-3">
        {content?.title}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        {content?.description}
      </p>
      {content?.primaryAction && (
        <Button
          onClick={content?.primaryAction?.onClick}
          size="lg"
          className="mb-8"
        >
          <Icon name={content?.primaryAction?.icon} size={20} className="mr-2" />
          {content?.primaryAction?.label}
        </Button>
      )}
      {content?.tips && (
        <div className="bg-muted/30 rounded-lg p-6 max-w-md">
          <h3 className="font-medium mb-3 flex items-center">
            <Icon name="Lightbulb" size={16} className="mr-2 text-accent" />
            Dicas úteis:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            {content?.tips?.map((tip, index) => (
              <li key={index} className="flex items-start">
                <Icon name="Check" size={14} className="mr-2 mt-0.5 text-success flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Additional actions for no-results state */}
      {type === 'no-results' && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location?.reload()}
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Recarregar
          </Button>
          
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // This would typically clear the search
                window.history?.pushState({}, '', window.location?.pathname);
              }}
            >
              <Icon name="Search" size={16} className="mr-2" />
              Nova Busca
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;