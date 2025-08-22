import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PerformanceHeader from '../../components/ui/PerformanceHeader';
import LyricsDisplay from './components/LyricsDisplay';
import AudioControls from './components/AudioControls';
import PitchVisualization from './components/PitchVisualization';
import ScoreDisplay from './components/ScoreDisplay';
import PerformanceSettings from './components/PerformanceSettings';
import VisualEffects from './components/VisualEffects';

const KaraokePerformanceMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [micVolume, setMicVolume] = useState(0.8);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Performance state
  const [currentScore, setCurrentScore] = useState(0);
  const [pitchAccuracy, setPitchAccuracy] = useState(0);
  const [timingAccuracy, setTimingAccuracy] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userPitch, setUserPitch] = useState(220);
  const [referencePitch, setReferencePitch] = useState(220);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [settings, setSettings] = useState({
    keyTransposition: 0,
    tempoAdjustment: 100,
    pitchCorrection: 0,
    reverbLevel: 30,
    echoLevel: 20,
    noiseReduction: true,
    autoScroll: true,
    lyricsSize: 'medium',
    lyricsColor: 'white',
    backgroundColor: 'dark',
    visualEffects: true,
    recordPerformance: false
  });

  // Selected song from navigation state
  const selectedSong = location?.state?.selectedSong || {
    id: 1,
    title: 'Imagine',
    artist: 'John Lennon',
    duration: '3:07',
    genre: 'Pop'
  };

  // Performance simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          setIsPlaying(false);
          handlePerformanceEnd();
          return duration;
        }
        return newTime;
      });

      // Simulate performance metrics
      const newPitchAccuracy = 70 + Math.random() * 25;
      const newTimingAccuracy = 75 + Math.random() * 20;
      const newOverallAccuracy = (newPitchAccuracy + newTimingAccuracy) / 2;
      
      setPitchAccuracy(newPitchAccuracy);
      setTimingAccuracy(newTimingAccuracy);
      setOverallAccuracy(newOverallAccuracy);
      
      // Update score based on accuracy
      if (newOverallAccuracy > 80) {
        setCurrentScore(prev => prev + Math.floor(newOverallAccuracy * 10));
        setStreak(prev => prev + 1);
      } else if (newOverallAccuracy < 50) {
        setStreak(0);
      }

      // Simulate audio level
      setAudioLevel(Math.random() * 0.8 + 0.2);
      
      // Simulate pitch values
      setUserPitch(200 + Math.sin(Date.now() / 1000) * 50 + Math.random() * 20);
      setReferencePitch(220 + Math.sin(Date.now() / 800) * 30);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  const handleExit = () => {
    setIsPlaying(false);
    navigate('/dashboard-home');
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handlePerformanceEnd = () => {
    // Navigate to performance history with results
    navigate('/performance-history-scoring', {
      state: {
        performance: {
          song: selectedSong,
          score: currentScore,
          pitchAccuracy,
          timingAccuracy,
          overallAccuracy,
          date: new Date()?.toISOString()
        }
      }
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e?.code) {
        case 'Space':
          e?.preventDefault();
          handlePlayPause();
          break;
        case 'Escape':
          handleExit();
          break;
        case 'KeyS':
          if (e?.ctrlKey || e?.metaKey) {
            e?.preventDefault();
            setShowSettings(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getLyricsFontSize = () => {
    switch (settings?.lyricsSize) {
      case 'small': return 'text-lg';
      case 'large': return 'text-3xl';
      case 'extra-large': return 'text-4xl';
      default: return 'text-2xl';
    }
  };

  const getLyricsColor = () => {
    switch (settings?.lyricsColor) {
      case 'yellow': return 'text-yellow-400';
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-green-400';
      case 'red': return 'text-red-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Visual Effects Layer */}
      {settings?.visualEffects && (
        <VisualEffects
          isActive={isPlaying}
          audioLevel={audioLevel}
          pitchAccuracy={pitchAccuracy}
          theme="default"
        />
      )}
      {/* Performance Header */}
      <PerformanceHeader
        isVisible={true}
        onExit={handleExit}
        onSettings={handleSettings}
        currentScore={currentScore}
        songTitle={selectedSong?.title}
        artistName={selectedSong?.artist}
      />
      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-6 px-4 h-screen flex flex-col">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:h-full">
          {/* Left Column - Score & Pitch */}
          <div className="space-y-4">
            <ScoreDisplay
              currentScore={currentScore}
              pitchAccuracy={pitchAccuracy}
              timingAccuracy={timingAccuracy}
              overallAccuracy={overallAccuracy}
              streak={streak}
            />
            
            <PitchVisualization
              userPitch={userPitch}
              referencePitch={referencePitch}
              isActive={isPlaying}
              accuracy={pitchAccuracy}
            />
          </div>

          {/* Center Column - Lyrics */}
          <div className="flex flex-col justify-center">
            <LyricsDisplay
              currentTime={currentTime}
              isPlaying={isPlaying}
              fontSize={getLyricsFontSize()}
              fontColor={getLyricsColor()}
              className="flex-1 flex items-center"
            />
          </div>

          {/* Right Column - Controls */}
          <div className="flex flex-col justify-end">
            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              musicVolume={musicVolume}
              micVolume={micVolume}
              onMusicVolumeChange={setMusicVolume}
              onMicVolumeChange={setMicVolume}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-full space-y-4">
          {/* Score Display - Compact */}
          <div className="flex justify-between items-center bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">
                {currentScore?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">pontos</div>
            </div>
            
            <div className="flex space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-success">{Math.round(pitchAccuracy)}%</div>
                <div className="text-xs text-muted-foreground">Tom</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-warning">{Math.round(timingAccuracy)}%</div>
                <div className="text-xs text-muted-foreground">Tempo</div>
              </div>
            </div>
            
            {streak > 0 && (
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">{streak}</div>
                <div className="text-xs text-muted-foreground">sequência</div>
              </div>
            )}
          </div>

          {/* Lyrics Display - Main */}
          <div className="flex-1 flex items-center justify-center">
            <LyricsDisplay
              currentTime={currentTime}
              isPlaying={isPlaying}
              fontSize={getLyricsFontSize()}
              fontColor={getLyricsColor()}
              className="w-full"
            />
          </div>

          {/* Pitch Visualization - Compact */}
          <div className="h-24">
            <PitchVisualization
              userPitch={userPitch}
              referencePitch={referencePitch}
              isActive={isPlaying}
              accuracy={pitchAccuracy}
              className="h-full"
            />
          </div>

          {/* Audio Controls */}
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            musicVolume={musicVolume}
            micVolume={micVolume}
            onMusicVolumeChange={setMusicVolume}
            onMicVolumeChange={setMicVolume}
          />
        </div>
      </div>
      {/* Settings Overlay */}
      <PerformanceSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      {/* Performance Instructions */}
      {!isPlaying && currentTime === 0 && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 text-center">
            <h3 className="text-xl font-semibold mb-4">Pronto para cantar?</h3>
            <p className="text-muted-foreground mb-6">
              Pressione play para começar sua performance de "{selectedSong?.title}" por {selectedSong?.artist}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• Use a barra de espaço para pausar/reproduzir</p>
              <p>• Pressione ESC para sair</p>
              <p>• Ctrl+S para abrir configurações</p>
            </div>
            <button
              onClick={handlePlayPause}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Começar Performance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KaraokePerformanceMode;