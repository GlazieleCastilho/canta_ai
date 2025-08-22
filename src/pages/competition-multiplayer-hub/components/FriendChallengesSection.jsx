import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const FriendChallengesSection = ({ onAcceptChallenge, onDeclineChallenge, onCreateChallenge }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingChallenges = [
    {
      id: 1,
      challenger: {
        name: "Maria Silva",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        level: "Intermediário"
      },
      type: "duet",
      song: {
        title: "Evidências",
        artist: "Chitãozinho & Xororó"
      },
      challengeType: "Dueto",
      deadline: new Date('2025-01-10'),
      message: "Vamos cantar juntos esse clássico!",
      createdAt: new Date('2025-01-05')
    },
    {
      id: 2,
      challenger: {
        name: "João Santos",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        level: "Avançado"
      },
      type: "battle",
      song: {
        title: "Bohemian Rhapsody",
        artist: "Queen"
      },
      challengeType: "Batalha",
      deadline: new Date('2025-01-12'),
      message: "Aceita o desafio? Quem canta melhor?",
      createdAt: new Date('2025-01-06')
    }
  ];

  const activeChallenges = [
    {
      id: 3,
      opponent: {
        name: "Ana Costa",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        level: "Iniciante"
      },
      type: "battle",
      song: {
        title: "Imagine",
        artist: "John Lennon"
      },
      challengeType: "Batalha",
      myScore: 8750,
      opponentScore: 8200,
      status: "Aguardando oponente",
      deadline: new Date('2025-01-15')
    }
  ];

  const completedChallenges = [
    {
      id: 4,
      opponent: {
        name: "Carlos Oliveira",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg",
        level: "Intermediário"
      },
      type: "duet",
      song: {
        title: "The Girl from Ipanema",
        artist: "Stan Getz & João Gilberto"
      },
      challengeType: "Dueto",
      myScore: 9100,
      opponentScore: 8900,
      combinedScore: 18000,
      result: "Vitória",
      completedAt: new Date('2025-01-03')
    }
  ];

  const getTimeUntilDeadline = (deadline) => {
    const now = new Date();
    const diffTime = deadline - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h restantes`;
    }
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} dias restantes`;
  };

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case 'duet': return 'Users';
      case 'battle': return 'Zap';
      default: return 'Music';
    }
  };

  const getChallengeTypeColor = (type) => {
    switch (type) {
      case 'duet': return 'text-primary bg-primary/10';
      case 'battle': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const renderPendingChallenges = () => (
    <div className="space-y-4">
      {pendingChallenges?.map((challenge) => (
        <div key={challenge?.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Image
                src={challenge?.challenger?.avatar}
                alt={challenge?.challenger?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name={getChallengeTypeIcon(challenge?.type)} size={12} className="text-primary-foreground" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{challenge?.challenger?.name}</h4>
                  <p className="text-sm text-muted-foreground">{challenge?.challenger?.level}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChallengeTypeColor(challenge?.type)}`}>
                  {challenge?.challengeType}
                </span>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Music" size={14} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{challenge?.song?.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{challenge?.song?.artist}</p>
              </div>

              {challenge?.message && (
                <p className="text-sm text-muted-foreground mb-3 italic">
                  "{challenge?.message}"
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  <span>{getTimeUntilDeadline(challenge?.deadline)}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeclineChallenge(challenge?.id)}
                  >
                    Recusar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onAcceptChallenge(challenge)}
                  >
                    Aceitar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {pendingChallenges?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="UserPlus" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum desafio pendente</h3>
          <p className="text-muted-foreground mb-4">
            Que tal desafiar seus amigos para uma batalha musical?
          </p>
          <Button variant="default" onClick={onCreateChallenge}>
            <Icon name="Plus" size={16} className="mr-2" />
            Criar Desafio
          </Button>
        </div>
      )}
    </div>
  );

  const renderActiveChallenges = () => (
    <div className="space-y-4">
      {activeChallenges?.map((challenge) => (
        <div key={challenge?.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Image
              src={challenge?.opponent?.avatar}
              alt={challenge?.opponent?.name}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{challenge?.opponent?.name}</h4>
                  <p className="text-sm text-muted-foreground">{challenge?.opponent?.level}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  Em Andamento
                </span>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Music" size={14} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{challenge?.song?.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{challenge?.song?.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sua Pontuação</p>
                  <p className="text-lg font-bold text-primary">{challenge?.myScore?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Oponente</p>
                  <p className="text-lg font-bold text-muted-foreground">
                    {challenge?.opponentScore ? challenge?.opponentScore?.toLocaleString() : '---'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{challenge?.status}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  <span>{getTimeUntilDeadline(challenge?.deadline)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompletedChallenges = () => (
    <div className="space-y-4">
      {completedChallenges?.map((challenge) => (
        <div key={challenge?.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Image
              src={challenge?.opponent?.avatar}
              alt={challenge?.opponent?.name}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{challenge?.opponent?.name}</h4>
                  <p className="text-sm text-muted-foreground">{challenge?.opponent?.level}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  challenge?.result === 'Vitória' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {challenge?.result}
                </span>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="Music" size={14} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{challenge?.song?.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{challenge?.song?.artist}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Você</p>
                  <p className="text-sm font-bold text-foreground">{challenge?.myScore?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Oponente</p>
                  <p className="text-sm font-bold text-foreground">{challenge?.opponentScore?.toLocaleString()}</p>
                </div>
                {challenge?.combinedScore && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-bold text-primary">{challenge?.combinedScore?.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Concluído em {challenge?.completedAt?.toLocaleDateString('pt-BR')}
                </p>
                <Button variant="ghost" size="sm">
                  <Icon name="Play" size={14} className="mr-1" />
                  Replay
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Desafios entre Amigos</h2>
          <Button variant="default" size="sm" onClick={onCreateChallenge}>
            <Icon name="Plus" size={16} className="mr-2" />
            Novo Desafio
          </Button>
        </div>

        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              activeTab === 'pending' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pendentes ({pendingChallenges?.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              activeTab === 'active' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ativos ({activeChallenges?.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              activeTab === 'completed'
                ? 'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Concluídos
          </button>
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'pending' && renderPendingChallenges()}
        {activeTab === 'active' && renderActiveChallenges()}
        {activeTab === 'completed' && renderCompletedChallenges()}
      </div>
    </div>
  );
};

export default FriendChallengesSection;