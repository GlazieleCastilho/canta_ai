import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Input from './Input';
import Button from './Button';

const SearchOverlay = ({ 
  isOpen = false, 
  onClose,
  searchScope = 'all',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Mock data for demonstration
  const mockSongs = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', duration: '5:55' },
    { id: 2, title: 'Imagine', artist: 'John Lennon', genre: 'Pop', duration: '3:07' },
    { id: 3, title: 'Hotel California', artist: 'Eagles', genre: 'Rock', duration: '6:30' },
    { id: 4, title: 'Billie Jean', artist: 'Michael Jackson', genre: 'Pop', duration: '4:54' },
    { id: 5, title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock', duration: '8:02' },
    { id: 6, title: 'Yesterday', artist: 'The Beatles', genre: 'Pop', duration: '2:05' },
    { id: 7, title: 'Sweet Child O Mine', artist: 'Guns N Roses', genre: 'Rock', duration: '5:03' },
    { id: 8, title: 'Thriller', artist: 'Michael Jackson', genre: 'Pop', duration: '5:57' }
  ];

  useEffect(() => {
    if (isOpen) {
      searchInputRef?.current?.focus();
      // Load recent searches from localStorage
      const saved = localStorage.getItem('karaoke-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Debounced search
    const timer = setTimeout(() => {
      const filtered = mockSongs?.filter(song =>
        song?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        song?.artist?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        song?.genre?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
      
      setSearchResults(filtered);
      setIsLoading(false);
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (!searchResults?.length) return;

    switch (e?.key) {
      case 'ArrowDown':
        e?.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults?.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e?.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults?.length - 1
        );
        break;
      case 'Enter':
        e?.preventDefault();
        if (selectedIndex >= 0) {
          handleSongSelect(searchResults?.[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleSongSelect = (song) => {
    // Save to recent searches
    const newRecentSearches = [
      song,
      ...recentSearches?.filter(item => item?.id !== song?.id)
    ]?.slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('karaoke-recent-searches', JSON.stringify(newRecentSearches));

    // Navigate to performance mode with selected song
    navigate('/karaoke-performance-mode', { state: { selectedSong: song } });
    onClose();
  };

  const handleRecentSearchSelect = (song) => {
    handleSongSelect(song);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('karaoke-recent-searches');
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[1100] ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar músicas"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Search container */}
      <div className="relative h-full flex flex-col">
        {/* Search header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar por música, artista ou gênero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onKeyDown={handleKeyDown}
                className="text-lg"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar busca"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        {/* Search content */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={resultsRef}
            className="h-full overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin">
                    <Icon name="Loader2" size={20} />
                  </div>
                  <span>Buscando...</span>
                </div>
              </div>
            ) : searchQuery?.trim() ? (
              searchResults?.length > 0 ? (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {searchResults?.length} resultado{searchResults?.length !== 1 ? 's' : ''} encontrado{searchResults?.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {searchResults?.map((song, index) => (
                      <button
                        key={song?.id}
                        onClick={() => handleSongSelect(song)}
                        className={`
                          w-full text-left p-3 rounded-lg border transition-all duration-150
                          ${selectedIndex === index 
                            ? 'bg-primary/10 border-primary text-primary' :'bg-card border-border hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{song?.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {song?.artist} • {song?.genre}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <span className="text-xs text-muted-foreground font-mono">
                              {song?.duration}
                            </span>
                            <Icon name="Play" size={16} className="text-muted-foreground" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Icon name="Search" size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente buscar por outro termo ou verifique a ortografia
                  </p>
                </div>
              )
            ) : (
              <div className="p-4">
                {recentSearches?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Buscas recentes
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs"
                      >
                        Limpar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches?.map((song) => (
                        <button
                          key={`recent-${song?.id}`}
                          onClick={() => handleRecentSearchSelect(song)}
                          className="w-full text-left p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon name="Clock" size={16} className="text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{song?.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {song?.artist}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Icon name="Search" size={48} className="text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-lg font-medium mb-2">Buscar músicas</h3>
                  <p className="text-muted-foreground">
                    Digite o nome da música, artista ou gênero para começar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;