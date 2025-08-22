import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ className = '' }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'upload',
      title: 'Adicionar Música',
      description: 'Faça upload de uma nova música',
      icon: 'Upload',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => navigate('/music-library-management', { state: { showUpload: true } })
    },
    {
      id: 'playlist',
      title: 'Criar Playlist',
      description: 'Organize suas músicas favoritas',
      icon: 'ListMusic',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary/10',
      action: () => navigate('/music-library-management', { state: { showCreatePlaylist: true } })
    },
    {
      id: 'practice',
      title: 'Sessão de Treino',
      description: 'Pratique sem pontuação',
      icon: 'Target',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      action: () => navigate('/karaoke-performance-mode', { state: { practiceMode: true } })
    },
    {
      id: 'lyrics',
      title: 'Editor de Letras',
      description: 'Sincronize letras com áudio',
      icon: 'FileText',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      action: () => navigate('/lyrics-editor-synchronization')
    }
  ];

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="bg-card rounded-xl border border-border p-4 hover:bg-muted/50 transition-all duration-150 text-left group hover:scale-105"
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${action?.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-150`}>
                <Icon name={action?.icon} size={24} className={action?.iconColor} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors duration-150">
                  {action?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action?.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Additional quick stats */}
      <div className="mt-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-foreground">Estatísticas Rápidas</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/performance-history-scoring')}
            iconName="BarChart3"
            iconPosition="left"
          >
            Ver Detalhes
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2">
              <Icon name="Music" size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <div className="text-xs text-muted-foreground">Músicas na Biblioteca</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary/20 rounded-full mx-auto mb-2">
              <Icon name="Mic" size={20} className="text-secondary" />
            </div>
            <div className="text-2xl font-bold text-foreground">89</div>
            <div className="text-xs text-muted-foreground">Performances Totais</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-full mx-auto mb-2">
              <Icon name="Star" size={20} className="text-accent" />
            </div>
            <div className="text-2xl font-bold text-foreground">9,850</div>
            <div className="text-xs text-muted-foreground">Melhor Pontuação</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-success/20 rounded-full mx-auto mb-2">
              <Icon name="Trophy" size={20} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-xs text-muted-foreground">Conquistas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsPanel;