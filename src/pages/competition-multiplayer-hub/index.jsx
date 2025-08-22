import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ActiveCompetitionsCarousel from './components/ActiveCompetitionsCarousel';
import FriendChallengesSection from './components/FriendChallengesSection';
import PublicRoomsList from './components/PublicRoomsList';
import TournamentBracket from './components/TournamentBracket';
import LeaderboardDisplay from './components/LeaderboardDisplay';

const CompetitionMultiplayerHub = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('competitions');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'challenge',
      title: 'Novo Desafio Recebido',
      message: 'Maria Silva te desafiou para um dueto!',
      timestamp: new Date('2025-01-08T21:30:00'),
      read: false
    },
    {
      id: 2,
      type: 'tournament',
      title: 'Torneio Iniciando',
      message: 'Copa MPB 2025 começa em 30 minutos',
      timestamp: new Date('2025-01-08T21:00:00'),
      read: false
    }
  ];

  const handleJoinCompetition = (competition) => {
    console.log('Joining competition:', competition);
    // Navigate to competition registration or performance mode
    navigate('/karaoke-performance-mode', { state: { competition } });
  };

  const handleAcceptChallenge = (challenge) => {
    console.log('Accepting challenge:', challenge);
    // Navigate to duet/battle mode
    navigate('/karaoke-performance-mode', { state: { challenge } });
  };

  const handleDeclineChallenge = (challengeId) => {
    console.log('Declining challenge:', challengeId);
    // Handle challenge decline logic
  };

  const handleCreateChallenge = () => {
    console.log('Creating new challenge');
    // Open challenge creation modal or navigate to creation page
  };

  const handleJoinRoom = (room) => {
    console.log('Joining room:', room);
    // Navigate to multiplayer room
    navigate('/karaoke-performance-mode', { state: { room } });
  };

  const handleSpectateRoom = (room) => {
    console.log('Spectating room:', room);
    // Navigate to spectator mode
    navigate('/karaoke-performance-mode', { state: { room, spectate: true } });
  };

  const handleCreateRoom = () => {
    console.log('Creating new room');
    // Open room creation modal
  };

  const handleViewMatch = (match) => {
    console.log('Viewing match:', match);
    // Navigate to match replay or details
  };

  const handleViewTournamentDetails = (tournament) => {
    console.log('Viewing tournament details:', tournament);
    // Open tournament details modal
  };

  const handleViewProfile = (user) => {
    console.log('Viewing profile:', user);
    // Navigate to user profile
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'competitions': return 'Trophy';
      case 'challenges': return 'Users';
      case 'rooms': return 'Radio';
      case 'tournaments': return 'Target';
      case 'leaderboard': return 'Crown';
      default: return 'Trophy';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard-home')}
                className="lg:hidden"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Competições & Multiplayer</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Desafie amigos e participe de torneios
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Icon name="Bell" size={20} />
                  {notifications?.filter(n => !n?.read)?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {notifications?.filter(n => !n?.read)?.length}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <h3 className="font-medium text-foreground">Notificações</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications?.map((notification) => (
                        <div key={notification?.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification?.read ? 'bg-muted' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground">{notification?.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification?.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification?.timestamp?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <Button variant="default" size="sm" onClick={handleCreateChallenge}>
                <Icon name="Plus" size={16} className="mr-2" />
                <span className="hidden sm:inline">Novo Desafio</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'competitions', label: 'Competições' },
              { id: 'challenges', label: 'Desafios' },
              { id: 'rooms', label: 'Salas Públicas' },
              { id: 'tournaments', label: 'Torneios' },
              { id: 'leaderboard', label: 'Ranking' }
            ]?.map((section) => (
              <button
                key={section?.id}
                onClick={() => setActiveSection(section?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                  activeSection === section?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={getSectionIcon(section?.id)} size={16} />
                <span>{section?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="space-y-6">
          {activeSection === 'competitions' && (
            <div className="space-y-6">
              <ActiveCompetitionsCarousel onJoinCompetition={handleJoinCompetition} />
              <div className="grid lg:grid-cols-2 gap-6">
                <FriendChallengesSection
                  onAcceptChallenge={handleAcceptChallenge}
                  onDeclineChallenge={handleDeclineChallenge}
                  onCreateChallenge={handleCreateChallenge}
                />
                <LeaderboardDisplay onViewProfile={handleViewProfile} />
              </div>
            </div>
          )}

          {activeSection === 'challenges' && (
            <FriendChallengesSection
              onAcceptChallenge={handleAcceptChallenge}
              onDeclineChallenge={handleDeclineChallenge}
              onCreateChallenge={handleCreateChallenge}
            />
          )}

          {activeSection === 'rooms' && (
            <PublicRoomsList
              onJoinRoom={handleJoinRoom}
              onSpectateRoom={handleSpectateRoom}
              onCreateRoom={handleCreateRoom}
            />
          )}

          {activeSection === 'tournaments' && (
            <TournamentBracket
              tournament={{
                id: 1,
                name: 'Copa MPB 2025',
                status: 'active',
                participants: 16,
                currentRound: 'quarterfinals'
              }}
              onViewMatch={handleViewMatch}
              onViewDetails={handleViewTournamentDetails}
            />
          )}

          {activeSection === 'leaderboard' && (
            <LeaderboardDisplay onViewProfile={handleViewProfile} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Trophy" size={24} className="text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Competições Ativas</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Users" size={24} className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">1,247</p>
            <p className="text-sm text-muted-foreground">Jogadores Online</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Radio" size={24} className="text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">38</p>
            <p className="text-sm text-muted-foreground">Salas Ativas</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Crown" size={24} className="text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">#3</p>
            <p className="text-sm text-muted-foreground">Sua Posição</p>
          </div>
        </div>
      </main>
      {/* Bottom Navigation */}
      <BottomTabNavigation />
      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default CompetitionMultiplayerHub;