import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PerformanceCard = ({ 
  performance, 
  onPlayback, 
  onViewDetails,
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-yellow-500'; // Gold
    if (score >= 75) return 'text-gray-400'; // Silver
    if (score >= 60) return 'text-amber-600'; // Bronze
    return 'text-muted-foreground';
  };

  const getScoreRating = (score) => {
    if (score >= 90) return 'Ouro';
    if (score >= 75) return 'Prata';
    if (score >= 60) return 'Bronze';
    return 'Iniciante';
  };

  const handlePlayback = () => {
    setIsPlaying(!isPlaying);
    onPlayback(performance?.id, !isPlaying);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{performance?.songTitle}</h3>
          <p className="text-sm text-muted-foreground truncate">{performance?.artist}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(performance.date)?.toLocaleDateString('pt-BR')} • {formatDuration(performance?.duration)}
          </p>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-end ml-3">
          <div className={`text-2xl font-bold font-mono ${getScoreColor(performance?.score)}`}>
            {performance?.score}
          </div>
          <div className={`text-xs font-medium ${getScoreColor(performance?.score)}`}>
            {getScoreRating(performance?.score)}
          </div>
        </div>
      </div>
      {/* Waveform Visualization */}
      <div className="mb-3">
        <div className="flex items-center justify-center h-12 bg-muted/50 rounded border overflow-hidden">
          <div className="flex items-end space-x-1 h-8">
            {performance?.waveform?.map((height, index) => (
              <div
                key={index}
                className="bg-primary/60 rounded-sm transition-all duration-150"
                style={{
                  width: '2px',
                  height: `${height}%`,
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {performance?.metrics?.pitchAccuracy}%
          </div>
          <div className="text-xs text-muted-foreground">Afinação</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {performance?.metrics?.timing}%
          </div>
          <div className="text-xs text-muted-foreground">Tempo</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {performance?.metrics?.consistency}%
          </div>
          <div className="text-xs text-muted-foreground">Consistência</div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayback}
            iconName={isPlaying ? "Pause" : "Play"}
            iconPosition="left"
            iconSize={16}
          >
            {isPlaying ? 'Pausar' : 'Reproduzir'}
          </Button>
          
          {performance?.type === 'duet' && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Icon name="Users" size={14} />
              <span>Dueto</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(performance)}
          iconName="BarChart3"
          iconPosition="left"
          iconSize={16}
        >
          Detalhes
        </Button>
      </div>
    </div>
  );
};

export default PerformanceCard;