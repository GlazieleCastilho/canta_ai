import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const PerformanceHeader = ({ 
  isVisible = true,
  onExit,
  onSettings,
  currentScore = 0,
  songTitle = '',
  artistName = '',
  className = ''
}) => {
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let hideTimer;
    
    const resetTimer = () => {
      setLastActivity(Date.now());
      setIsAutoHidden(false);
      
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setIsAutoHidden(true);
      }, 3000);
    };

    const handleActivity = () => resetTimer();

    if (isVisible) {
      resetTimer();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      window.addEventListener('keydown', handleActivity);
    }

    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-[1200] 
        transition-all duration-300 ease-out
        ${isAutoHidden ? 'opacity-0 translate-y-[-100%]' : 'opacity-100 translate-y-0'}
        ${className}
      `}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
      {/* Header content */}
      <div className="relative flex items-center justify-between p-4">
        {/* Left side - Exit button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="text-foreground hover:bg-muted/50 rounded-full"
            aria-label="Sair do modo performance"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Center - Song info */}
        <div className="flex-1 text-center px-4">
          {songTitle && (
            <div className="text-foreground">
              <h1 className="text-lg font-semibold truncate">{songTitle}</h1>
              {artistName && (
                <p className="text-sm text-muted-foreground truncate">{artistName}</p>
              )}
            </div>
          )}
        </div>

        {/* Right side - Score and settings */}
        <div className="flex items-center space-x-2">
          {/* Score display */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-primary font-mono">
                {currentScore?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">pontos</div>
            </div>
          </div>

          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="text-foreground hover:bg-muted/50 rounded-full"
            aria-label="Configurações de performance"
          >
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>
      {/* Performance indicators */}
      <div className="relative px-4 pb-2">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio level indicator */}
          <div className="flex items-center space-x-1">
            <Icon name="Mic" size={16} className="text-primary" />
            <div className="flex space-x-1">
              {[...Array(5)]?.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 rounded-full transition-colors duration-150 ${
                    i < 3 ? 'bg-success' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pitch indicator */}
          <div className="flex items-center space-x-2">
            <Icon name="Music" size={16} className="text-accent" />
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-150"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PerformanceHeader;