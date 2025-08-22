import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import SearchOverlay from '../../components/ui/SearchOverlay';

// Import components
import SongCard from './components/SongCard';
import FilterChips from './components/FilterChips';
import BulkActionToolbar from './components/BulkActionToolbar';
import SongUploadModal from './components/SongUploadModal';
import SongDetailModal from './components/SongDetailModal';
import FilterSidebar from './components/FilterSidebar';
import EmptyState from './components/EmptyState';

const MusicLibraryManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  
  // Filter states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    genre: [],
    language: [],
    difficulty: [],
    rating: [],
    recently_added: false
  });

  // Mock data
  const mockSongs = [
    {
      id: 1,
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      genre: 'Rock',
      language: 'Inglês',
      difficulty: 'Expert',
      duration: 355,
      rating: 5,
      playCount: 127,
      bestScore: 9850,
      coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      lyrics: `[00:00.50] Is this the real life?\n[00:04.20] Is this just fantasy?\n[00:08.10] Caught in a landslide\n[00:11.80] No escape from reality`,
      dateAdded: new Date(2024, 7, 15)
    },
    {
      id: 2,
      title: 'Imagine',
      artist: 'John Lennon',
      genre: 'Pop',
      language: 'Inglês',
      difficulty: 'Médio',
      duration: 187,
      rating: 5,
      playCount: 89,
      bestScore: 8920,
      coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
      lyrics: `[00:00.30] Imagine there's no heaven\n[00:06.10] It's easy if you try\n[00:12.50] No hell below us\n[00:18.20] Above us only sky`,
      dateAdded: new Date(2024, 7, 18)
    },
    {
      id: 3,
      title: 'Garota de Ipanema',
      artist: 'Tom Jobim',
      genre: 'MPB',
      language: 'Português',
      difficulty: 'Médio',
      duration: 312,
      rating: 4,
      playCount: 156,
      bestScore: 9200,
      coverArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop',
      lyrics: `[00:00.40] Olha que coisa mais linda\n[00:04.80] Mais cheia de graça\n[00:08.20] É ela menina\n[00:11.60] Que vem e que passa`,
      dateAdded: new Date(2024, 7, 20)
    },
    {
      id: 4,
      title: 'Evidências',
      artist: 'Chitãozinho & Xororó',
      genre: 'Sertanejo',
      language: 'Português',
      difficulty: 'Fácil',
      duration: 278,
      rating: 4,
      playCount: 203,
      bestScore: 8750,
      coverArt: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      lyrics: `[00:00.60] Quando eu digo que deixei de te amar\n[00:06.30] É porque eu te amo\n[00:10.80] Quando eu digo que não quero mais você\n[00:16.50] É porque eu te quero`,
      dateAdded: new Date(2024, 7, 22)
    },
    {
      id: 5,
      title: 'Hotel California',
      artist: 'Eagles',
      genre: 'Rock',
      language: 'Inglês',
      difficulty: 'Difícil',
      duration: 390,
      rating: 5,
      playCount: 98,
      bestScore: 9650,
      coverArt: 'https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=300&h=300&fit=crop',
      lyrics: `[00:00.80] On a dark desert highway\n[00:05.20] Cool wind in my hair\n[00:09.60] Warm smell of colitas\n[00:14.00] Rising up through the air`,
      dateAdded: new Date(2024, 6, 10)
    },
    {
      id: 6,
      title: 'Aquarela',
      artist: 'Toquinho',
      genre: 'MPB',
      language: 'Português',
      difficulty: 'Fácil',
      duration: 245,
      rating: 3,
      playCount: 67,
      bestScore: 7890,
      coverArt: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&h=300&fit=crop',
      lyrics: `[00:00.50] Numa folha qualquer\n[00:04.20] Eu desenho um sol amarelo\n[00:08.80] E com cinco ou seis retas\n[00:12.40] É fácil fazer um castelo`,
      dateAdded: new Date(2024, 7, 19)
    }
  ];

  const sortOptions = [
    { value: 'title', label: 'Título (A-Z)' },
    { value: 'title_desc', label: 'Título (Z-A)' },
    { value: 'artist', label: 'Artista (A-Z)' },
    { value: 'date_added', label: 'Data de Adição' },
    { value: 'rating', label: 'Avaliação' },
    { value: 'play_count', label: 'Mais Tocadas' },
    { value: 'duration', label: 'Duração' }
  ];

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setSongs(mockSongs);
      setFilteredSongs(mockSongs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...songs];

    // Apply search
    if (searchQuery) {
      filtered = filtered?.filter(song =>
        song?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        song?.artist?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        song?.genre?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply filters
    Object.entries(activeFilters)?.forEach(([key, value]) => {
      if (key === 'recently_added' && value) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
        filtered = filtered?.filter(song => song?.dateAdded >= sevenDaysAgo);
      } else if (Array.isArray(value) && value?.length > 0) {
        filtered = filtered?.filter(song => {
          if (key === 'rating') {
            return value?.some(rating => song?.rating >= parseInt(rating));
          }
          return value?.includes(song?.[key]);
        });
      }
    });

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a?.title?.localeCompare(b?.title);
        case 'title_desc':
          return b?.title?.localeCompare(a?.title);
        case 'artist':
          return a?.artist?.localeCompare(b?.artist);
        case 'date_added':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'rating':
          return b?.rating - a?.rating;
        case 'play_count':
          return b?.playCount - a?.playCount;
        case 'duration':
          return a?.duration - b?.duration;
        default:
          return 0;
      }
    });

    setFilteredSongs(filtered);
  }, [songs, searchQuery, activeFilters, sortBy]);

  // Selection handlers
  const handleSongSelect = (songId) => {
    setSelectedSongs(prev =>
      prev?.includes(songId)
        ? prev?.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSongs(filteredSongs?.map(song => song?.id));
  };

  const handleDeselectAll = () => {
    setSelectedSongs([]);
  };

  const handleExitSelection = () => {
    setSelectionMode(false);
    setSelectedSongs([]);
  };

  // Filter handlers
  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleRemoveFilter = (filter) => {
    if (filter?.type === 'recently_added') {
      setActiveFilters(prev => ({ ...prev, recently_added: false }));
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [filter?.type]: prev?.[filter?.type]?.filter(f => f !== filter?.value)
      }));
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters({
      genre: [],
      language: [],
      difficulty: [],
      rating: [],
      recently_added: false
    });
  };

  // Song action handlers
  const handleSongPlay = (song) => {
    navigate('/karaoke-performance-mode', { state: { selectedSong: song } });
  };

  const handleSongEdit = (song) => {
    setSelectedSong(song);
    setShowDetailModal(true);
  };

  const handleSongDelete = (song) => {
    if (confirm(`Tem certeza que deseja excluir "${song?.title}"?`)) {
      setSongs(prev => prev?.filter(s => s?.id !== song?.id));
    }
  };

  const handleSongDuplicate = (song) => {
    const duplicatedSong = {
      ...song,
      id: Date.now(),
      title: `${song?.title} (Cópia)`,
      dateAdded: new Date()
    };
    setSongs(prev => [duplicatedSong, ...prev]);
  };

  const handleSongSave = (updatedSong) => {
    setSongs(prev => prev?.map(song =>
      song?.id === updatedSong?.id ? updatedSong : song
    ));
  };

  const handleSongUpload = (uploadedFiles) => {
    const newSongs = uploadedFiles?.map(file => ({
      id: Date.now() + Math.random(),
      title: file?.metadata?.title,
      artist: file?.metadata?.artist || 'Artista Desconhecido',
      genre: file?.metadata?.genre || 'Outros',
      language: 'Português',
      difficulty: 'Médio',
      duration: file?.metadata?.duration || 180,
      rating: 0,
      playCount: 0,
      bestScore: 0,
      coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      lyrics: '',
      dateAdded: new Date()
    }));
    
    setSongs(prev => [...newSongs, ...prev]);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedSongs?.length} música(s)?`)) {
      setSongs(prev => prev?.filter(song => !selectedSongs?.includes(song?.id)));
      setSelectedSongs([]);
      setSelectionMode(false);
    }
  };

  const handleBulkEdit = () => {
    alert('Funcionalidade de edição em lote será implementada em breve!');
  };

  const handleMoveToPlaylist = () => {
    alert('Funcionalidade de playlist será implementada em breve!');
  };

  // Get active filters for chips
  const getActiveFiltersForChips = () => {
    const chips = [];
    
    Object.entries(activeFilters)?.forEach(([key, value]) => {
      if (key === 'recently_added' && value) {
        chips?.push({ type: key, value: 'true' });
      } else if (Array.isArray(value) && value?.length > 0) {
        value?.forEach(v => {
          chips?.push({ type: key, value: v });
        });
      }
    });
    
    return chips;
  };

  const activeFiltersForChips = getActiveFiltersForChips();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">Biblioteca Musical</h1>
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {filteredSongs?.length} música{filteredSongs?.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearchOverlay(true)}
            >
              <Icon name="Search" size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilterSidebar(true)}
              className="lg:hidden"
            >
              <Icon name="Filter" size={20} />
              {activeFiltersForChips?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersForChips?.length}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectionMode(!selectionMode)}
            >
              <Icon name="CheckSquare" size={20} />
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <FilterChips
          activeFilters={activeFiltersForChips}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Bulk action toolbar */}
        {selectionMode && (
          <BulkActionToolbar
            selectedCount={selectedSongs?.length}
            totalCount={filteredSongs?.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDelete={handleBulkDelete}
            onMoveToPlaylist={handleMoveToPlaylist}
            onBatchEdit={handleBulkEdit}
            onExitSelection={handleExitSelection}
          />
        )}
      </header>
      <div className="flex">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <FilterSidebar
            isOpen={true}
            onClose={() => setShowFilterSidebar(false)}
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearAllFilters}
          />
        </div>

        {/* Mobile filter sidebar */}
        <FilterSidebar
          isOpen={showFilterSidebar}
          onClose={() => setShowFilterSidebar(false)}
          filters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearAllFilters}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort and view controls */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
            <div className="flex items-center space-x-4">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                placeholder="Ordenar por"
                className="w-48"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {isLoading ? 'Carregando...' : `${filteredSongs?.length} resultado${filteredSongs?.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Content area */}
          <div className="p-4 pb-24 lg:pb-4">
            {isLoading ? (
              <EmptyState 
                type="loading" 
                onAddSong={() => setShowUploadModal(true)}
                onClearFilters={handleClearAllFilters}
              />
            ) : filteredSongs?.length === 0 ? (
              songs?.length === 0 ? (
                <EmptyState
                  type="no-songs"
                  onAddSong={() => setShowUploadModal(true)}
                  onClearFilters={handleClearAllFilters}
                />
              ) : (
                <EmptyState
                  type="no-results"
                  searchQuery={searchQuery}
                  activeFiltersCount={activeFiltersForChips?.length}
                  onAddSong={() => setShowUploadModal(true)}
                  onClearFilters={handleClearAllFilters}
                />
              )
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredSongs?.map((song) => (
                  <SongCard
                    key={song?.id}
                    song={song}
                    isSelected={selectedSongs?.includes(song?.id)}
                    onSelect={handleSongSelect}
                    onEdit={handleSongEdit}
                    onDelete={handleSongDelete}
                    onDuplicate={handleSongDuplicate}
                    onPlay={handleSongPlay}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating action button */}
      <Button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Icon name="Plus" size={24} />
      </Button>
      {/* Modals */}
      <SongUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleSongUpload}
      />
      <SongDetailModal
        isOpen={showDetailModal}
        song={selectedSong}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSong(null);
        }}
        onSave={handleSongSave}
      />
      <SearchOverlay
        isOpen={showSearchOverlay}
        onClose={() => setShowSearchOverlay(false)}
        searchScope="library"
      />
      {/* Bottom navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default MusicLibraryManagement;