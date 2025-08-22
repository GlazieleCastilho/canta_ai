import React from 'react';
import Icon from '../../../components/AppIcon';

const StatisticsDashboard = ({ 
  statistics,
  className = '' 
}) => {
  const statCards = [
    {
      title: 'Total de Performances',
      value: statistics?.totalPerformances,
      icon: 'Mic',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pontuação Média',
      value: `${statistics?.averageScore}%`,
      icon: 'Target',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Melhor Pontuação',
      value: `${statistics?.bestScore}%`,
      icon: 'Trophy',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Tempo Total Cantando',
      value: statistics?.totalTime,
      icon: 'Clock',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  const achievements = [
    { name: 'Primeira Performance', icon: 'Star', earned: true },
    { name: 'Pontuação Perfeita', icon: 'Award', earned: true },
    { name: 'Maratonista', icon: 'Zap', earned: true },
    { name: 'Dueto Master', icon: 'Users', earned: false },
    { name: 'Rockstar', icon: 'Guitar', earned: false },
    { name: 'Vocal Legend', icon: 'Crown', earned: false }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat?.bgColor}`}>
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Genres */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Music" size={18} className="mr-2" />
            Gêneros Favoritos
          </h3>
          <div className="space-y-3">
            {statistics?.favoriteGenres?.map((genre, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-foreground">{genre?.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${genre?.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {genre?.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vocal Range Development */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Desenvolvimento Vocal
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Alcance Atual</span>
                <span className="text-foreground font-medium">
                  {statistics?.vocalRange?.current} semitons
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(statistics?.vocalRange?.current / 36) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Melhoria este mês</span>
                <span className="text-success font-medium">
                  +{statistics?.vocalRange?.improvement} semitons
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Nota mais baixa: <span className="text-foreground">{statistics?.vocalRange?.lowest}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Nota mais alta: <span className="text-foreground">{statistics?.vocalRange?.highest}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Award" size={18} className="mr-2" />
            Conquistas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements?.map((achievement, index) => (
              <div
                key={index}
                className={`text-center p-3 rounded-lg border transition-all duration-200 ${
                  achievement?.earned
                    ? 'bg-primary/10 border-primary/20 text-primary' :'bg-muted/30 border-border text-muted-foreground'
                }`}
              >
                <div className={`mx-auto mb-2 p-2 rounded-full ${
                  achievement?.earned ? 'bg-primary/20' : 'bg-muted/50'
                }`}>
                  <Icon 
                    name={achievement?.icon} 
                    size={20} 
                    className={achievement?.earned ? 'text-primary' : 'text-muted-foreground'}
                  />
                </div>
                <div className="text-xs font-medium">{achievement?.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="LineChart" size={18} className="mr-2" />
            Tendência de Performance (Últimos 30 dias)
          </h3>
          <div className="h-32 flex items-end justify-center space-x-2">
            {statistics?.performanceTrend?.map((score, index) => (
              <div
                key={index}
                className="bg-primary/70 rounded-t-sm transition-all duration-150 hover:bg-primary"
                style={{
                  width: '8px',
                  height: `${(score / 100) * 100}px`,
                  minHeight: '4px'
                }}
                title={`Dia ${index + 1}: ${score}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>30 dias atrás</span>
            <span>Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;