import React, { useState, useEffect, useRef } from 'react';

const LyricsDisplay = ({ 
  currentLyrics = [],
  currentTime = 0,
  isPlaying = false,
  fontSize = 'text-2xl',
  fontColor = 'text-foreground',
  backgroundColor = 'bg-background/80',
  className = ''
}) => {
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Mock lyrics data with timing
  const mockLyrics = [
    { 
      id: 1, 
      startTime: 0, 
      endTime: 4, 
      text: "Imagine there\'s no heaven",
      words: [
        { text: "Imagine", startTime: 0, endTime: 0.8 },
        { text: "there\'s", startTime: 0.8, endTime: 1.2 },
        { text: "no", startTime: 1.2, endTime: 1.6 },
        { text: "heaven", startTime: 1.6, endTime: 4 }
      ]
    },
    { 
      id: 2, 
      startTime: 4, 
      endTime: 8, 
      text: "It\'s easy if you try",
      words: [
        { text: "It's", startTime: 4, endTime: 4.5 },
        { text: "easy", startTime: 4.5, endTime: 5.2 },
        { text: "if", startTime: 5.2, endTime: 5.5 },
        { text: "you", startTime: 5.5, endTime: 6 },
        { text: "try", startTime: 6, endTime: 8 }
      ]
    },
    { 
      id: 3, 
      startTime: 8, 
      endTime: 12, 
      text: "No hell below us",
      words: [
        { text: "No", startTime: 8, endTime: 8.5 },
        { text: "hell", startTime: 8.5, endTime: 9.2 },
        { text: "below", startTime: 9.2, endTime: 10 },
        { text: "us", startTime: 10, endTime: 12 }
      ]
    },
    { 
      id: 4, 
      startTime: 12, 
      endTime: 16, 
      text: "Above us only sky",
      words: [
        { text: "Above", startTime: 12, endTime: 12.8 },
        { text: "us", startTime: 12.8, endTime: 13.2 },
        { text: "only", startTime: 13.2, endTime: 14 },
        { text: "sky", startTime: 14, endTime: 16 }
      ]
    }
  ];

  const displayLyrics = currentLyrics?.length > 0 ? currentLyrics : mockLyrics;

  useEffect(() => {
    if (!isPlaying) return;

    // Find current line based on time
    const currentLine = displayLyrics?.find(line => 
      currentTime >= line?.startTime && currentTime < line?.endTime
    );

    if (currentLine) {
      const lineIndex = displayLyrics?.findIndex(line => line?.id === currentLine?.id);
      setCurrentLineIndex(lineIndex);

      // Find current word
      const currentWord = currentLine?.words?.find(word =>
        currentTime >= word?.startTime && currentTime < word?.endTime
      );

      if (currentWord) {
        const wordIndex = currentLine?.words?.findIndex(word => 
          word?.text === currentWord?.text && word?.startTime === currentWord?.startTime
        );
        setHighlightedWordIndex(wordIndex);
      } else {
        setHighlightedWordIndex(-1);
      }
    }
  }, [currentTime, isPlaying, displayLyrics]);

  useEffect(() => {
    // Auto-scroll to active line
    if (activeLineRef?.current && lyricsContainerRef?.current) {
      activeLineRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  const renderLyricLine = (line, lineIndex) => {
    const isActiveLine = lineIndex === currentLineIndex;
    const isPastLine = currentTime > line?.endTime;
    const isFutureLine = currentTime < line?.startTime;

    return (
      <div
        key={line?.id}
        ref={isActiveLine ? activeLineRef : null}
        className={`
          transition-all duration-300 ease-out py-2 px-4 rounded-lg
          ${isActiveLine ? 'scale-110 transform' : 'scale-100'}
          ${isPastLine ? 'opacity-60' : isFutureLine ? 'opacity-40' : 'opacity-100'}
        `}
      >
        <div className={`${fontSize} font-semibold leading-relaxed text-center`}>
          {line?.words && line?.words?.length > 0 ? (
            line?.words?.map((word, wordIndex) => (
              <span
                key={`${line?.id}-${wordIndex}`}
                className={`
                  inline-block mx-1 transition-all duration-200 ease-out
                  ${isActiveLine && wordIndex === highlightedWordIndex
                    ? 'text-primary bg-primary/20 px-2 py-1 rounded-md scale-105 shadow-lg'
                    : isActiveLine && wordIndex < highlightedWordIndex
                    ? 'text-success'
                    : fontColor
                  }
                `}
              >
                {word?.text}
              </span>
            ))
          ) : (
            <span className={`${isActiveLine ? 'text-primary' : fontColor}`}>
              {line?.text}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div 
        ref={lyricsContainerRef}
        className={`
          ${backgroundColor} backdrop-blur-sm rounded-xl p-6 
          max-h-96 overflow-y-auto scrollbar-hide
          border border-border/50
        `}
      >
        {displayLyrics?.length > 0 ? (
          <div className="space-y-4">
            {displayLyrics?.map((line, index) => renderLyricLine(line, index))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              Nenhuma letra disponível
            </div>
            <div className="text-muted-foreground text-sm mt-2">
              Carregue uma música com letras sincronizadas
            </div>
          </div>
        )}
      </div>
      {/* Progress indicator */}
      {displayLyrics?.length > 0 && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {displayLyrics?.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentLineIndex 
                    ? 'bg-primary scale-125' 
                    : index < currentLineIndex 
                    ? 'bg-success' :'bg-muted'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;