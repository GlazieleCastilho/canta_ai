import { supabase } from '../lib/supabase';

class PerformanceService {
  // Record a new performance
  async recordPerformance(performanceData) {
    try {
      const { data, error } = await supabase?.from('performances')?.insert([{
          ...performanceData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id,
          completed_at: new Date()?.toISOString()
        }])?.select(`
          *,
          song:songs(*),
          user:user_profiles(username, full_name)
        `)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user's performances
  async getUserPerformances(userId, options = {}) {
    try {
      let query = supabase?.from('performances')?.select(`
          *,
          song:songs(id, title, artist, cover_image_url, genre, difficulty)
        `)?.eq('user_id', userId)?.order('completed_at', { ascending: false });

      if (options?.limit) {
        query = query?.limit(options?.limit);
      }

      if (options?.songId) {
        query = query?.eq('song_id', options?.songId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get performance by ID
  async getPerformanceById(performanceId) {
    try {
      const { data, error } = await supabase?.from('performances')?.select(`
          *,
          song:songs(*),
          user:user_profiles(username, full_name, avatar_url)
        `)?.eq('id', performanceId)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user's performance statistics
  async getUserStats(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          total_performances,
          total_score,
          preferred_genres
        `)?.eq('id', userId)?.single();

      if (error) throw error;

      // Get additional stats
      const { data: recentPerformances } = await supabase?.from('performances')?.select('score, overall_rating, completed_at')?.eq('user_id', userId)?.order('completed_at', { ascending: false })?.limit(10);

      const { data: bestPerformances } = await supabase?.from('performances')?.select(`
          score,
          song:songs(title, artist)
        `)?.eq('user_id', userId)?.order('score', { ascending: false })?.limit(5);

      const stats = {
        ...data,
        recent_performances: recentPerformances || [],
        best_performances: bestPerformances || [],
        average_score: data?.total_performances > 0 
          ? Math.round((data?.total_score || 0) / data?.total_performances) 
          : 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get leaderboard for a song
  async getSongLeaderboard(songId, limit = 10) {
    try {
      const { data, error } = await supabase?.from('leaderboards')?.select(`
          *,
          user:user_profiles(username, full_name, avatar_url),
          performance:performances(completed_at, accuracy_percentage, overall_rating)
        `)?.eq('song_id', songId)?.order('rank_position', { ascending: true })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get global leaderboard (top performers)
  async getGlobalLeaderboard(limit = 20) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          username,
          full_name,
          avatar_url,
          total_score,
          total_performances
        `)?.order('total_score', { ascending: false })?.gt('total_performances', 0)?.limit(limit);

      if (error) throw error;

      // Add rank and average score
      const rankedData = data?.map((user, index) => ({
        ...user,
        rank: index + 1,
        average_score: user?.total_performances > 0 
          ? Math.round(user?.total_score / user?.total_performances) 
          : 0
      })) || [];

      return { data: rankedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get performance history with filtering
  async getPerformanceHistory(userId, filters = {}) {
    try {
      let query = supabase?.from('performances')?.select(`
          *,
          song:songs(id, title, artist, cover_image_url, genre, difficulty)
        `)?.eq('user_id', userId);

      // Apply filters
      if (filters?.genre) {
        query = query?.eq('songs.genre', filters?.genre);
      }
      
      if (filters?.difficulty) {
        query = query?.eq('songs.difficulty', filters?.difficulty);
      }
      
      if (filters?.rating) {
        query = query?.eq('overall_rating', filters?.rating);
      }

      if (filters?.dateFrom) {
        query = query?.gte('completed_at', filters?.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query?.lte('completed_at', filters?.dateTo);
      }

      // Sorting
      const sortBy = filters?.sortBy || 'completed_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

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

  // Update performance (for corrections)
  async updatePerformance(performanceId, updates) {
    try {
      const { data, error } = await supabase?.from('performances')?.update(updates)?.eq('id', performanceId)?.select(`
          *,
          song:songs(title, artist),
          user:user_profiles(username, full_name)
        `)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete performance
  async deletePerformance(performanceId) {
    try {
      const { error } = await supabase?.from('performances')?.delete()?.eq('id', performanceId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get performance analytics for a time period
  async getPerformanceAnalytics(userId, period = '30d') {
    try {
      let dateFilter = new Date();
      
      switch (period) {
        case '7d':
          dateFilter?.setDate(dateFilter?.getDate() - 7);
          break;
        case '30d':
          dateFilter?.setDate(dateFilter?.getDate() - 30);
          break;
        case '90d':
          dateFilter?.setDate(dateFilter?.getDate() - 90);
          break;
        case '1y':
          dateFilter?.setFullYear(dateFilter?.getFullYear() - 1);
          break;
        default:
          dateFilter?.setDate(dateFilter?.getDate() - 30);
      }

      const { data, error } = await supabase?.from('performances')?.select(`
          score,
          accuracy_percentage,
          timing_score,
          pitch_score,
          rhythm_score,
          overall_rating,
          completed_at,
          song:songs(genre, difficulty)
        `)?.eq('user_id', userId)?.gte('completed_at', dateFilter?.toISOString())?.order('completed_at', { ascending: true });

      if (error) throw error;

      // Process analytics data
      const analytics = {
        total_performances: data?.length || 0,
        average_score: data?.length > 0 
          ? Math.round(data?.reduce((sum, p) => sum + p?.score, 0) / data?.length) 
          : 0,
        score_trend: data?.map(p => ({
          date: p?.completed_at,
          score: p?.score
        })) || [],
        genre_breakdown: {},
        difficulty_breakdown: {},
        rating_distribution: {
          poor: 0,
          fair: 0,
          good: 0,
          excellent: 0,
          perfect: 0
        }
      };

      // Calculate breakdowns
      data?.forEach(performance => {
        // Genre breakdown
        const genre = performance?.song?.genre;
        if (genre) {
          analytics.genre_breakdown[genre] = (analytics?.genre_breakdown?.[genre] || 0) + 1;
        }

        // Difficulty breakdown
        const difficulty = performance?.song?.difficulty;
        if (difficulty) {
          analytics.difficulty_breakdown[difficulty] = (analytics?.difficulty_breakdown?.[difficulty] || 0) + 1;
        }

        // Rating distribution
        const rating = performance?.overall_rating;
        if (rating && analytics?.rating_distribution?.hasOwnProperty(rating)) {
          analytics.rating_distribution[rating]++;
        }
      });

      return { data: analytics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const performanceService = new PerformanceService();
export default performanceService;