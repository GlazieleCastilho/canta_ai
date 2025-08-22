import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';

const ActivityFeed = ({ className = '' }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'performance',
      title: 'Nova performance registrada',
      description: 'Você cantou "Bohemian Rhapsody" e alcançou 9.850 pontos!',
      timestamp: new Date('2025-01-21T20:30:00'),
      icon: 'Mic',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      score: 9850,
      song: 'Bohemian Rhapsody',
      artist: 'Queen'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Conquista desbloqueada!',
      description: 'Você desbloqueou a conquista "Estrela do Rock" por cantar 50 músicas de rock.',
      timestamp: new Date('2025-01-21T19:15:00'),
      icon: 'Trophy',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      achievement: 'Estrela do Rock'
    },
    {
      id: 3,
      type: 'song_added',
      title: 'Nova música adicionada',
      description: 'Você adicionou "Imagine" de John Lennon à sua biblioteca.',
      timestamp: new Date('2025-01-21T18:45:00'),
      icon: 'Plus',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      song: 'Imagine',
      artist: 'John Lennon'
    },
    {
      id: 4,
      type: 'competition',
      title: 'Competição disponível',
      description: 'Nova competição "Clássicos dos Anos 80" começou. Participe agora!',
      timestamp: new Date('2025-01-21T16:00:00'),
      icon: 'Users',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary/10',
      competition: 'Clássicos dos Anos 80'
    },
    {
      id: 5,
      type: 'performance',
      title: 'Performance anterior',
      description: 'Você cantou "Hotel California" e alcançou 9.200 pontos.',
      timestamp: new Date('2025-01-20T21:20:00'),
      icon: 'Mic',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      score: 9200,
      song: 'Hotel California',
      artist: 'Eagles'
    },
    {
      id: 6,
      type: 'friend_activity',
      title: 'Atividade de amigos',
      description: 'Maria Silva alcançou um novo recorde pessoal cantando "Yesterday".',
      timestamp: new Date('2025-01-20T19:30:00'),
      icon: 'Heart',
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      friend: 'Maria Silva',
      song: 'Yesterday'
    }
  ];

  const filters = [
    { key: 'all', label: 'Todas', icon: 'List' },
    { key: 'performance', label: 'Performances', icon: 'Mic' },
    { key: 'achievement', label: 'Conquistas', icon: 'Trophy' },
    { key: 'competition', label: 'Competições', icon: 'Users' }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.type === filter);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const handleActivityClick = (activity) => {
    switch (activity?.type) {
      case 'performance':
        navigate('/performance-history-scoring');
        break;
      case 'achievement': navigate('/performance-history-scoring');
        break;
      case 'song_added': navigate('/music-library-management');
        break;
      case 'competition': navigate('/competition-multiplayer-hub');
        break;
      default:
        break;
    }
  };

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Atividades Recentes</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/performance-history-scoring')}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Ver Histórico
        </Button>
      </div>
      {/* Filter tabs */}
      <div className="flex space-x-1 mb-4 bg-muted/30 p-1 rounded-lg overflow-x-auto">
        {filters?.map((filterOption) => (
          <button
            key={filterOption?.key}
            onClick={() => setFilter(filterOption?.key)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${filter === filterOption?.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon name={filterOption?.icon} size={16} />
            <span>{filterOption?.label}</span>
          </button>
        ))}
      </div>
      {/* Activity list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities?.map((activity) => (
          <div
            key={activity?.id}
            onClick={() => handleActivityClick(activity)}
            className="bg-card rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity?.bgColor} flex items-center justify-center`}>
                <Icon name={activity?.icon} size={20} className={activity?.iconColor} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-150">
                    {activity?.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {activity?.description}
                </p>

                {/* Activity-specific details */}
                {activity?.type === 'performance' && activity?.score && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-accent fill-current" />
                      <span className="text-sm font-medium text-accent">
                        {activity?.score?.toLocaleString()} pontos
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Music" size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {activity?.song} - {activity?.artist}
                      </span>
                    </div>
                  </div>
                )}

                {activity?.type === 'achievement' && activity?.achievement && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Award" size={14} className="text-accent" />
                    <span className="text-sm font-medium text-accent">
                      {activity?.achievement}
                    </span>
                  </div>
                )}

                {activity?.type === 'competition' && activity?.competition && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={14} className="text-secondary" />
                    <span className="text-sm font-medium text-secondary">
                      {activity?.competition}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredActivities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all' ?'Comece cantando para ver suas atividades aqui!'
              : `Nenhuma atividade do tipo "${filters?.find(f => f?.key === filter)?.label}" encontrada.`
            }
          </p>
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;