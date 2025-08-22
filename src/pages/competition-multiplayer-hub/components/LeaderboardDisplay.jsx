import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const LeaderboardDisplay = ({ onViewProfile }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const leaderboardData = {
    week: [
      {
        rank: 1,
        user: {
          id: 1,
          name: "Maria Silva",
          avatar: "https://randomuser.me/api/portraits/women/32.jpg",
          level: "Avançado",
          country: "BR"
        },
        score: 95420,
        songsPlayed: 28,
        averageScore: 8650,
        winRate: 89,
        streak: 12,
        badges: ["🏆", "🎵", "🔥"],
        change: 2
      },
      {
        rank: 2,
        user: {
          id: 2,
          name: "João Santos",
          avatar: "https://randomuser.me/api/portraits/men/45.jpg",
          level: "Avançado",
          country: "BR"
        },
        score: 92150,
        songsPlayed: 25,
        averageScore: 8450,
        winRate: 84,
        streak: 8,
        badges: ["🎤", "⭐", "🎯"],
        change: -1
      },
      {
        rank: 3,
        user: {
          id: 3,
          name: "Ana Costa",
          avatar: "https://randomuser.me/api/portraits/women/28.jpg",
          level: "Intermediário",
          country: "BR"
        },
        score: 89750,
        songsPlayed: 32,
        averageScore: 8200,
        winRate: 78,
        streak: 5,
        badges: ["🎶", "💫", "🌟"],
        change: 1
      },
      {
        rank: 4,
        user: {
          id: 4,
          name: "Carlos Oliveira",
          avatar: "https://randomuser.me/api/portraits/men/52.jpg",
          level: "Intermediário",
          country: "BR"
        },
        score: 87300,
        songsPlayed: 22,
        averageScore: 8100,
        winRate: 75,
        streak: 3,
        badges: ["🎵", "🏅"],
        change: 0
      },
      {
        rank: 5,
        user: {
          id: 5,
          name: "Pedro Rocha",
          avatar: "https://randomuser.me/api/portraits/men/35.jpg",
          level: "Avançado",
          country: "BR"
        },
        score: 85900,
        songsPlayed: 19,
        averageScore: 8350,
        winRate: 82,
        streak: 7,
        badges: ["🎸", "🔥"],
        change: 3
      }
    ]
  };

  const currentUserRank = 3; // Mock current user position

  const getChangeIcon = (change) => {
    if (change > 0) return { icon: 'TrendingUp', color: 'text-success' };
    if (change < 0) return { icon: 'TrendingDown', color: 'text-error' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (rank, isCurrentUser = false) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary';
    switch (rank) {
      case 1: return 'bg-warning/10 border-warning/20';
      case 2: return 'bg-muted/20 border-muted';
      case 3: return 'bg-accent/10 border-accent/20';
      default: return 'bg-card border-border';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Ranking Global</h2>
          <Button variant="outline" size="sm">
            <Icon name="Trophy" size={16} className="mr-2" />
            Ver Todos
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex space-x-1 bg-muted rounded-lg p-1 flex-1">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                timeFilter === 'week' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                timeFilter === 'month' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                timeFilter === 'all' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Geral
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e?.target?.value)}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas Categorias</option>
            <option value="rock">Rock</option>
            <option value="mpb">MPB</option>
            <option value="pop">Pop</option>
            <option value="sertanejo">Sertanejo</option>
          </select>
        </div>
      </div>
      <div className="p-4">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {leaderboardData?.week?.slice(0, 3)?.map((player, index) => {
            const positions = [1, 0, 2]; // Center, Left, Right for podium effect
            const actualIndex = positions?.[index];
            const heights = ['h-16', 'h-20', 'h-12']; // Different heights for podium
            
            return (
              <div key={player?.user?.id} className={`text-center ${index === 1 ? 'order-first' : ''}`}>
                <div className="relative mb-2">
                  <Image
                    src={player?.user?.avatar}
                    alt={player?.user?.name}
                    className={`w-12 h-12 rounded-full object-cover mx-auto border-2 ${
                      player?.rank === 1 ? 'border-warning' : 
                      player?.rank === 2 ? 'border-muted' : 'border-accent'
                    }`}
                  />
                  <div className="absolute -top-2 -right-1 text-lg">
                    {getRankMedal(player?.rank)}
                  </div>
                </div>
                <div className={`${heights?.[actualIndex]} bg-gradient-to-t ${
                  player?.rank === 1 ? 'from-warning/20 to-warning/10' :
                  player?.rank === 2 ? 'from-muted/20 to-muted/10' : 'from-accent/20 to-accent/10'
                } rounded-t-lg flex items-end justify-center pb-2`}>
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground truncate max-w-[60px]">
                      {player?.user?.name?.split(' ')?.[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player?.score?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Rankings */}
        <div className="space-y-2">
          {leaderboardData?.week?.map((player) => {
            const isCurrentUser = player?.rank === currentUserRank;
            const changeData = getChangeIcon(player?.change);
            
            return (
              <div
                key={player?.user?.id}
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  getRankColor(player?.rank, isCurrentUser)
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankMedal(player?.rank) ? (
                      <span className="text-lg">{getRankMedal(player?.rank)}</span>
                    ) : (
                      <span className="text-sm font-bold text-foreground">#{player?.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Image
                      src={player?.user?.avatar}
                      alt={player?.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isCurrentUser && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="User" size={8} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground truncate">{player?.user?.name}</h4>
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span>{player?.user?.level}</span>
                      <span>{player?.songsPlayed} músicas</span>
                      <span>{player?.winRate}% vitórias</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center space-x-1">
                    {player?.badges?.map((badge, index) => (
                      <span key={index} className="text-sm">{badge}</span>
                    ))}
                  </div>

                  {/* Score and Change */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {player?.score?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Média: {player?.averageScore?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Icon 
                          name={changeData?.icon} 
                          size={14} 
                          className={changeData?.color} 
                        />
                        {player?.change !== 0 && (
                          <span className={`text-xs ${changeData?.color}`}>
                            {Math.abs(player?.change)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfile(player?.user)}
                  >
                    <Icon name="User" size={14} />
                  </Button>
                </div>
                {/* Streak indicator */}
                {player?.streak > 0 && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-error/10 text-error rounded-full text-xs">
                      <Icon name="Flame" size={12} />
                      <span>{player?.streak} sequência</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current user position if not in top 5 */}
        {currentUserRank > 5 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-primary">#{currentUserRank}</span>
                  <span className="text-sm text-foreground">Sua Posição</span>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardDisplay;