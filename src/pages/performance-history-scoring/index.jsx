import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import PerformanceCard from './components/PerformanceCard';
import PerformanceFilters from './components/PerformanceFilters';
import PerformanceDetailModal from './components/PerformanceDetailModal';
import StatisticsDashboard from './components/StatisticsDashboard';
import LeaderboardSection from './components/LeaderboardSection';

const PerformanceHistoryScoring = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('history');
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    scoreRange: 'all',
    performanceType: 'all',
    sortBy: 'date-desc',
    searchQuery: ''
  });

  // Mock performance data
  const mockPerformances = [
    {
      id: 1,
      songTitle: "Bohemian Rhapsody",
      artist: "Queen",
      date: "2025-01-20T19:30:00Z",
      score: 92,
      duration: 355,
      type: "solo",
      metrics: {
        pitchAccuracy: 89,
        timing: 94,
        consistency: 91
      },
      waveform: [20, 45, 67, 89, 76, 54, 32, 78, 91, 65, 43, 21, 56, 78, 89, 67, 45, 23, 67, 89],
      pitchData: [85, 87, 89, 91, 88, 92, 90, 89, 93, 91, 88, 90, 92, 89, 87, 91, 93, 90, 88, 92],
      timingHeatmap: [78, 82, 89, 91, 87, 93, 89, 85, 90, 88, 92, 87, 89, 91, 85, 88, 90, 92, 87, 89, 91, 88, 85, 90, 92, 89, 87, 91, 88, 90],
      vocalRange: {
        lowest: "C3",
        highest: "F5",
        range: 29
      },
      scoreBreakdown: [
        { name: "Afinação", score: 89, weight: 40, description: "Precisão das notas cantadas em relação à melodia original" },
        { name: "Tempo", score: 94, weight: 30, description: "Sincronização com o ritmo da música" },
        { name: "Consistência", score: 91, weight: 20, description: "Estabilidade vocal ao longo da performance" },
        { name: "Expressão", score: 88, weight: 10, description: "Interpretação e dinâmica vocal" }
      ],
      suggestions: [
        {
          title: "Trabalhe a respiração",
          description: "Sua performance foi excelente, mas algumas notas longas perderam estabilidade no final.",
          priority: "medium",
          icon: "Wind",
          tips: [
            "Pratique exercícios de respiração diafragmática",
            "Mantenha a postura ereta durante toda a música",
            "Planeje os pontos de respiração antes de cantar"
          ]
        },
        {
          title: "Explore mais o alcance vocal",
          description: "Você tem potencial para notas mais agudas. Tente expandir gradualmente.",
          priority: "low",
          icon: "TrendingUp",
          tips: [
            "Faça aquecimento vocal antes de cantar",
            "Pratique escalas ascendentes diariamente",
            "Mantenha a garganta relaxada nas notas altas"
          ]
        }
      ]
    },
    {
      id: 2,
      songTitle: "Imagine",
      artist: "John Lennon",
      date: "2025-01-19T15:45:00Z",
      score: 78,
      duration: 187,
      type: "solo",
      metrics: {
        pitchAccuracy: 82,
        timing: 76,
        consistency: 74
      },
      waveform: [15, 32, 45, 67, 54, 43, 21, 56, 78, 65, 43, 21, 45, 67, 54, 32, 21, 43, 56, 67],
      pitchData: [75, 78, 80, 82, 79, 81, 77, 80, 83, 81, 78, 80, 82, 79, 77, 81, 83, 80, 78, 82],
      timingHeatmap: [68, 72, 79, 81, 77, 83, 79, 75, 80, 78, 82, 77, 79, 81, 75, 78, 80, 82, 77, 79, 81, 78, 75, 80, 82, 79, 77, 81, 78, 80],
      vocalRange: {
        lowest: "D3",
        highest: "D5",
        range: 24
      },
      scoreBreakdown: [
        { name: "Afinação", score: 82, weight: 40, description: "Precisão das notas cantadas em relação à melodia original" },
        { name: "Tempo", score: 76, weight: 30, description: "Sincronização com o ritmo da música" },
        { name: "Consistência", score: 74, weight: 20, description: "Estabilidade vocal ao longo da performance" },
        { name: "Expressão", score: 80, weight: 10, description: "Interpretação e dinâmica vocal" }
      ],
      suggestions: [
        {
          title: "Melhore a sincronização",
          description: "Algumas frases estão ligeiramente atrasadas em relação ao acompanhamento.",
          priority: "high",
          icon: "Clock",
          tips: [
            "Use metrônomo durante os treinos",
            "Conte mentalmente o tempo da música",
            "Pratique cantando junto com a versão original"
          ]
        }
      ]
    },
    {
      id: 3,
      songTitle: "Perfect",
      artist: "Ed Sheeran",
      date: "2025-01-18T20:15:00Z",
      score: 85,
      duration: 263,
      type: "duet",
      metrics: {
        pitchAccuracy: 87,
        timing: 83,
        consistency: 86
      },
      waveform: [25, 42, 58, 74, 61, 48, 35, 67, 83, 70, 52, 38, 61, 77, 64, 41, 28, 54, 71, 78],
      pitchData: [82, 84, 86, 88, 85, 87, 83, 86, 89, 87, 84, 86, 88, 85, 83, 87, 89, 86, 84, 88],
      timingHeatmap: [73, 77, 84, 86, 82, 88, 84, 80, 85, 83, 87, 82, 84, 86, 80, 83, 85, 87, 82, 84, 86, 83, 80, 85, 87, 84, 82, 86, 83, 85],
      vocalRange: {
        lowest: "C3",
        highest: "E5",
        range: 28
      },
      scoreBreakdown: [
        { name: "Afinação", score: 87, weight: 40, description: "Precisão das notas cantadas em relação à melodia original" },
        { name: "Tempo", score: 83, weight: 30, description: "Sincronização com o ritmo da música" },
        { name: "Consistência", score: 86, weight: 20, description: "Estabilidade vocal ao longo da performance" },
        { name: "Expressão", score: 84, weight: 10, description: "Interpretação e dinâmica vocal" }
      ],
      suggestions: [
        {
          title: "Ótima harmonia no dueto",
          description: "A combinação vocal ficou muito boa. Continue praticando duetos!",
          priority: "low",
          icon: "Users",
          tips: [
            "Pratique ouvir o parceiro enquanto canta",
            "Trabalhe diferentes tipos de harmonias",
            "Experimente trocar as partes principais"
          ]
        }
      ]
    }
  ];

  // Mock statistics data
  const mockStatistics = {
    totalPerformances: 47,
    averageScore: 82,
    bestScore: 96,
    totalTime: "3h 42min",
    favoriteGenres: [
      { name: "Pop", count: 18, percentage: 85 },
      { name: "Rock", count: 12, percentage: 60 },
      { name: "Balada", count: 10, percentage: 50 },
      { name: "Country", count: 7, percentage: 35 }
    ],
    vocalRange: {
      current: 32,
      improvement: 4,
      lowest: "B2",
      highest: "G5"
    },
    performanceTrend: [72, 75, 78, 81, 79, 83, 85, 82, 87, 89, 86, 88, 91, 89, 87, 90, 92, 88, 85, 89, 91, 87, 84, 88, 90, 86, 89, 92, 88, 85]
  };

  // Mock leaderboard data
  const mockLeaderboard = [
    {
      id: 1,
      name: "Ana Silva",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      position: 1,
      averageScore: 94,
      bestScore: 98,
      performances: 156,
      favoriteGenre: "Pop",
      streak: 12,
      recentAchievement: "Vocal Legend"
    },
    {
      id: 2,
      name: "Carlos Santos",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      position: 2,
      averageScore: 91,
      bestScore: 96,
      performances: 203,
      favoriteGenre: "Rock",
      streak: 8,
      recentAchievement: "Rockstar"
    },
    {
      id: 3,
      name: "Mariana Costa",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      position: 3,
      averageScore: 89,
      bestScore: 95,
      performances: 134,
      favoriteGenre: "Balada",
      streak: 5,
      recentAchievement: "Maratonista"
    },
    {
      id: 4,
      name: "Você",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      position: 4,
      averageScore: 82,
      bestScore: 92,
      performances: 47,
      favoriteGenre: "Pop",
      streak: 3,
      recentAchievement: "Dueto Master"
    }
  ];

  const currentUser = mockLeaderboard?.find(user => user?.name === "Você");

  const [filteredPerformances, setFilteredPerformances] = useState(mockPerformances);

  useEffect(() => {
    let filtered = [...mockPerformances];

    // Apply search filter
    if (filters?.searchQuery) {
      filtered = filtered?.filter(performance =>
        performance?.songTitle?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase()) ||
        performance?.artist?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase())
      );
    }

    // Apply date range filter
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters?.dateRange) {
        case 'today':
          filterDate?.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate?.setDate(now?.getDate() - 7);
          break;
        case 'month':
          filterDate?.setMonth(now?.getMonth() - 1);
          break;
        case '3months':
          filterDate?.setMonth(now?.getMonth() - 3);
          break;
        case 'year':
          filterDate?.setFullYear(now?.getFullYear() - 1);
          break;
      }
      
      filtered = filtered?.filter(performance => 
        new Date(performance.date) >= filterDate
      );
    }

    // Apply score range filter
    if (filters?.scoreRange !== 'all') {
      const [min, max] = filters?.scoreRange?.split('-')?.map(Number);
      filtered = filtered?.filter(performance => 
        performance?.score >= min && performance?.score <= max
      );
    }

    // Apply performance type filter
    if (filters?.performanceType !== 'all') {
      filtered = filtered?.filter(performance => 
        performance?.type === filters?.performanceType
      );
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'score-desc':
          return b?.score - a?.score;
        case 'score-asc':
          return a?.score - b?.score;
        case 'song-asc':
          return a?.songTitle?.localeCompare(b?.songTitle);
        case 'artist-asc':
          return a?.artist?.localeCompare(b?.artist);
        default:
          return 0;
      }
    });

    setFilteredPerformances(filtered);
  }, [filters]);

  const handlePlayback = (performanceId, isPlaying) => {
    console.log(`${isPlaying ? 'Playing' : 'Pausing'} performance ${performanceId}`);
  };

  const handleViewDetails = (performance) => {
    setSelectedPerformance(performance);
    setIsDetailModalOpen(true);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: 'all',
      scoreRange: 'all',
      performanceType: 'all',
      sortBy: 'date-desc',
      searchQuery: ''
    });
  };

  const viewTabs = [
    { id: 'history', label: 'Histórico', icon: 'History' },
    { id: 'statistics', label: 'Estatísticas', icon: 'BarChart3' },
    { id: 'leaderboard', label: 'Ranking', icon: 'Trophy' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard-home')}
                aria-label="Voltar ao dashboard"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Histórico & Pontuação
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso vocal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Exportar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/karaoke-performance-mode')}
                iconName="Mic"
                iconPosition="left"
                iconSize={16}
              >
                Cantar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* View Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {viewTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveView(tab?.id)}
                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  activeView === tab?.id
                    ? 'text-primary border-primary' :'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {activeView === 'history' && (
          <div className="space-y-6">
            {/* Filters */}
            <PerformanceFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />

            {/* Performance List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Suas Performances
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredPerformances?.length} performance{filteredPerformances?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredPerformances?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPerformances?.map((performance) => (
                    <PerformanceCard
                      key={performance?.id}
                      performance={performance}
                      onPlayback={handlePlayback}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Music" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma performance encontrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Ajuste os filtros ou comece a cantar para ver suas performances aqui
                  </p>
                  <Button
                    variant="default"
                    onClick={() => navigate('/karaoke-performance-mode')}
                    iconName="Mic"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Começar a Cantar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'statistics' && (
          <StatisticsDashboard statistics={mockStatistics} />
        )}

        {activeView === 'leaderboard' && (
          <LeaderboardSection
            leaderboardData={mockLeaderboard}
            currentUser={currentUser}
          />
        )}
      </main>
      {/* Performance Detail Modal */}
      <PerformanceDetailModal
        performance={selectedPerformance}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPerformance(null);
        }}
      />
      {/* Bottom Navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default PerformanceHistoryScoring;