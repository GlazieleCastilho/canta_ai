import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SynchronizedPreview = ({ 
  lyrics = '',
  currentTime = 0,
  isPlaying = false,
  onPlayPause,
  fontSize = 24,
  onFontSizeChange,
  textColor = '#F8FAFC',
  backgroundColor = '#0F172A',
  highlightColor = '#6366F1',
  className = '' 
}) => {
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Parse LRC format lyrics
    const lines = lyrics?.split('\n')?.map((line, index) => {
      const lrcMatch = line?.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)$/);
      if (lrcMatch) {
        const [, minutes, seconds, centiseconds, text] = lrcMatch;
        const timeInSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
        return {
          id: index,
          time: timeInSeconds,
          text: text?.trim(),
          original: line
        };
      }
      return {
        id: index,
        time: null,
        text: line?.trim(),
        original: line
      };
    })?.filter(line => line?.text?.length > 0);

    setParsedLyrics(lines);
  }, [lyrics]);

  useEffect(() => {
    // Find current line based on time
    let activeIndex = -1;
    for (let i = 0; i < parsedLyrics?.length; i++) {
      if (parsedLyrics?.[i]?.time !== null && parsedLyrics?.[i]?.time <= currentTime) {
        activeIndex = i;
      } else if (parsedLyrics?.[i]?.time !== null && parsedLyrics?.[i]?.time > currentTime) {
        break;
      }
    }
    setCurrentLineIndex(activeIndex);
  }, [currentTime, parsedLyrics]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getLineStyle = (index) => {
    const isActive = index === currentLineIndex;
    const isPrevious = index < currentLineIndex;
    const isNext = index > currentLineIndex;

    return {
      fontSize: `${fontSize}px`,
      color: isActive ? highlightColor : isPrevious ? `${textColor}80` : textColor,
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      opacity: isActive ? 1 : isPrevious ? 0.6 : isNext ? 0.8 : 0.7,
      fontWeight: isActive ? '600' : '400',
      textShadow: isActive ? `0 0 10px ${highlightColor}40` : 'none'
    };
  };

  const previewStyles = {
    backgroundColor,
    color: textColor,
    fontSize: `${fontSize}px`
  };

  return (
    <div className={`flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Eye" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Pré-visualização Sincronizada</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              disabled={fontSize <= 12}
            >
              <Icon name="Minus" size={14} />
            </Button>
            
            <span className="text-sm text-muted-foreground font-mono w-8 text-center">
              {fontSize}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFontSizeChange(Math.min(48, fontSize + 2))}
              disabled={fontSize >= 48}
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>

          <div className="w-px h-4 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
          </Button>
        </div>
      </div>
      {/* Preview Content */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={previewStyles}
      >
        {parsedLyrics?.length > 0 ? (
          <div className="h-full flex flex-col justify-center items-center p-8 text-center">
            {/* Previous lines */}
            <div className="space-y-2 mb-4">
              {parsedLyrics?.slice(Math.max(0, currentLineIndex - 2), currentLineIndex)?.map((line, index) => (
                  <div
                    key={line?.id}
                    className="transition-all duration-300 ease-out"
                    style={getLineStyle(currentLineIndex - 2 + index)}
                  >
                    {line?.text}
                  </div>
                ))}
            </div>

            {/* Current line */}
            {currentLineIndex >= 0 && parsedLyrics?.[currentLineIndex] && (
              <div
                className="transition-all duration-300 ease-out mb-4"
                style={getLineStyle(currentLineIndex)}
              >
                {parsedLyrics?.[currentLineIndex]?.text}
              </div>
            )}

            {/* Next lines */}
            <div className="space-y-2">
              {parsedLyrics?.slice(currentLineIndex + 1, currentLineIndex + 3)?.map((line, index) => (
                  <div
                    key={line?.id}
                    className="transition-all duration-300 ease-out"
                    style={getLineStyle(currentLineIndex + 1 + index)}
                  >
                    {line?.text}
                  </div>
                ))}
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-sm opacity-60 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>
                  {currentLineIndex + 1} / {parsedLyrics?.filter(l => l?.time !== null)?.length}
                </span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/60 transition-all duration-100"
                  style={{ 
                    width: parsedLyrics?.length > 0 
                      ? `${((currentLineIndex + 1) / parsedLyrics?.length) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="Music" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma letra sincronizada</p>
              <p className="text-sm">
                Adicione letras no editor e defina os tempos para ver a pré-visualização
              </p>
            </div>
          </div>
        )}

        {/* Playback Controls Overlay */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
          </Button>
        </div>
      </div>
      {/* Preview Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Linhas sincronizadas: {parsedLyrics?.filter(l => l?.time !== null)?.length}</span>
          <span>Linha atual: {currentLineIndex >= 0 ? currentLineIndex + 1 : '-'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: highlightColor }} />
            <span className="text-xs text-muted-foreground">Atual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-60" />
            <span className="text-xs text-muted-foreground">Anterior</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-80" />
            <span className="text-xs text-muted-foreground">Próxima</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynchronizedPreview;