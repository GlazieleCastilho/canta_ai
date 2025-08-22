import { supabase } from '../lib/supabase';

class SongService {
  // Get all public songs with optional filtering
  async getSongs(filters = {}) {
    try {
      let query = supabase?.from('songs')?.select(`
          *,
          uploaded_by_profile:user_profiles!uploaded_by(username, full_name),
          total_performances,
          average_score
        `)?.eq('is_public', true)?.order('popularity_score', { ascending: false });

      // Apply filters
      if (filters?.genre) {
        query = query?.eq('genre', filters?.genre);
      }
      
      if (filters?.difficulty) {
        query = query?.eq('difficulty', filters?.difficulty);
      }
      
      if (filters?.artist) {
        query = query?.ilike('artist', `%${filters?.artist}%`);
      }
      
      if (filters?.title) {
        query = query?.ilike('title', `%${filters?.title}%`);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get a single song with lyrics
  async getSongById(songId) {
    try {
      const { data, error } = await supabase?.from('songs')?.select(`
          *,
          uploaded_by_profile:user_profiles!uploaded_by(username, full_name),
          lyrics(*)
        `)?.eq('id', songId)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get songs uploaded by current user
  async getUserSongs(userId) {
    try {
      const { data, error } = await supabase?.from('songs')?.select(`
          *,
          total_performances,
          average_score
        `)?.eq('uploaded_by', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create new song
  async createSong(songData) {
    try {
      const { data, error } = await supabase?.from('songs')?.insert([{
          ...songData,
          uploaded_by: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update song
  async updateSong(songId, updates) {
    try {
      const { data, error } = await supabase?.from('songs')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', songId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete song
  async deleteSong(songId) {
    try {
      const { error } = await supabase?.from('songs')?.delete()?.eq('id', songId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get popular songs
  async getPopularSongs(limit = 10) {
    try {
      const { data, error } = await supabase?.from('songs')?.select(`
          *,
          uploaded_by_profile:user_profiles!uploaded_by(username, full_name)
        `)?.eq('is_public', true)?.order('popularity_score', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get recently added songs
  async getRecentSongs(limit = 10) {
    try {
      const { data, error } = await supabase?.from('songs')?.select(`
          *,
          uploaded_by_profile:user_profiles!uploaded_by(username, full_name)
        `)?.eq('is_public', true)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Search songs
  async searchSongs(query, filters = {}) {
    try {
      let searchQuery = supabase?.from('songs')?.select(`
          *,
          uploaded_by_profile:user_profiles!uploaded_by(username, full_name)
        `)?.eq('is_public', true);

      // Text search
      if (query) {
        searchQuery = searchQuery?.or(
          `title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`
        );
      }

      // Apply additional filters
      if (filters?.genre) {
        searchQuery = searchQuery?.eq('genre', filters?.genre);
      }
      
      if (filters?.difficulty) {
        searchQuery = searchQuery?.eq('difficulty', filters?.difficulty);
      }

      searchQuery = searchQuery?.order('popularity_score', { ascending: false });

      if (filters?.limit) {
        searchQuery = searchQuery?.limit(filters?.limit);
      }

      const { data, error } = await searchQuery;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Upload audio file to storage
  async uploadAudioFile(file, songId) {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${songId}/audio.${fileExt}`;
      
      const { data, error } = await supabase?.storage?.from('audio-files')?.upload(fileName, file, {
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase?.storage?.from('audio-files')?.getPublicUrl(fileName);

      return { data: { ...data, publicUrl }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Upload cover image to storage
  async uploadCoverImage(file, songId) {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${songId}/cover.${fileExt}`;
      
      const { data, error } = await supabase?.storage?.from('cover-images')?.upload(fileName, file, {
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase?.storage?.from('cover-images')?.getPublicUrl(fileName);

      return { data: { ...data, publicUrl }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get lyrics for a song
  async getSongLyrics(songId) {
    try {
      const { data, error } = await supabase?.from('lyrics')?.select('*')?.eq('song_id', songId)?.order('line_number', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create/update lyrics for a song
  async saveSongLyrics(songId, lyricsData) {
    try {
      // First delete existing lyrics
      await supabase?.from('lyrics')?.delete()?.eq('song_id', songId);

      // Insert new lyrics
      const { data, error } = await supabase?.from('lyrics')?.insert(
          lyricsData?.map(lyric => ({
            ...lyric,
            song_id: songId
          }))
        )?.select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const songService = new SongService();
export default songService;