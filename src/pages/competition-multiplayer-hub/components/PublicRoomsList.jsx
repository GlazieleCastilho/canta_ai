import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PublicRoomsList = ({ onJoinRoom, onSpectateRoom, onCreateRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('participants');

  const mockRooms = [
    {
      id: 1,
      name: "Noite do Rock Clássico",
      host: {
        name: "Pedro Rocha",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        level: "Avançado"
      },
      currentSong: {
        title: "Sweet Child O\' Mine",
        artist: "Guns N\' Roses"
      },
      participants: 8,
      maxParticipants: 12,
      spectators: 15,
      difficulty: "Intermediário",
      genre: "Rock",
      language: "Inglês",
      isPrivate: false,
      hasPassword: false,
      status: "Em Andamento",
      createdAt: new Date('2025-01-08T20:30:00'),
      songQueue: 5,
      averageScore: 8500,
      roomType: "Livre"
    },
    {
      id: 2,
      name: "MPB para Todos",
      host: {
        name: "Carla Mendes",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        level: "Intermediário"
      },
      currentSong: {
        title: "Águas de Março",
        artist: "Elis Regina"
      },
      participants: 6,
      maxParticipants: 10,
      spectators: 8,
      difficulty: "Iniciante",
      genre: "MPB",
      language: "Português",
      isPrivate: false,
      hasPassword: false,
      status: "Aguardando",
      createdAt: new Date('2025-01-08T21:00:00'),
      songQueue: 3,
      averageScore: 7800,
      roomType: "Temática"
    },
    {
      id: 3,
      name: "Sertanejo Universitário",
      host: {
        name: "Lucas Fernandes",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
        level: "Iniciante"
      },
      currentSong: null,
      participants: 4,
      maxParticipants: 8,
      spectators: 2,
      difficulty: "Iniciante",
      genre: "Sertanejo",
      language: "Português",
      isPrivate: false,
      hasPassword: true,
      status: "Aguardando",
      createdAt: new Date('2025-01-08T21:15:00'),
      songQueue: 0,
      averageScore: 0,
      roomType: "Competitiva"
    },
    {
      id: 4,
      name: "Pop Internacional",
      host: {
        name: "Ana Beatriz",
        avatar: "https://randomuser.me/api/portraits/women/25.jpg",
        level: "Avançado"
      },
      currentSong: {
        title: "Shape of You",
        artist: "Ed Sheeran"
      },
      participants: 10,
      maxParticipants: 15,
      spectators: 22,
      difficulty: "Avançado",
      genre: "Pop",
      language: "Inglês",
      isPrivate: false,
      hasPassword: false,
      status: "Em Andamento",
      createdAt: new Date('2025-01-08T19:45:00'),
      songQueue: 8,
      averageScore: 9200,
      roomType: "Livre"
    }
  ];

  useEffect(() => {
    // Simulate real-time updates
    setRooms(mockRooms);
    
    const interval = setInterval(() => {
      setRooms(prevRooms => 
        prevRooms?.map(room => ({
          ...room,
          spectators: room?.spectators + Math.floor(Math.random() * 3) - 1
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms?.filter(room => {
    if (filter === 'all') return true;
    if (filter === 'active') return room?.status === 'Em Andamento';
    if (filter === 'waiting') return room?.status === 'Aguardando';
    if (filter === 'available') return room?.participants < room?.maxParticipants;
    return true;
  });

  const sortedRooms = [...filteredRooms]?.sort((a, b) => {
    switch (sortBy) {
      case 'participants':
        return b?.participants - a?.participants;
      case 'created':
        return b?.createdAt - a?.createdAt;
      case 'score':
        return b?.averageScore - a?.averageScore;
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-success bg-success/10';
      case 'Intermediário': return 'text-warning bg-warning/10';
      case 'Avançado': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Andamento': return 'text-success bg-success/10';
      case 'Aguardando': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getRoomTypeIcon = (type) => {
    switch (type) {
      case 'Competitiva': return 'Trophy';
      case 'Temática': return 'Music';
      case 'Livre': return 'Users';
      default: return 'Home';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Salas Públicas</h2>
          <Button variant="default" onClick={onCreateRoom}>
            <Icon name="Plus" size={16} className="mr-2" />
            Criar Sala
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex space-x-1 bg-muted rounded-lg p-1 flex-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                filter === 'all' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                filter === 'active' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFilter('waiting')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                filter === 'waiting' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Aguardando
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                filter === 'available' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Disponíveis
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="participants">Mais Participantes</option>
            <option value="created">Mais Recentes</option>
            <option value="score">Maior Pontuação</option>
          </select>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {sortedRooms?.map((room) => (
            <div key={room?.id} className="bg-muted/30 rounded-lg border border-border p-4">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Image
                    src={room?.host?.avatar}
                    alt={room?.host?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Icon name={getRoomTypeIcon(room?.roomType)} size={12} className="text-primary-foreground" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{room?.name}</h3>
                        {room?.hasPassword && (
                          <Icon name="Lock" size={14} className="text-warning" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Host: {room?.host?.name} • {room?.host?.level}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room?.status)}`}>
                        {room?.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(room?.difficulty)}`}>
                        {room?.difficulty}
                      </span>
                    </div>
                  </div>

                  {room?.currentSong && (
                    <div className="bg-card rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon name="Music" size={14} className="text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {room?.currentSong?.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {room?.currentSong?.artist}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          <span className="text-xs text-success font-medium">AO VIVO</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} className="text-primary" />
                      <span className="text-foreground">
                        {room?.participants}/{room?.maxParticipants}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={14} className="text-accent" />
                      <span className="text-foreground">{room?.spectators}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Icon name="Music" size={14} className="text-secondary" />
                      <span className="text-foreground">{room?.genre}</span>
                    </div>

                    {room?.averageScore > 0 && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={14} className="text-warning" />
                        <span className="text-foreground">{room?.averageScore?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span>{room?.language}</span>
                      {room?.songQueue > 0 && (
                        <span>{room?.songQueue} na fila</span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSpectateRoom(room)}
                        disabled={room?.spectators >= 50}
                      >
                        <Icon name="Eye" size={14} className="mr-1" />
                        Assistir
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onJoinRoom(room)}
                        disabled={room?.participants >= room?.maxParticipants}
                      >
                        <Icon name="Users" size={14} className="mr-1" />
                        {room?.participants >= room?.maxParticipants ? 'Lotada' : 'Entrar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedRooms?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma sala encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Não há salas disponíveis no momento. Que tal criar uma?
            </p>
            <Button variant="default" onClick={onCreateRoom}>
              <Icon name="Plus" size={16} className="mr-2" />
              Criar Nova Sala
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRoomsList;