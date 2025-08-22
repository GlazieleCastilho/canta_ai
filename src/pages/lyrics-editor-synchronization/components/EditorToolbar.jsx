import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const EditorToolbar = ({ 
  onFileUpload,
  onSave,
  onExport,
  onUndo,
  onRedo,
  onAutoSync,
  canUndo = false,
  canRedo = false,
  isAutoSyncing = false,
  currentFile = null,
  className = '' 
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('lrc');

  const handleFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleExport = (format) => {
    onExport(format);
    setShowExportOptions(false);
  };

  const exportFormats = [
    { value: 'lrc', label: 'LRC File', description: 'Formato padrão de karaokê' },
    { value: 'srt', label: 'SRT Subtitle', description: 'Formato de legenda' },
    { value: 'json', label: 'JSON Data', description: 'Dados estruturados' },
    { value: 'txt', label: 'Plain Text', description: 'Texto simples' }
  ];

  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="flex items-center justify-between p-3">
        {/* Left Section - File Operations */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="file"
              accept=".lrc,.txt,.srt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              asChild
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <Icon name="Upload" size={16} />
                Carregar
              </label>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!currentFile}
          >
            <Icon name="Save" size={16} />
            Salvar
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <Icon name="Download" size={16} />
              Exportar
            </Button>

            {showExportOptions && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <h4 className="font-medium text-sm mb-2">Formato de Exportação</h4>
                  <div className="space-y-1">
                    {exportFormats?.map((format) => (
                      <button
                        key={format?.value}
                        onClick={() => handleExport(format?.value)}
                        className="w-full text-left p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{format?.label}</div>
                        <div className="text-xs text-muted-foreground">{format?.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
          >
            <Icon name="Undo" size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
          >
            <Icon name="Redo" size={16} />
          </Button>
        </div>

        {/* Center Section - Current File Info */}
        <div className="flex-1 text-center">
          {currentFile ? (
            <div className="flex items-center justify-center space-x-2">
              <Icon name="FileText" size={16} className="text-primary" />
              <span className="text-sm font-medium truncate max-w-xs">
                {currentFile?.name || 'Arquivo sem título'}
              </span>
              <span className="text-xs text-muted-foreground">
                • {currentFile?.lastModified ? new Date(currentFile.lastModified)?.toLocaleTimeString() : 'Não salvo'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Icon name="FileText" size={16} />
              <span className="text-sm">Novo arquivo de letras</span>
            </div>
          )}
        </div>

        {/* Right Section - AI Tools */}
        <div className="flex items-center space-x-2">
          <Button
            variant={isAutoSyncing ? "secondary" : "outline"}
            size="sm"
            onClick={onAutoSync}
            disabled={isAutoSyncing}
            className="relative"
          >
            {isAutoSyncing ? (
              <>
                <div className="animate-spin mr-2">
                  <Icon name="Loader2" size={16} />
                </div>
                Sincronizando...
              </>
            ) : (
              <>
                <Icon name="Zap" size={16} />
                Auto-Sync IA
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            title="Configurações do Editor"
          >
            <Icon name="Settings" size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            title="Ajuda e Atalhos"
          >
            <Icon name="HelpCircle" size={16} />
          </Button>
        </div>
      </div>
      {/* Progress Bar for Auto-Sync */}
      {isAutoSyncing && (
        <div className="px-3 pb-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Analisando áudio e sincronizando letras automaticamente...
          </p>
        </div>
      )}
      {/* Keyboard Shortcuts Info */}
      <div className="px-3 pb-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> Salvar</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> Desfazer</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Espaço</kbd> Play/Pause</span>
          </div>
          <div className="flex items-center space-x-4">
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">F3</kbd> Buscar próximo</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+E</kbd> Exportar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;