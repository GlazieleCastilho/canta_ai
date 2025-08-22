import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AudioControls = ({
  isPlaying = false,
  onPlayPause,
  currentTime = 0,
  duration = 180,
  onSeek,
  musicVolume = 0.7,
  micVolume = 0.8,
  onMusicVolumeChange,
  onMicVolumeChange,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [musicLevel, setMusicLevel] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const progressRef = useRef(null);

  // Simulate audio levels
  useEffect(() => {
    if (!isPlaying) {
      setMusicLevel(0);
      setMicLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setMusicLevel(Math.random() * 0.8 + 0.2);
      setMicLevel(Math.random() * 0.6 + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef?.current || !onSeek) return;
    
    const rect = progressRef?.current?.getBoundingClientRect();
    const clickX = e?.clientX - rect?.left;
    const percentage = clickX / rect?.width;
    const newTime = percentage * duration;
    
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const handleProgressDrag = (e) => {
    if (!isDragging || !progressRef?.current || !onSeek) return;
    
    const rect = progressRef?.current?.getBoundingClientRect();
    const dragX = e?.clientX - rect?.left;
    const percentage = dragX / rect?.width;
    const newTime = percentage * duration;
    
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const renderVolumeSlider = (label, volume, onChange, level, icon) => (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2 min-w-[80px]">
        <Icon name={icon} size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex-1 flex items-center space-x-3">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onChange(parseFloat(e?.target?.value))}
          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="w-12 text-xs font-mono text-muted-foreground text-right">
          {Math.round(volume * 100)}%
        </div>
      </div>

      {/* Level meter */}
      <div className="flex space-x-1">
        {[...Array(8)]?.map((_, i) => (
          <div
            key={i}
            className={`
              w-1 h-4 rounded-full transition-colors duration-75
              ${i < level * 8 
                ? i < 5 ? 'bg-success' : i < 7 ? 'bg-warning' : 'bg-error' :'bg-muted'
              }
            `}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      {/* Progress bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          className="relative h-2 bg-muted rounded-full cursor-pointer"
          onClick={handleProgressClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={handleProgressDrag}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-150"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play controls */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Retroceder 10 segundos"
            onClick={() => onSeek && onSeek(Math.max(0, currentTime - 10))}
          >
            <Icon name="RotateCcw" size={20} />
          </Button>

          <Button
            variant="default"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Avançar 10 segundos"
            onClick={() => onSeek && onSeek(Math.min(duration, currentTime + 10))}
          >
            <Icon name="RotateCw" size={20} />
          </Button>
        </div>
      </div>

      {/* Volume controls */}
      <div className="space-y-4">
        {renderVolumeSlider('Música', musicVolume, onMusicVolumeChange, musicLevel, 'Music')}
        {renderVolumeSlider('Microfone', micVolume, onMicVolumeChange, micLevel, 'Mic')}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AudioControls;