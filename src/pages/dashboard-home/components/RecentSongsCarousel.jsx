import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { songService } from '../../../services/songService';
import { Play, Heart, Music } from 'lucide-react';

export default function RecentSongsCarousel() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadRecentSongs = async () => {
      try {
        const { data, error } = await songService?.getRecentSongs(8);
        if (error) {
          setError('Failed to load recent songs');
          return;
        }
        if (isMounted) {
          setSongs(data || []);
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load recent songs');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRecentSongs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Recently Added Songs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-700 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Recently Added Songs</h2>
          <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-lg">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <p className="text-sm mt-2 opacity-75">Please check your Supabase connection and try again.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Recently Added Songs</h2>
          <Link 
            to="/music-library-management" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all songs →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 overflow-x-auto">
          {songs?.length > 0 ? (
            songs?.map((song) => (
              <div 
                key={song?.id} 
                className="group bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative mb-4">
                  <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {song?.cover_image_url ? (
                      <img 
                        src={song?.cover_image_url} 
                        alt={song?.title || 'Song cover'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-white opacity-75" />
                    </div>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link 
                      to="/karaoke-performance-mode"
                      className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition-colors"
                    >
                      <Play className="w-6 h-6 text-white fill-current" />
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-semibold truncate" title={song?.title}>
                    {song?.title || 'Unknown Title'}
                  </h3>
                  <p className="text-slate-400 text-sm truncate" title={song?.artist}>
                    {song?.artist || 'Unknown Artist'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                      {song?.genre || 'Unknown'}
                    </span>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 p-8">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent songs available.</p>
              <p className="text-sm mt-2 opacity-75">Songs will appear here once they're added to the library.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}