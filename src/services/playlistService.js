import { supabase } from '../lib/supabase';

class PlaylistService {
  // Get user's playlists
  async getUserPlaylists(userId, includePublic = false) {
    try {
      let query = supabase?.from('playlists')?.select(`
          *,
          total_songs,
          total_duration
        `)?.order('created_at', { ascending: false });

      if (includePublic) {
        query = query?.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        query = query?.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get public playlists
  async getPublicPlaylists(limit = 20) {
    try {
      const { data, error } = await supabase?.from('playlists')?.select(`
          *,
          creator:user_profiles!user_id(username, full_name),
          total_songs,
          total_duration
        `)?.eq('is_public', true)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get playlist by ID with songs
  async getPlaylistById(playlistId) {
    try {
      const { data, error } = await supabase?.from('playlists')?.select(`
          *,
          creator:user_profiles!user_id(username, full_name, avatar_url),
          playlist_songs(
            id,
            position,
            added_at,
            song:songs(
              id,
              title,
              artist,
              album,
              genre,
              duration,
              difficulty,
              cover_image_url,
              popularity_score
            )
          )
        `)?.eq('id', playlistId)?.single();

      if (error) throw error;

      // Sort songs by position
      if (data?.playlist_songs) {
        data?.playlist_songs?.sort((a, b) => a?.position - b?.position);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Create new playlist
  async createPlaylist(playlistData) {
    try {
      const { data, error } = await supabase?.from('playlists')?.insert([{
          ...playlistData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update playlist
  async updatePlaylist(playlistId, updates) {
    try {
      const { data, error } = await supabase?.from('playlists')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', playlistId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete playlist
  async deletePlaylist(playlistId) {
    try {
      const { error } = await supabase?.from('playlists')?.delete()?.eq('id', playlistId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Add song to playlist
  async addSongToPlaylist(playlistId, songId) {
    try {
      // Get current max position
      const { data: maxPos } = await supabase?.from('playlist_songs')?.select('position')?.eq('playlist_id', playlistId)?.order('position', { ascending: false })?.limit(1)?.single();

      const newPosition = (maxPos?.position || 0) + 1;

      const { data, error } = await supabase?.from('playlist_songs')?.insert([{
          playlist_id: playlistId,
          song_id: songId,
          position: newPosition
        }])?.select(`
          *,
          song:songs(*)
        `)?.single();

      if (error) throw error;

      // Update playlist stats
      await this.updatePlaylistStats(playlistId);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Remove song from playlist
  async removeSongFromPlaylist(playlistId, songId) {
    try {
      const { error } = await supabase?.from('playlist_songs')?.delete()?.eq('playlist_id', playlistId)?.eq('song_id', songId);

      if (error) throw error;

      // Update positions and playlist stats
      await this.reorderPlaylistSongs(playlistId);
      await this.updatePlaylistStats(playlistId);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Reorder songs in playlist
  async reorderPlaylistSongs(playlistId, songIds = []) {
    try {
      if (songIds?.length === 0) {
        // Auto-reorder based on current positions
        const { data: songs } = await supabase?.from('playlist_songs')?.select('id, position')?.eq('playlist_id', playlistId)?.order('position', { ascending: true });

        if (songs) {
          for (let i = 0; i < songs?.length; i++) {
            await supabase?.from('playlist_songs')?.update({ position: i + 1 })?.eq('id', songs?.[i]?.id);
          }
        }
      } else {
        // Reorder based on provided song IDs array
        for (let i = 0; i < songIds?.length; i++) {
          await supabase?.from('playlist_songs')?.update({ position: i + 1 })?.eq('playlist_id', playlistId)?.eq('song_id', songIds?.[i]);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Update playlist statistics
  async updatePlaylistStats(playlistId) {
    try {
      const { data: songs } = await supabase?.from('playlist_songs')?.select(`
          song:songs(duration)
        `)?.eq('playlist_id', playlistId);

      const totalSongs = songs?.length || 0;
      const totalDuration = songs?.reduce((sum, item) => sum + (item?.song?.duration || 0), 0) || 0;

      const { error } = await supabase?.from('playlists')?.update({
          total_songs: totalSongs,
          total_duration: totalDuration,
          updated_at: new Date()?.toISOString()
        })?.eq('id', playlistId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Search playlists
  async searchPlaylists(query, filters = {}) {
    try {
      let searchQuery = supabase?.from('playlists')?.select(`
          *,
          creator:user_profiles!user_id(username, full_name),
          total_songs,
          total_duration
        `)?.eq('is_public', true);

      // Text search
      if (query) {
        searchQuery = searchQuery?.or(
          `name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      searchQuery = searchQuery?.order('created_at', { ascending: false });

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

  // Get playlist songs
  async getPlaylistSongs(playlistId) {
    try {
      const { data, error } = await supabase?.from('playlist_songs')?.select(`
          *,
          song:songs(
            id,
            title,
            artist,
            album,
            genre,
            duration,
            difficulty,
            cover_image_url,
            audio_file_url
          )
        `)?.eq('playlist_id', playlistId)?.order('position', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Duplicate playlist
  async duplicatePlaylist(playlistId, newName) {
    try {
      // Get original playlist
      const { data: originalPlaylist } = await this.getPlaylistById(playlistId);
      
      if (!originalPlaylist) {
        throw new Error('Playlist not found');
      }

      // Create new playlist
      const { data: newPlaylist, error: createError } = await this.createPlaylist({
        name: newName || `Copy of ${originalPlaylist?.name}`,
        description: originalPlaylist?.description,
        is_public: false // Always create as private initially
      });

      if (createError) throw createError;

      // Add all songs from original playlist
      if (originalPlaylist?.playlist_songs?.length > 0) {
        for (const playlistSong of originalPlaylist?.playlist_songs) {
          await this.addSongToPlaylist(newPlaylist?.id, playlistSong?.song?.id);
        }
      }

      return { data: newPlaylist, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Upload playlist cover image
  async uploadPlaylistCover(file, playlistId) {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `playlists/${playlistId}/cover.${fileExt}`;
      
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
}

export const playlistService = new PlaylistService();
export default playlistService;