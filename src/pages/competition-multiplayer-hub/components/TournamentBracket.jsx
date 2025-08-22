import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TournamentBracket = ({ tournament, onViewMatch, onViewDetails }) => {
  const [selectedRound, setSelectedRound] = useState(0);

  const mockTournament = {
    id: 1,
    name: "Copa MPB 2025",
    status: "Em Andamento",
    currentRound: 2,
    totalRounds: 4,
    participants: 16,
    prize: "R$ 8.000",
    rounds: [
      {
        name: "Primeira Fase",
        matches: [
          {
            id: 1,
            player1: { name: "Maria Silva", avatar: "https://randomuser.me/api/portraits/women/32.jpg", score: 8750 },
            player2: { name: "João Santos", avatar: "https://randomuser.me/api/portraits/men/45.jpg", score: 8200 },
            winner: "player1",
            status: "Concluída",
            song: "Evidências"
          },
          {
            id: 2,
            player1: { name: "Ana Costa", avatar: "https://randomuser.me/api/portraits/women/28.jpg", score: 9100 },
            player2: { name: "Carlos Oliveira", avatar: "https://randomuser.me/api/portraits/men/52.jpg", score: 8900 },
            winner: "player1",
            status: "Concluída",
            song: "Águas de Março"
          },
          {
            id: 3,
            player1: { name: "Pedro Rocha", avatar: "https://randomuser.me/api/portraits/men/35.jpg", score: 8650 },
            player2: { name: "Carla Mendes", avatar: "https://randomuser.me/api/portraits/women/42.jpg", score: 8800 },
            winner: "player2",
            status: "Concluída",
            song: "Chega de Saudade"
          },
          {
            id: 4,
            player1: { name: "Lucas Fernandes", avatar: "https://randomuser.me/api/portraits/men/28.jpg", score: 7950 },
            player2: { name: "Ana Beatriz", avatar: "https://randomuser.me/api/portraits/women/25.jpg", score: 8450 },
            winner: "player2",
            status: "Concluída",
            song: "Garota de Ipanema"
          }
        ]
      },
      {
        name: "Semifinal",
        matches: [
          {
            id: 5,
            player1: { name: "Maria Silva", avatar: "https://randomuser.me/api/portraits/women/32.jpg", score: 9200 },
            player2: { name: "Ana Costa", avatar: "https://randomuser.me/api/portraits/women/28.jpg", score: 8950 },
            winner: "player1",
            status: "Em Andamento",
            song: "Corcovado"
          },
          {
            id: 6,
            player1: { name: "Carla Mendes", avatar: "https://randomuser.me/api/portraits/women/42.jpg", score: null },
            player2: { name: "Ana Beatriz", avatar: "https://randomuser.me/api/portraits/women/25.jpg", score: null },
            winner: null,
            status: "Aguardando",
            song: "Desafinado"
          }
        ]
      },
      {
        name: "Final",
        matches: [
          {
            id: 7,
            player1: { name: "TBD", avatar: null, score: null },
            player2: { name: "TBD", avatar: null, score: null },
            winner: null,
            status: "Aguardando",
            song: "TBD"
          }
        ]
      }
    ]
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'Concluída': return 'text-success bg-success/10';
      case 'Em Andamento': return 'text-warning bg-warning/10';
      case 'Aguardando': return 'text-muted-foreground bg-muted/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const renderMatch = (match, roundIndex) => {
    const isCurrentUserMatch = match?.player1?.name === "Maria Silva" || match?.player2?.name === "Maria Silva";
    
    return (
      <div 
        key={match?.id}
        className={`bg-card border rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
          isCurrentUserMatch ? 'border-primary ring-1 ring-primary/20' : 'border-border'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match?.status)}`}>
            {match?.status}
          </span>
          {match?.song && match?.song !== "TBD" && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Icon name="Music" size={12} />
              <span>{match?.song}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {/* Player 1 */}
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${
            match?.winner === 'player1' ? 'bg-success/10 border border-success/20' : 'bg-muted/20'
          }`}>
            {match?.player1?.avatar ? (
              <Image
                src={match?.player1?.avatar}
                alt={match?.player1?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon name="User" size={14} className="text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                match?.winner === 'player1' ? 'text-success' : 'text-foreground'
              }`}>
                {match?.player1?.name || 'TBD'}
              </p>
              {match?.player1?.score && (
                <p className="text-xs text-muted-foreground">
                  {match?.player1?.score?.toLocaleString()} pts
                </p>
              )}
            </div>

            {match?.winner === 'player1' && (
              <Icon name="Crown" size={16} className="text-warning" />
            )}
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              VS
            </span>
          </div>

          {/* Player 2 */}
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${
            match?.winner === 'player2' ? 'bg-success/10 border border-success/20' : 'bg-muted/20'
          }`}>
            {match?.player2?.avatar ? (
              <Image
                src={match?.player2?.avatar}
                alt={match?.player2?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon name="User" size={14} className="text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                match?.winner === 'player2' ? 'text-success' : 'text-foreground'
              }`}>
                {match?.player2?.name || 'TBD'}
              </p>
              {match?.player2?.score && (
                <p className="text-xs text-muted-foreground">
                  {match?.player2?.score?.toLocaleString()} pts
                </p>
              )}
            </div>

            {match?.winner === 'player2' && (
              <Icon name="Crown" size={16} className="text-warning" />
            )}
          </div>
        </div>
        {match?.status !== 'Aguardando' && (
          <div className="mt-3 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMatch(match)}
              className="flex-1"
            >
              <Icon name="Play" size={14} className="mr-1" />
              Ver Partida
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{mockTournament?.name}</h2>
            <p className="text-sm text-muted-foreground">
              Rodada {mockTournament?.currentRound} de {mockTournament?.totalRounds} • {mockTournament?.participants} participantes
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(mockTournament)}>
            <Icon name="Info" size={16} className="mr-2" />
            Detalhes
          </Button>
        </div>

        {/* Round selector */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {mockTournament?.rounds?.map((round, index) => (
            <button
              key={index}
              onClick={() => setSelectedRound(index)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                selectedRound === index
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {round?.name}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              {mockTournament?.rounds?.[selectedRound]?.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Trophy" size={14} className="text-warning" />
              <span>Prêmio: {mockTournament?.prize}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {mockTournament?.rounds?.[selectedRound]?.matches?.map((match) => 
            renderMatch(match, selectedRound)
          )}
        </div>

        {/* Tournament progress */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progresso do Torneio</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((mockTournament?.currentRound / mockTournament?.totalRounds) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(mockTournament?.currentRound / mockTournament?.totalRounds) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;