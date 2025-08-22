import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';

// Import components
import LyricsTextEditor from './components/LyricsTextEditor';
import AudioWaveformViewer from './components/AudioWaveformViewer';
import SynchronizedPreview from './components/SynchronizedPreview';
import EditorToolbar from './components/EditorToolbar';
import TimingMarkersPanel from './components/TimingMarkersPanel';

const LyricsEditorSynchronization = () => {
  const navigate = useNavigate();
  
  // Audio state
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Lyrics state
  const [lyrics, setLyrics] = useState('');
  const [selectedLine, setSelectedLine] = useState(-1);
  const [timingMarkers, setTimingMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Editor state
  const [currentFile, setCurrentFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  
  // Preview state
  const [previewFontSize, setPreviewFontSize] = useState(24);
  const [showTimingPanel, setShowTimingPanel] = useState(true);
  
  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  
  const audioRef = useRef(null);
  const resizeRef = useRef(null);

  // Mock data for demonstration
  const mockLyrics = `[00:12.34] Imagine there's no heaven
[00:18.56] It's easy if you try
[00:24.78] No hell below us
[00:30.12] Above us only sky
[00:36.45] Imagine all the people
[00:42.67] Living for today

[00:48.89] Imagine there's no countries
[00:54.23] It isn't hard to do
[01:00.45] Nothing to kill or die for
[01:06.78] And no religion too
[01:12.34] Imagine all the people
[01:18.56] Living life in peace`;

  useEffect(() => {
    // Initialize with mock data
    setLyrics(mockLyrics);
    setDuration(180); // 3 minutes mock duration
    
    // Parse initial timing markers
    const markers = mockLyrics?.split('\n')?.map((line, index) => {
        const match = line?.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]/);
        if (match) {
          const [, minutes, seconds, centiseconds] = match;
          const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
          return {
            id: `marker-${index}`,
            time,
            lineIndex: index,
            text: line?.replace(/^\[[\d:.]+\]\s*/, ''),
            type: 'auto'
          };
        }
        return null;
      })?.filter(Boolean);
    
    setTimingMarkers(markers);
  }, []);

  // Audio playback simulation
  useEffect(() => {
    let interval;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1 * playbackSpeed;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackSpeed]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') return;
      
      switch (e?.key) {
        case ' ':
          e?.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          if (e?.ctrlKey) {
            e?.preventDefault();
            setCurrentTime(Math.max(0, currentTime - 5));
          }
          break;
        case 'ArrowRight':
          if (e?.ctrlKey) {
            e?.preventDefault();
            setCurrentTime(Math.min(duration, currentTime + 5));
          }
          break;
      }
      
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key) {
          case 's':
            e?.preventDefault();
            handleSave();
            break;
          case 'z':
            e?.preventDefault();
            handleUndo();
            break;
          case 'y':
            e?.preventDefault();
            handleRedo();
            break;
          case 'e':
            e?.preventDefault();
            handleExport('lrc');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration]);

  // Handle mouse resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const containerWidth = window.innerWidth - 64; // Account for padding
      const newWidth = Math.max(20, Math.min(80, (e?.clientX / containerWidth) * 100));
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleFileUpload = (file) => {
    if (file?.type?.startsWith('audio/')) {
      setAudioFile(file);
      // In a real app, you would load the audio file here
    } else if (file?.name?.endsWith('.lrc') || file?.name?.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLyrics(e?.target?.result);
        setCurrentFile(file);
        setHasUnsavedChanges(false);
      };
      reader?.readAsText(file);
    }
  };

  const handleLyricsChange = (newLyrics) => {
    // Save to undo stack
    setUndoStack(prev => [...prev?.slice(-19), lyrics]);
    setRedoStack([]);
    
    setLyrics(newLyrics);
    setHasUnsavedChanges(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
  };

  const handleMarkerAdd = (time) => {
    const newMarker = {
      id: `marker-${Date.now()}`,
      time,
      lineIndex: selectedLine,
      text: '',
      type: 'manual'
    };
    setTimingMarkers(prev => [...prev, newMarker]?.sort((a, b) => a?.time - b?.time));
  };

  const handleMarkerUpdate = (markerId, updatedMarker) => {
    setTimingMarkers(prev => 
      prev?.map(marker => marker?.id === markerId ? updatedMarker : marker)
    );
  };

  const handleMarkerDelete = (markerId) => {
    setTimingMarkers(prev => prev?.filter(marker => marker?.id !== markerId));
  };

  const handleMarkerSelect = (marker) => {
    setSelectedMarker(marker);
    setCurrentTime(marker?.time);
  };

  const handleTimingSet = (lineIndex, time) => {
    const existingMarker = timingMarkers?.find(m => m?.lineIndex === lineIndex);
    if (existingMarker) {
      handleMarkerUpdate(existingMarker?.id, { ...existingMarker, time });
    } else {
      handleMarkerAdd(time);
    }
  };

  const handleBulkOperation = (operation, value) => {
    switch (operation) {
      case 'shift':
        setTimingMarkers(prev => 
          prev?.map(marker => ({
            ...marker,
            time: Math.max(0, marker?.time + value)
          }))
        );
        break;
      case 'scale':
        setTimingMarkers(prev => 
          prev?.map(marker => ({
            ...marker,
            time: marker?.time * value
          }))
        );
        break;
      case 'distribute':
        // Distribute markers evenly
        if (timingMarkers?.length >= 3) {
          const sorted = [...timingMarkers]?.sort((a, b) => a?.time - b?.time);
          const first = sorted?.[0]?.time;
          const last = sorted?.[sorted?.length - 1]?.time;
          let interval = (last - first) / (sorted?.length - 1);
          
          setTimingMarkers(prev => 
            prev?.map((marker, index) => ({
              ...marker,
              time: first + (index * interval)
            }))
          );
        }
        break;
      case 'clear':
        setTimingMarkers([]);
        break;
    }
  };

  const handleSave = () => {
    // In a real app, this would save to a file or server
    console.log('Saving lyrics:', lyrics);
    setHasUnsavedChanges(false);
  };

  const handleExport = (format) => {
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'lrc':
        content = lyrics;
        filename = 'lyrics.lrc';
        break;
      case 'srt':
        // Convert LRC to SRT format
        const srtLines = lyrics?.split('\n')?.map((line, index) => {
          const match = line?.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)$/);
          if (match) {
            const [, minutes, seconds, centiseconds, text] = match;
            const startTime = `00:${minutes}:${seconds},${centiseconds}0`;
            const endTime = `00:${minutes}:${(parseInt(seconds) + 3)?.toString()?.padStart(2, '0')},${centiseconds}0`;
            return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
          }
          return '';
        })?.filter(Boolean)?.join('\n');
        content = srtLines;
        filename = 'lyrics.srt';
        break;
      case 'json':
        content = JSON.stringify({ lyrics, timingMarkers }, null, 2);
        filename = 'lyrics.json';
        break;
      case 'txt':
        content = lyrics?.replace(/^\[[\d:.]+\]\s*/gm, '');
        filename = 'lyrics.txt';
        break;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a?.click();
    URL.revokeObjectURL(url);
  };

  const handleUndo = () => {
    if (undoStack?.length > 0) {
      const previousLyrics = undoStack?.[undoStack?.length - 1];
      setRedoStack(prev => [lyrics, ...prev?.slice(0, 19)]);
      setUndoStack(prev => prev?.slice(0, -1));
      setLyrics(previousLyrics);
    }
  };

  const handleRedo = () => {
    if (redoStack?.length > 0) {
      const nextLyrics = redoStack?.[0];
      setUndoStack(prev => [...prev?.slice(-19), lyrics]);
      setRedoStack(prev => prev?.slice(1));
      setLyrics(nextLyrics);
    }
  };

  const handleAutoSync = () => {
    setIsAutoSyncing(true);
    
    // Simulate AI auto-sync process
    setTimeout(() => {
      // In a real app, this would use speech recognition and AI
      const autoMarkers = lyrics?.split('\n')?.map((line, index) => {
          if (line?.trim() && !line?.match(/^\[[\d:.]+\]/)) {
            return {
              id: `auto-${index}`,
              time: index * 4, // Mock timing every 4 seconds
              lineIndex: index,
              text: line?.trim(),
              type: 'ai-generated'
            };
          }
          return null;
        })?.filter(Boolean);
      
      setTimingMarkers(prev => [...prev, ...autoMarkers]);
      setIsAutoSyncing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Toolbar */}
      <EditorToolbar
        onFileUpload={handleFileUpload}
        onSave={handleSave}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAutoSync={handleAutoSync}
        canUndo={undoStack?.length > 0}
        canRedo={redoStack?.length > 0}
        isAutoSyncing={isAutoSyncing}
        currentFile={currentFile}
      />
      {/* Main Editor Interface */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Lyrics Editor */}
        <div 
          className="flex flex-col border-r border-border"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <LyricsTextEditor
            lyrics={lyrics}
            onLyricsChange={handleLyricsChange}
            currentTime={currentTime}
            onTimingSet={handleTimingSet}
            selectedLine={selectedLine}
            onLineSelect={setSelectedLine}
            className="flex-1"
          />
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Right Panel - Audio & Preview */}
        <div 
          className="flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Audio Waveform Viewer */}
          <div className="h-1/2 p-2">
            <AudioWaveformViewer
              audioFile={audioFile}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onTimeChange={handleTimeChange}
              onPlayPause={handlePlayPause}
              onVolumeChange={handleVolumeChange}
              volume={volume}
              playbackSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
              timingMarkers={timingMarkers}
              onMarkerAdd={handleMarkerAdd}
              onMarkerMove={handleMarkerUpdate}
              className="h-full"
            />
          </div>

          {/* Bottom Section - Preview & Timing Panel */}
          <div className="h-1/2 flex">
            {/* Synchronized Preview */}
            <div className={`${showTimingPanel ? 'w-2/3' : 'w-full'} p-2`}>
              <SynchronizedPreview
                lyrics={lyrics}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                fontSize={previewFontSize}
                onFontSizeChange={setPreviewFontSize}
                className="h-full"
              />
            </div>

            {/* Timing Markers Panel */}
            {showTimingPanel && (
              <>
                <div className="w-px bg-border" />
                <div className="w-1/3 p-2">
                  <TimingMarkersPanel
                    markers={timingMarkers}
                    onMarkerUpdate={handleMarkerUpdate}
                    onMarkerDelete={handleMarkerDelete}
                    onMarkerSelect={handleMarkerSelect}
                    selectedMarker={selectedMarker}
                    onBulkOperation={handleBulkOperation}
                    className="h-full"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Toggle Timing Panel Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowTimingPanel(!showTimingPanel)}
        className="fixed bottom-20 right-4 z-50 bg-card border border-border shadow-lg"
      >
        <Icon name={showTimingPanel ? "PanelRightClose" : "PanelRightOpen"} size={16} />
      </Button>
      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="fixed top-16 right-4 bg-warning text-warning-foreground px-3 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">Alterações não salvas</span>
          </div>
        </div>
      )}
      {/* Bottom Navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default LyricsEditorSynchronization;