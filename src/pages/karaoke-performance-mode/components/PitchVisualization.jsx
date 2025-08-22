import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const PitchVisualization = ({
  userPitch = 0,
  referencePitch = 0,
  isActive = false,
  accuracy = 0,
  className = ''
}) => {
  const [pitchHistory, setPitchHistory] = useState([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const canvasRef = useRef(null);

  // Simulate pitch data
  useEffect(() => {
    if (!isActive) {
      setPitchHistory([]);
      return;
    }

    const interval = setInterval(() => {
      const newUserPitch = 200 + Math.sin(Date.now() / 1000) * 50 + Math.random() * 20;
      const newReferencePitch = 220 + Math.sin(Date.now() / 800) * 30;
      
      setPitchHistory(prev => {
        const newHistory = [...prev, {
          user: newUserPitch,
          reference: newReferencePitch,
          timestamp: Date.now(),
          accuracy: Math.max(0, 100 - Math.abs(newUserPitch - newReferencePitch) * 2)
        }];
        return newHistory?.slice(-50); // Keep last 50 points
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !isActive) return;

    const ctx = canvas?.getContext('2d');
    const animate = () => {
      drawPitchCurves(ctx, canvas?.width, canvas?.height);
      setAnimationFrame(prev => prev + 1);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [pitchHistory, isActive]);

  const drawPitchCurves = (ctx, width, height) => {
    ctx?.clearRect(0, 0, width, height);
    
    if (pitchHistory?.length < 2) return;

    const maxPitch = 400;
    const minPitch = 100;
    const pitchRange = maxPitch - minPitch;

    // Draw reference pitch line
    ctx.strokeStyle = '#6366F1'; // primary color
    ctx.lineWidth = 3;
    ctx?.setLineDash([]);
    ctx?.beginPath();
    
    pitchHistory?.forEach((point, index) => {
      const x = (index / (pitchHistory?.length - 1)) * width;
      const y = height - ((point?.reference - minPitch) / pitchRange) * height;
      
      if (index === 0) {
        ctx?.moveTo(x, y);
      } else {
        ctx?.lineTo(x, y);
      }
    });
    ctx?.stroke();

    // Draw user pitch line
    ctx.strokeStyle = '#10B981'; // success color
    ctx.lineWidth = 4;
    ctx?.beginPath();
    
    pitchHistory?.forEach((point, index) => {
      const x = (index / (pitchHistory?.length - 1)) * width;
      const y = height - ((point?.user - minPitch) / pitchRange) * height;
      
      if (index === 0) {
        ctx?.moveTo(x, y);
      } else {
        ctx?.lineTo(x, y);
      }
    });
    ctx?.stroke();

    // Draw accuracy indicators
    pitchHistory?.forEach((point, index) => {
      const x = (index / (pitchHistory?.length - 1)) * width;
      const userY = height - ((point?.user - minPitch) / pitchRange) * height;
      
      const accuracy = point?.accuracy;
      let color;
      if (accuracy > 80) color = '#10B981'; // success
      else if (accuracy > 60) color = '#F59E0B'; // warning
      else color = '#EF4444'; // error

      ctx.fillStyle = color;
      ctx?.beginPath();
      ctx?.arc(x, userY, 3, 0, 2 * Math.PI);
      ctx?.fill();
    });
  };

  const getAccuracyColor = (acc) => {
    if (acc >= 90) return 'text-success';
    if (acc >= 70) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyLabel = (acc) => {
    if (acc >= 95) return 'Perfeito!';
    if (acc >= 85) return 'Excelente';
    if (acc >= 70) return 'Bom';
    if (acc >= 50) return 'Regular';
    return 'Tente novamente';
  };

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="font-semibold">Visualização de Tom</h3>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Precisão: </span>
              <span className={`font-bold ${getAccuracyColor(accuracy)}`}>
                {Math.round(accuracy)}%
              </span>
            </div>
            <div className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
              {getAccuracyLabel(accuracy)}
            </div>
          </div>
        )}
      </div>

      {isActive ? (
        <div className="space-y-4">
          {/* Canvas for pitch visualization */}
          <div className="relative bg-background/50 rounded-lg p-4 h-32">
            <canvas
              ref={canvasRef}
              width={400}
              height={96}
              className="w-full h-full"
            />
            
            {/* Legend */}
            <div className="absolute top-2 right-2 text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-primary"></div>
                <span className="text-muted-foreground">Tom de referência</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-success"></div>
                <span className="text-muted-foreground">Seu tom</span>
              </div>
            </div>
          </div>

          {/* Pitch indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Tom Atual</div>
              <div className="text-lg font-bold text-success font-mono">
                {Math.round(userPitch)} Hz
              </div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Tom Alvo</div>
              <div className="text-lg font-bold text-primary font-mono">
                {Math.round(referencePitch)} Hz
              </div>
            </div>
          </div>

          {/* Accuracy meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precisão do Tom</span>
              <span className={`font-medium ${getAccuracyColor(accuracy)}`}>
                {Math.round(accuracy)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  accuracy >= 90 ? 'bg-success' : 
                  accuracy >= 70 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, accuracy))}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Mic" size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground">
            <div className="font-medium mb-1">Aguardando entrada de áudio</div>
            <div className="text-sm">Comece a cantar para ver a visualização do tom</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchVisualization;