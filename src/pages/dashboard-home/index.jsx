import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import SearchOverlay from '../../components/ui/SearchOverlay';

// Import all dashboard components
import HeroSection from './components/HeroSection';
import RecentSongsCarousel from './components/RecentSongsCarousel';
import ActivityFeed from './components/ActivityFeed';
import RecommendationsSidebar from './components/RecommendationsSidebar';
import QuickActionsPanel from './components/QuickActionsPanel';
import PerformanceHighlights from './components/PerformanceHighlights';

const DashboardHome = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Usuário'); // Mock user name

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handlePullToRefresh = () => {
    // Mock refresh functionality
    window.location?.reload();
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - KaraokeWeb</title>
        <meta name="description" content="Seu hub central para karaokê - acesse suas músicas, performances e competições" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and greeting */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Icon name="Mic" size={20} className="text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-foreground">KaraokeWeb</h1>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-muted-foreground">
                  {getGreeting()}, {userName}!
                </div>
              </div>

              {/* Search and user menu */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Buscar músicas"
                >
                  <Icon name="Search" size={20} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notificações"
                >
                  <Icon name="Bell" size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menu do usuário"
                >
                  <Icon name="User" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
          {/* Mobile greeting */}
          <div className="md:hidden mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {getGreeting()}, {userName}!
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentTime?.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Desktop layout */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main content area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero section */}
              <HeroSection />

              {/* Recent songs carousel */}
              <RecentSongsCarousel />

              {/* Quick actions panel */}
              <QuickActionsPanel />

              {/* Performance highlights */}
              <PerformanceHighlights />

              {/* Activity feed */}
              <ActivityFeed />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="sticky top-24">
                <RecommendationsSidebar />
              </div>
            </div>
          </div>

          {/* Pull to refresh indicator (mobile) */}
          <div className="lg:hidden fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePullToRefresh}
              className="bg-card/80 backdrop-blur-sm border border-border/50"
              iconName="RefreshCw"
              iconPosition="left"
            >
              Atualizar
            </Button>
          </div>
        </main>

        {/* Bottom navigation */}
        <BottomTabNavigation />

        {/* Search overlay */}
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchScope="all"
        />
      </div>
    </>
  );
};

export default DashboardHome;