import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ScoreDisplay = ({
  currentScore = 0,
  pitchAccuracy = 0,
  timingAccuracy = 0,
  overallAccuracy = 0,
  streak = 0,
  isVisible = true,
  className = ''
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  // Animate score changes
  useEffect(() => {
    if (currentScore === animatedScore) return;

    const difference = currentScore - animatedScore;
    const increment = Math.ceil(Math.abs(difference) / 20);
    
    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        if (Math.abs(currentScore - prev) <= increment) {
          return currentScore;
        }
        return prev + (difference > 0 ? increment : -increment);
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentScore, animatedScore]);

  // Celebration effect for excellent performance
  useEffect(() => {
    if (currentScore > lastScore && overallAccuracy > 90) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    setLastScore(currentScore);
  }, [currentScore, overallAccuracy, lastScore]);

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyBgColor = (accuracy) => {
    if (accuracy >= 90) return 'bg-success';
    if (accuracy >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 95) return 'LENDÁRIO';
    if (accuracy >= 90) return 'PERFEITO';
    if (accuracy >= 85) return 'EXCELENTE';
    if (accuracy >= 70) return 'BOM';
    if (accuracy >= 50) return 'REGULAR';
    return 'PRATIQUE MAIS';
  };

  const renderMetric = (label, value, icon, color = 'text-foreground') => (
    <div className="bg-background/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center space-x-1 mb-1">
        <Icon name={icon} size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color} font-mono`}>
        {Math.round(value)}%
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-success/90 text-white px-6 py-3 rounded-full font-bold text-lg animate-bounce">
            🎉 INCRÍVEL! 🎉
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Main score display */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Pontuação Atual</div>
          <div className="text-4xl font-bold text-primary font-mono mb-2">
            {animatedScore?.toLocaleString()}
          </div>
          
          {/* Performance level */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            overallAccuracy >= 90 ? 'bg-success/20 text-success' :
            overallAccuracy >= 70 ? 'bg-warning/20 text-warning': 'bg-error/20 text-error'
          }`}>
            {getPerformanceLevel(overallAccuracy)}
          </div>
        </div>

        {/* Accuracy metrics */}
        <div className="grid grid-cols-3 gap-2">
          {renderMetric('Tom', pitchAccuracy, 'Music', getAccuracyColor(pitchAccuracy))}
          {renderMetric('Tempo', timingAccuracy, 'Clock', getAccuracyColor(timingAccuracy))}
          {renderMetric('Geral', overallAccuracy, 'Target', getAccuracyColor(overallAccuracy))}
        </div>

        {/* Streak indicator */}
        {streak > 0 && (
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-sm font-medium">Sequência</span>
              <span className="text-lg font-bold text-primary font-mono">{streak}</span>
              <Icon name="Fire" size={16} className="text-secondary" />
            </div>
          </div>
        )}

        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className={`font-medium ${getAccuracyColor(overallAccuracy)}`}>
              {Math.round(overallAccuracy)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getAccuracyBgColor(overallAccuracy)}`}
              style={{ width: `${Math.max(0, Math.min(100, overallAccuracy))}%` }}
            />
          </div>
        </div>

        {/* Performance tips */}
        <div className="bg-background/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-accent mb-1">Dica:</div>
              <div className="text-muted-foreground">
                {overallAccuracy < 50 ? 'Tente cantar mais próximo do tom original' :
                 overallAccuracy < 70 ? 'Mantenha o ritmo e ajuste o tom gradualmente' :
                 overallAccuracy < 90 ? 'Você está indo bem! Foque na precisão do tempo': 'Performance excelente! Continue assim!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;