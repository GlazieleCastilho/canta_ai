import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const LeaderboardSection = ({ 
  leaderboardData,
  currentUser,
  className = '' 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('overall');

  const periodOptions = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'year', label: 'Este ano' },
    { value: 'all', label: 'Todos os tempos' }
  ];

  const categoryOptions = [
    { value: 'overall', label: 'Geral' },
    { value: 'rock', label: 'Rock' },
    { value: 'pop', label: 'Pop' },
    { value: 'ballad', label: 'Balada' },
    { value: 'duet', label: 'Duetos' }
  ];

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return { icon: 'Crown', color: 'text-yellow-500' };
      case 2: return { icon: 'Medal', color: 'text-gray-400' };
      case 3: return { icon: 'Award', color: 'text-amber-600' };
      default: return { icon: 'User', color: 'text-muted-foreground' };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-yellow-500';
    if (score >= 75) return 'text-gray-400';
    if (score >= 60) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center">
            <Icon name="Trophy" size={20} className="mr-2 text-warning" />
            Ranking
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              iconPosition="left"
              iconSize={16}
            >
              Privacidade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Período"
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
          <Select
            label="Categoria"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>
      {/* Current User Position */}
      {currentUser && (
        <div className="p-4 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">#{currentUser?.position}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">Você</div>
                  <div className="text-xs text-muted-foreground">
                    {currentUser?.performances} performances
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold font-mono ${getScoreColor(currentUser?.averageScore)}`}>
                {currentUser?.averageScore}%
              </div>
              <div className="text-xs text-muted-foreground">média</div>
            </div>
          </div>
        </div>
      )}
      {/* Leaderboard List */}
      <div className="divide-y divide-border">
        {leaderboardData?.map((user, index) => {
          const rankInfo = getRankIcon(user?.position);
          const isCurrentUser = currentUser && user?.id === currentUser?.id;
          
          return (
            <div
              key={user?.id}
              className={`p-4 transition-colors duration-150 ${
                isCurrentUser ? 'bg-primary/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    {user?.position <= 3 ? (
                      <Icon name={rankInfo?.icon} size={20} className={rankInfo?.color} />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        #{user?.position}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
                      <img 
                        src={user?.avatar} 
                        alt={user?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground flex items-center space-x-2">
                        <span>{user?.name}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user?.performances} performances • {user?.favoriteGenre}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score and Stats */}
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${getScoreColor(user?.averageScore)}`}>
                    {user?.averageScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Melhor: {user?.bestScore}%
                  </div>
                  {user?.streak > 0 && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <Icon name="Flame" size={12} className="text-warning" />
                      <span className="text-xs text-warning font-medium">
                        {user?.streak} dias
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Recent Achievement */}
              {user?.recentAchievement && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Star" size={12} className="text-warning" />
                    <span>Conquista recente: {user?.recentAchievement}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border text-center">
        <Button
          variant="ghost"
          size="sm"
          iconName="Users"
          iconPosition="left"
          iconSize={16}
        >
          Ver Ranking Completo
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardSection;