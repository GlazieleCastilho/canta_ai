import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TimingMarkersPanel = ({ 
  markers = [],
  onMarkerUpdate,
  onMarkerDelete,
  onMarkerSelect,
  selectedMarker = null,
  onBulkOperation,
  className = '' 
}) => {
  const [editingMarker, setEditingMarker] = useState(null);
  const [bulkOffset, setBulkOffset] = useState(0);
  const [showBulkTools, setShowBulkTools] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}.${ms?.toString()?.padStart(2, '0')}`;
  };

  const parseTime = (timeString) => {
    const match = timeString?.match(/^(\d{2}):(\d{2})\.(\d{2})$/);
    if (match) {
      const [, minutes, seconds, centiseconds] = match;
      return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
    }
    return 0;
  };

  const handleMarkerEdit = (marker, newTime) => {
    const parsedTime = parseTime(newTime);
    onMarkerUpdate(marker?.id, { ...marker, time: parsedTime });
    setEditingMarker(null);
  };

  const handleBulkShift = (direction) => {
    const offset = direction === 'forward' ? Math.abs(bulkOffset) : -Math.abs(bulkOffset);
    onBulkOperation('shift', offset);
  };

  const handleBulkScale = (factor) => {
    onBulkOperation('scale', factor);
  };

  const sortedMarkers = [...markers]?.sort((a, b) => a?.time - b?.time);

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Marcadores de Tempo</h3>
          <span className="text-sm text-muted-foreground">({markers?.length})</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBulkTools(!showBulkTools)}
            title="Ferramentas em lote"
          >
            <Icon name="Settings2" size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkOperation('clear')}
            title="Limpar todos os marcadores"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
      {/* Bulk Tools */}
      {showBulkTools && (
        <div className="p-3 bg-muted/20 border-b border-border">
          <h4 className="text-sm font-medium mb-3">Operações em Lote</h4>
          
          <div className="space-y-3">
            {/* Time Shift */}
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0.5"
                value={bulkOffset}
                onChange={(e) => setBulkOffset(parseFloat(e?.target?.value) || 0)}
                className="w-20 text-sm"
                step="0.1"
              />
              <span className="text-sm text-muted-foreground">segundos</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkShift('backward')}
                disabled={markers?.length === 0}
              >
                <Icon name="ChevronLeft" size={14} />
                Atrasar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkShift('forward')}
                disabled={markers?.length === 0}
              >
                Adiantar
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>

            {/* Time Scale */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Escala:</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkScale(0.9)}
                disabled={markers?.length === 0}
              >
                0.9x
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkScale(1.1)}
                disabled={markers?.length === 0}
              >
                1.1x
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkOperation('distribute')}
                disabled={markers?.length < 3}
              >
                <Icon name="AlignJustify" size={14} />
                Distribuir
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Markers List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedMarkers?.length > 0 ? (
          <div className="divide-y divide-border">
            {sortedMarkers?.map((marker, index) => (
              <div
                key={marker?.id}
                className={`p-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                  selectedMarker?.id === marker?.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
                onClick={() => onMarkerSelect(marker)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </div>
                    
                    <div>
                      {editingMarker === marker?.id ? (
                        <Input
                          type="text"
                          defaultValue={formatTime(marker?.time)}
                          onBlur={(e) => handleMarkerEdit(marker, e?.target?.value)}
                          onKeyDown={(e) => {
                            if (e?.key === 'Enter') {
                              handleMarkerEdit(marker, e?.target?.value);
                            } else if (e?.key === 'Escape') {
                              setEditingMarker(null);
                            }
                          }}
                          className="w-24 text-sm font-mono"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="font-mono text-sm cursor-pointer hover:text-primary"
                          onClick={(e) => {
                            e?.stopPropagation();
                            setEditingMarker(marker?.id);
                          }}
                        >
                          {formatTime(marker?.time)}
                        </div>
                      )}
                      
                      {marker?.text && (
                        <div className="text-xs text-muted-foreground truncate max-w-48">
                          {marker?.text}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        setEditingMarker(marker?.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="Edit2" size={12} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onMarkerDelete(marker?.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </div>

                {/* Marker Details */}
                {selectedMarker?.id === marker?.id && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Posição:</span> {formatTime(marker?.time)}
                      </div>
                      <div>
                        <span className="font-medium">Linha:</span> {marker?.lineIndex + 1 || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Duração:</span> 
                        {index < sortedMarkers?.length - 1 
                          ? formatTime(sortedMarkers?.[index + 1]?.time - marker?.time)
                          : '-'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {marker?.type || 'Manual'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="MapPin" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">Nenhum marcador de tempo</p>
            <p className="text-xs">
              Clique duplo na forma de onda ou use o botão de timing no editor para adicionar marcadores
            </p>
          </div>
        )}
      </div>
      {/* Panel Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Total: {markers?.length} marcadores</span>
            {markers?.length > 0 && (
              <span>
                Duração: {formatTime(Math.max(...markers?.map(m => m?.time)))}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Duplo clique para editar tempo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimingMarkersPanel;