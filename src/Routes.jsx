import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';

// Existing pages
import DashboardHomePage from './pages/dashboard-home';
import MusicLibraryManagement from './pages/music-library-management';
import LyricsEditorSynchronization from './pages/lyrics-editor-synchronization';
import CompetitionMultiplayerHub from './pages/competition-multiplayer-hub';
import KaraokePerformanceMode from './pages/karaoke-performance-mode';
import PerformanceHistoryScoring from './pages/performance-history-scoring';

// New auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Existing Routes - All accessible for Rocket platform development */}
          <Route path="/" element={<DashboardHomePage />} />
          <Route path="/dashboard-home" element={<DashboardHomePage />} />
          <Route path="/music-library-management" element={<MusicLibraryManagement />} />
          <Route path="/lyrics-editor-synchronization" element={<LyricsEditorSynchronization />} />
          <Route path="/competition-multiplayer-hub" element={<CompetitionMultiplayerHub />} />
          <Route path="/karaoke-performance-mode" element={<KaraokePerformanceMode />} />
          <Route path="/performance-history-scoring" element={<PerformanceHistoryScoring />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Routes;