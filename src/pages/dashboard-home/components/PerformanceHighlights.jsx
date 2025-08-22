import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { performanceService } from '../../../services/performanceService';
import { Trophy, TrendingUp, Music, Award } from 'lucide-react';

export default function PerformanceHighlights() {
  const { user, userProfile } = useAuth();
  const [recentPerformances, setRecentPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPerformanceData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await performanceService?.getUserPerformances(user?.id, { limit: 3 });
        if (error) {
          setError('Failed to load performance data');
          return;
        }
        if (isMounted) {
          setRecentPerformances(data || []);
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load performance data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPerformanceData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Preview mode for non-authenticated users
  if (!user) {
    return (
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Performance Highlights</h2>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center mb-8">
            <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Track Your Karaoke Journey</h3>
            <p className="text-purple-700 mb-4">See your best performances, track improvement, and compete with friends!</p>
            <Link 
              to="/auth/signup"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign Up to Start Tracking
            </Link>
          </div>
          
          {/* Demo performance cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-500">95</span>
              </div>
              <h3 className="font-semibold text-slate-900">Best Score</h3>
              <p className="text-slate-600 text-sm">Sweet Caroline - Neil Diamond</p>
              <p className="text-xs text-slate-500 mt-2">Sign in to see your actual scores</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-green-500">+12</span>
              </div>
              <h3 className="font-semibold text-slate-900">Improvement</h3>
              <p className="text-slate-600 text-sm">Points gained this week</p>
              <p className="text-xs text-slate-500 mt-2">Track your progress over time</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <Music className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-purple-500">Rock</span>
              </div>
              <h3 className="font-semibold text-slate-900">Favorite Genre</h3>
              <p className="text-slate-600 text-sm">Your strongest category</p>
              <p className="text-xs text-slate-500 mt-2">Discover your karaoke style</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Performance Highlights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)]?.map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-slate-300 rounded"></div>
                  <div className="w-12 h-8 bg-slate-300 rounded"></div>
                </div>
                <div className="h-4 bg-slate-300 rounded mb-2"></div>
                <div className="h-3 bg-slate-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Performance Highlights</h2>
          <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <p className="text-sm mt-2 opacity-75">Please check your connection and try again.</p>
          </div>
        </div>
      </section>
    );
  }

  const averageScore = userProfile?.total_performances > 0 
    ? Math.round((userProfile?.total_score || 0) / userProfile?.total_performances) 
    : 0;

  const bestScore = recentPerformances?.length > 0 
    ? Math.max(...recentPerformances?.map(p => p?.score || 0))
    : 0;

  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Performance Highlights</h2>
          <Link 
            to="/performance-history-scoring" 
            className="text-purple-600 hover:text-purple-700 transition-colors"
          >
            View all performances →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Performances */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">
                {userProfile?.total_performances || 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">Total Performances</h3>
            <p className="text-slate-600 text-sm">Songs you've sung</p>
          </div>
          
          {/* Average Score */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {averageScore}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">Average Score</h3>
            <p className="text-slate-600 text-sm">Your typical performance</p>
          </div>
          
          {/* Best Score */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">
                {bestScore}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">Best Score</h3>
            <p className="text-slate-600 text-sm">Your highest achievement</p>
          </div>
        </div>
        
        {/* Recent Performances */}
        {recentPerformances?.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Performances</h3>
            <div className="space-y-4">
              {recentPerformances?.map((performance) => (
                <div 
                  key={performance?.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {performance?.song?.title || 'Unknown Song'}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        by {performance?.song?.artist || 'Unknown Artist'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(performance?.completed_at)?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {performance?.score || 0}
                    </div>
                    <div className="text-xs text-slate-500">
                      {performance?.overall_rating || 'No rating'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {recentPerformances?.length === 0 && (
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <Music className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No performances yet</h3>
            <p className="text-slate-600 mb-4">Start singing to see your performance highlights here!</p>
            <Link 
              to="/music-library-management"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Songs
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}