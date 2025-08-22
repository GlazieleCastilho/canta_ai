import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import { Mic, Music, Trophy, Users } from 'lucide-react';

export default function HeroSection() {
  const { user, userProfile, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      setShowWelcome(true);
    }
  }, [user, userProfile]);

  // Preview mode for non-authenticated users
  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {user && userProfile ? (
            // Authenticated user view
            (<div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome back, {userProfile?.full_name?.split(' ')?.[0] || userProfile?.username}! 🎤
              </h1>
              <p className="text-xl md:text-2xl text-purple-200 mb-8">
                Ready to rock the stage? Your total score: {userProfile?.total_score?.toLocaleString() || 0}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/music-library-management">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    <Music className="w-5 h-5 mr-2" />
                    Browse Songs
                  </Button>
                </Link>
                <Link to="/karaoke-performance-mode">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    <Mic className="w-5 h-5 mr-2" />
                    Start Singing
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Performances</h3>
                  <p className="text-3xl font-bold text-yellow-400">{userProfile?.total_performances || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Music className="w-8 h-8 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Average Score</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {userProfile?.total_performances > 0 
                      ? Math.round((userProfile?.total_score || 0) / userProfile?.total_performances)
                      : 0
                    }
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Rank</h3>
                  <p className="text-3xl font-bold text-blue-400">#{Math.floor(Math.random() * 100) + 1}</p>
                </div>
              </div>
            </div>)
          ) : (
            // Preview mode for non-authenticated users
            (<div>
              <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-md mb-8 max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-2">🎤 Preview Mode</h2>
                <p>You're viewing KaraokeWeb in preview mode. Sign in to access your personal karaoke dashboard!</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to KaraokeWeb 🎤
              </h1>
              <p className="text-xl md:text-2xl text-purple-200 mb-8">
                The ultimate karaoke experience - sing, compete, and rock the stage!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/auth/login">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    <Mic className="w-5 h-5 mr-2" />
                    Sign In to Sing
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    Join Now - Free!
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Compete & Win</h3>
                  <p className="text-purple-200">Battle friends and climb the leaderboards</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Music className="w-8 h-8 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Huge Song Library</h3>
                  <p className="text-purple-200">Thousands of songs across all genres</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Multiplayer Fun</h3>
                  <p className="text-purple-200">Sing with friends in real-time sessions</p>
                </div>
              </div>
            </div>)
          )}
        </div>
      </div>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-500/20 rounded-full animate-pulse animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse animation-delay-700"></div>
      </div>
    </div>
  );
}