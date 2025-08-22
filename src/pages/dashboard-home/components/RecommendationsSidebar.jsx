import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecommendationsSidebar = ({ className = '' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recommended');

  const recommendedSongs = [
    {
      id: 1,
      title: "Don\'t Stop Believin'",
      artist: "Journey",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      reason: "Baseado no seu alcance vocal",
      difficulty: "Médio",
      duration: "4:10",
      popularity: 95
    },
    {
      id: 2,
      title: "Sweet Caroline",
      artist: "Neil Diamond",
      cover: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?w=200&h=200&fit=crop",
      reason: "Popular em competições",
      difficulty: "Fácil",
      duration: "3:21",
      popularity: 88
    },
    {
      id: 3,
      title: "Livin\' on a Prayer",
      artist: "Bon Jovi",
      cover: "https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=200&h=200&fit=crop",
      reason: "Seu gênero favorito",
      difficulty: "Difícil",
      duration: "4:09",
      popularity: 92
    }
  ];

  const trendingSongs = [
    {
      id: 4,
      title: "Blinding Lights",
      artist: "The Weeknd",
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
      trend: "+15%",
      plays: "2.3k",
      duration: "3:20"
    },
    {
      id: 5,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      cover: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=200&h=200&fit=crop",
      trend: "+12%",
      plays: "1.8k",
      duration: "2:54"
    },
    {
      id: 6,
      title: "Levitating",
      artist: "Dua Lipa",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      trend: "+8%",
      plays: "1.5k",
      duration: "3:23"
    }
  ];

  const upcomingCompetitions = [
    {
      id: 1,
      title: "Clássicos dos Anos 80",
      description: "Cante os maiores sucessos da década de 80",
      startDate: "2025-01-25",
      participants: 156,
      prize: "R$ 500",
      status: "Inscrições abertas"
    },
    {
      id: 2,
      title: "Duetos Românticos",
      description: "Competição em duplas com músicas românticas",
      startDate: "2025-01-28",
      participants: 89,
      prize: "R$ 300",
      status: "Em breve"
    }
  ];

  const tabs = [
    { key: 'recommended', label: 'Recomendadas', icon: 'Heart' },
    { key: 'trending', label: 'Em Alta', icon: 'TrendingUp' },
    { key: 'competitions', label: 'Competições', icon: 'Trophy' }
  ];

  const handleSongSelect = (song) => {
    navigate('/karaoke-performance-mode', { state: { selectedSong: song } });
  };

  const handleCompetitionJoin = (competition) => {
    navigate('/competition-multiplayer-hub', { state: { selectedCompetition: competition } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'text-success';
      case 'Médio': return 'text-warning';
      case 'Difícil': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <aside className={`bg-card rounded-xl border border-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Descobrir</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/music-library-management')}
          className="w-8 h-8"
          aria-label="Ver biblioteca completa"
        >
          <Icon name="ExternalLink" size={16} />
        </Button>
      </div>
      {/* Tab navigation */}
      <div className="flex space-x-1 mb-4 bg-muted/30 p-1 rounded-lg">
        {tabs?.map((tab) => (
          <button
            key={tab?.key}
            onClick={() => setActiveTab(tab?.key)}
            className={`
              flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex-1 justify-center
              ${activeTab === tab?.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon name={tab?.icon} size={14} />
            <span className="hidden sm:inline">{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Content based on active tab */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeTab === 'recommended' && (
          <>
            <div className="text-xs text-muted-foreground mb-3 flex items-center space-x-1">
              <Icon name="Sparkles" size={12} />
              <span>Personalizadas para você</span>
            </div>
            {recommendedSongs?.map((song) => (
              <div
                key={song?.id}
                onClick={() => handleSongSelect(song)}
                className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={song?.cover}
                      alt={`Capa de ${song?.title}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-150 flex items-center justify-center">
                      <Icon 
                        name="Play" 
                        size={16} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors duration-150">
                      {song?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {song?.artist}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {song?.reason}
                      </span>
                      <span className={`text-xs font-medium ${getDifficultyColor(song?.difficulty)}`}>
                        {song?.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'trending' && (
          <>
            <div className="text-xs text-muted-foreground mb-3 flex items-center space-x-1">
              <Icon name="TrendingUp" size={12} />
              <span>Mais cantadas hoje</span>
            </div>
            {trendingSongs?.map((song) => (
              <div
                key={song?.id}
                onClick={() => handleSongSelect(song)}
                className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={song?.cover}
                      alt={`Capa de ${song?.title}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-150 flex items-center justify-center">
                      <Icon 
                        name="Play" 
                        size={16} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors duration-150">
                      {song?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {song?.artist}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={10} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {song?.plays}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-success">
                        {song?.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'competitions' && (
          <>
            <div className="text-xs text-muted-foreground mb-3 flex items-center space-x-1">
              <Icon name="Trophy" size={12} />
              <span>Próximas competições</span>
            </div>
            {upcomingCompetitions?.map((competition) => (
              <div
                key={competition?.id}
                className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors duration-150"
              >
                <div className="mb-2">
                  <h3 className="font-medium text-sm text-foreground mb-1">
                    {competition?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {competition?.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={10} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(competition.startDate)?.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={10} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {competition?.participants}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-accent">
                    Prêmio: {competition?.prize}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleCompetitionJoin(competition)}
                    disabled={competition?.status !== 'Inscrições abertas'}
                  >
                    {competition?.status === 'Inscrições abertas' ? 'Participar' : 'Em breve'}
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
};

export default RecommendationsSidebar;