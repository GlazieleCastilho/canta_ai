import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PerformanceDetailModal = ({ 
  performance, 
  isOpen, 
  onClose,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('analytics');

  if (!isOpen || !performance) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-yellow-500';
    if (score >= 75) return 'text-gray-400';
    if (score >= 60) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getScoreRating = (score) => {
    if (score >= 90) return 'Ouro';
    if (score >= 75) return 'Prata';
    if (score >= 60) return 'Bronze';
    return 'Iniciante';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'analytics', label: 'Análise', icon: 'BarChart3' },
    { id: 'breakdown', label: 'Detalhamento', icon: 'PieChart' },
    { id: 'suggestions', label: 'Sugestões', icon: 'Lightbulb' }
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Pitch Accuracy Graph */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Precisão da Afinação ao Longo do Tempo</h4>
        <div className="bg-muted/30 rounded-lg p-4 h-48 flex items-end justify-center space-x-1">
          {performance?.pitchData?.map((value, index) => (
            <div
              key={index}
              className="bg-primary/70 rounded-t-sm transition-all duration-150"
              style={{
                width: '4px',
                height: `${(value / 100) * 160}px`,
                minHeight: '4px'
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Início</span>
          <span>Meio</span>
          <span>Fim</span>
        </div>
      </div>

      {/* Timing Precision Heatmap */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Mapa de Precisão do Tempo</h4>
        <div className="grid grid-cols-10 gap-1">
          {performance?.timingHeatmap?.map((intensity, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: `rgba(99, 102, 241, ${intensity / 100})`
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Baixa precisão</span>
          <span>Alta precisão</span>
        </div>
      </div>

      {/* Vocal Range Analysis */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Análise do Alcance Vocal</h4>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Nota mais baixa</span>
            <span className="font-medium text-foreground">{performance?.vocalRange?.lowest}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Nota mais alta</span>
            <span className="font-medium text-foreground">{performance?.vocalRange?.highest}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Alcance total</span>
            <span className="font-medium text-foreground">{performance?.vocalRange?.range} semitons</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreakdown = () => (
    <div className="space-y-4">
      {performance?.scoreBreakdown?.map((component, index) => (
        <div key={index} className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">{component?.name}</span>
              <Icon 
                name="HelpCircle" 
                size={16} 
                className="text-muted-foreground cursor-help" 
                title={component?.description}
              />
            </div>
            <span className="font-semibold text-foreground">{component?.score}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${component?.score}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Peso: {component?.weight}% do total
          </div>
        </div>
      ))}
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      {performance?.suggestions?.map((suggestion, index) => (
        <div key={index} className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              suggestion?.priority === 'high' ? 'bg-error/20 text-error' :
              suggestion?.priority === 'medium'? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
            }`}>
              <Icon name={suggestion?.icon} size={16} />
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-foreground mb-1">{suggestion?.title}</h5>
              <p className="text-sm text-muted-foreground mb-2">{suggestion?.description}</p>
              {suggestion?.tips && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {suggestion?.tips?.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-2">
                      <Icon name="ArrowRight" size={12} className="mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[1200] ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground truncate">
                {performance?.songTitle}
              </h2>
              <p className="text-muted-foreground truncate">{performance?.artist}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span>{new Date(performance.date)?.toLocaleDateString('pt-BR')}</span>
                <span>{formatDuration(performance?.duration)}</span>
                {performance?.type === 'duet' && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={14} />
                    <span>Dueto</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 ml-4">
              <div className="text-center">
                <div className={`text-3xl font-bold font-mono ${getScoreColor(performance?.score)}`}>
                  {performance?.score}
                </div>
                <div className={`text-sm font-medium ${getScoreColor(performance?.score)}`}>
                  {getScoreRating(performance?.score)}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fechar detalhes"
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab?.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'breakdown' && renderBreakdown()}
            {activeTab === 'suggestions' && renderSuggestions()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                iconName="Share"
                iconPosition="left"
                iconSize={16}
              >
                Compartilhar
              </Button>
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Exportar
              </Button>
            </div>
            
            <Button
              variant="default"
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={16}
            >
              Cantar Novamente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDetailModal;