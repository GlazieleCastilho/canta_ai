import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AudioWaveformViewer = ({ 
  audioFile = null,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onTimeChange,
  onPlayPause,
  onVolumeChange,
  volume = 1,
  playbackSpeed = 1,
  onSpeedChange,
  timingMarkers = [],
  onMarkerAdd,
  onMarkerMove,
  className = '' 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Mock waveform data for demonstration
  const mockWaveformData = Array.from({ length: 1000 }, (_, i) => 
    Math.sin(i * 0.1) * 0.5 + Math.random() * 0.3 - 0.15
  );

  useEffect(() => {
    drawWaveform();
  }, [zoomLevel, currentTime, timingMarkers, duration]);

  const drawWaveform = () => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas?.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.fillStyle = 'rgb(15, 23, 42)'; // bg-background
    ctx?.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = 'rgb(100, 116, 139)'; // text-muted-foreground
    ctx.lineWidth = 1;
    ctx?.beginPath();

    const samplesPerPixel = mockWaveformData?.length / (width * zoomLevel);
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      const sampleIndex = Math.floor(x * samplesPerPixel);
      if (sampleIndex < mockWaveformData?.length) {
        const amplitude = mockWaveformData?.[sampleIndex];
        const y = centerY + amplitude * (height * 0.4);
        
        if (x === 0) {
          ctx?.moveTo(x, y);
        } else {
          ctx?.lineTo(x, y);
        }
      }
    }
    ctx?.stroke();

    // Draw current time indicator
    if (duration > 0) {
      const timePosition = (currentTime / duration) * width * zoomLevel;
      if (timePosition >= 0 && timePosition <= width) {
        ctx.strokeStyle = 'rgb(99, 102, 241)'; // text-primary
        ctx.lineWidth = 2;
        ctx?.beginPath();
        ctx?.moveTo(timePosition, 0);
        ctx?.lineTo(timePosition, height);
        ctx?.stroke();
      }
    }

    // Draw timing markers
    timingMarkers?.forEach((marker, index) => {
      if (duration > 0) {
        const markerPosition = (marker?.time / duration) * width * zoomLevel;
        if (markerPosition >= 0 && markerPosition <= width) {
          ctx.fillStyle = 'rgb(236, 72, 153)'; // text-secondary
          ctx?.fillRect(markerPosition - 1, 0, 2, height);
          
          // Draw marker label
          ctx.fillStyle = 'rgb(248, 250, 252)'; // text-foreground
          ctx.font = '10px Inter';
          ctx?.fillText(`${index + 1}`, markerPosition + 3, 15);
        }
      }
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef?.current;
    if (!canvas || !duration) return;

    const rect = canvas?.getBoundingClientRect();
    let x = e?.clientX - rect?.left;
    const clickTime = (x / (canvas?.width * zoomLevel)) * duration;
    
    onTimeChange(Math.max(0, Math.min(clickTime, duration)));
  };

  const handleCanvasDoubleClick = (e) => {
    const canvas = canvasRef?.current;
    if (!canvas || !duration) return;

    const rect = canvas?.getBoundingClientRect();
    let x = e?.clientX - rect?.left;
    const markerTime = (x / (canvas?.width * zoomLevel)) * duration;
    
    onMarkerAdd(Math.max(0, Math.min(markerTime, duration)));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e?.clientX);
    setDragStartTime(currentTime);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !duration) return;

    const deltaX = e?.clientX - dragStartX;
    const deltaTime = (deltaX / (canvasRef?.current?.width * zoomLevel)) * duration;
    const newTime = Math.max(0, Math.min(dragStartTime + deltaTime, duration));
    
    onTimeChange(newTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}.${ms?.toString()?.padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={`flex flex-col h-full bg-card border border-border rounded-lg ${className}`}>
      {/* Waveform Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="AudioWaveform" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Visualizador de Áudio</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
            disabled={zoomLevel <= 0.5}
          >
            <Icon name="ZoomOut" size={16} />
          </Button>
          
          <span className="text-sm text-muted-foreground font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))}
            disabled={zoomLevel >= 5}
          >
            <Icon name="ZoomIn" size={16} />
          </Button>
        </div>
      </div>
      {/* Waveform Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full"
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
        />
        
        {!audioFile && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <Icon name="Upload" size={48} className="text-muted-foreground mb-4 mx-auto" />
              <p className="text-muted-foreground">Carregue um arquivo de áudio para visualizar</p>
            </div>
          </div>
        )}
      </div>
      {/* Timeline */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(0)}</span>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            disabled={!audioFile}
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTimeChange(Math.max(0, currentTime - 5))}
            disabled={!audioFile}
          >
            <Icon name="SkipBack" size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTimeChange(Math.min(duration, currentTime + 5))}
            disabled={!audioFile}
          >
            <Icon name="SkipForward" size={16} />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <Icon name="Gauge" size={16} className="text-muted-foreground" />
            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e?.target?.value))}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            >
              {speedOptions?.map(speed => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Icon name="Volume2" size={16} className="text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e?.target?.value))}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground font-mono w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
      {/* Instructions */}
      <div className="px-3 py-2 bg-muted/20 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Dicas:</strong> Clique para navegar • Duplo clique para adicionar marcador • 
          Arraste para scrub • Use zoom para precisão
        </p>
      </div>
    </div>
  );
};

export default AudioWaveformViewer;