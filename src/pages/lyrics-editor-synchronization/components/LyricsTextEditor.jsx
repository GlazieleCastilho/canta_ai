import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LyricsTextEditor = ({ 
  lyrics = '', 
  onLyricsChange, 
  currentTime = 0,
  onTimingSet,
  selectedLine = -1,
  onLineSelect,
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lyricsLines = lyrics?.split('\n');

  useEffect(() => {
    if (textareaRef?.current && lineNumbersRef?.current) {
      const syncScroll = () => {
        lineNumbersRef.current.scrollTop = textareaRef?.current?.scrollTop;
      };
      
      textareaRef?.current?.addEventListener('scroll', syncScroll);
      return () => {
        if (textareaRef?.current) {
          textareaRef?.current?.removeEventListener('scroll', syncScroll);
        }
      };
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e?.ctrlKey || e?.metaKey) {
      switch (e?.key) {
        case 'f':
          e?.preventDefault();
          setShowFindReplace(true);
          break;
        case 's':
          e?.preventDefault();
          // Save functionality would go here
          break;
        case 'z':
          e?.preventDefault();
          // Undo functionality would go here
          break;
        case 'y':
          e?.preventDefault();
          // Redo functionality would go here
          break;
      }
    }

    if (e?.key === 'F3') {
      e?.preventDefault();
      // Find next functionality would go here
    }
  };

  const handleLineClick = (lineIndex) => {
    onLineSelect(lineIndex);
    
    // Focus on the clicked line in textarea
    if (textareaRef?.current) {
      const lines = lyrics?.split('\n');
      let position = 0;
      for (let i = 0; i < lineIndex; i++) {
        position += lines?.[i]?.length + 1; // +1 for newline
      }
      textareaRef?.current?.focus();
      textareaRef?.current?.setSelectionRange(position, position + lines?.[lineIndex]?.length);
    }
  };

  const handleTimingSet = (lineIndex) => {
    const timeCode = `[${formatTime(currentTime)}]`;
    const lines = lyrics?.split('\n');
    
    if (lines?.[lineIndex] && !lines?.[lineIndex]?.startsWith('[')) {
      lines[lineIndex] = `${timeCode} ${lines?.[lineIndex]}`;
      onLyricsChange(lines?.join('\n'));
    }
    
    onTimingSet(lineIndex, currentTime);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}.${ms?.toString()?.padStart(2, '0')}`;
  };

  const handleFindReplace = () => {
    if (!searchQuery) return;
    
    const newLyrics = lyrics?.replace(new RegExp(searchQuery, 'g'), replaceQuery);
    onLyricsChange(newLyrics);
    setShowFindReplace(false);
    setSearchQuery('');
    setReplaceQuery('');
  };

  return (
    <div className={`flex flex-col h-full bg-card border border-border rounded-lg ${className}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="FileText" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Editor de Letras</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLineNumbers(!lineNumbers)}
            className={lineNumbers ? 'text-primary' : 'text-muted-foreground'}
          >
            <Icon name="Hash" size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFindReplace(!showFindReplace)}
          >
            <Icon name="Search" size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const formatted = lyricsLines?.map(line => line?.trim())?.filter(line => line?.length > 0)?.join('\n');
              onLyricsChange(formatted);
            }}
          >
            <Icon name="AlignLeft" size={16} />
          </Button>
        </div>
      </div>
      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className="p-3 bg-muted/30 border-b border-border">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="text-sm"
            />
            <Input
              placeholder="Substituir por..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e?.target?.value)}
              className="text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFindReplace}
              disabled={!searchQuery}
            >
              Substituir Tudo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFindReplace(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}
      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        {lineNumbers && (
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-muted/20 border-r border-border overflow-hidden text-right pr-2 py-3 text-sm font-mono text-muted-foreground select-none"
            style={{ lineHeight: '1.5' }}
          >
            {lyricsLines?.map((_, index) => (
              <div 
                key={index}
                className={`cursor-pointer hover:bg-muted/30 px-1 ${
                  selectedLine === index ? 'bg-primary/20 text-primary' : ''
                }`}
                onClick={() => handleLineClick(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Text Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={lyrics}
            onChange={(e) => onLyricsChange(e?.target?.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Digite ou cole as letras aqui...\n\nDica: Use o formato LRC para sincronização:\n[00:12.34] Primeira linha da música\n[00:18.56] Segunda linha da música\n\nOu adicione timing clicando no botão de tempo ao lado de cada linha.`}
            className="w-full h-full p-3 bg-transparent text-foreground placeholder-muted-foreground resize-none border-none outline-none font-mono text-sm leading-6"
            style={{ lineHeight: '1.5' }}
            spellCheck={false}
          />
          
          {/* Timing Buttons Overlay */}
          <div className="absolute right-2 top-3 space-y-1 pointer-events-none">
            {lyricsLines?.map((line, index) => (
              line?.trim() && (
                <div 
                  key={index}
                  className="flex items-center justify-end h-6 pointer-events-auto"
                  style={{ marginTop: index === 0 ? '0' : '0.5rem' }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTimingSet(index)}
                    className="h-6 px-2 text-xs opacity-60 hover:opacity-100"
                    title={`Definir timing para linha ${index + 1}`}
                  >
                    <Icon name="Clock" size={12} />
                  </Button>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      {/* Editor Footer */}
      <div className="flex items-center justify-between p-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Linhas: {lyricsLines?.length}</span>
          <span>Caracteres: {lyrics?.length}</span>
          <span>Formato: LRC</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Ctrl+F: Buscar</span>
          <span>Ctrl+S: Salvar</span>
          <span>F3: Próximo</span>
        </div>
      </div>
    </div>
  );
};

export default LyricsTextEditor;