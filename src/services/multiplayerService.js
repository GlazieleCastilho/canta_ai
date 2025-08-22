import { supabase } from '../lib/supabase';

class MultiplayerService {
  // Create new multiplayer session
  async createSession(sessionData) {
    try {
      const joinCode = await this.generateJoinCode();
      
      const { data, error } = await supabase?.from('multiplayer_sessions')?.insert([{
          ...sessionData,
          host_id: (await supabase?.auth?.getUser())?.data?.user?.id,
          join_code: joinCode
        }])?.select(`
          *,
          host:user_profiles!host_id(username, full_name, avatar_url),
          song:songs(id, title, artist, cover_image_url)
        `)?.single();

      if (error) throw error;

      // Add host as first participant
      await this.joinSession(data?.id);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get public sessions (not private)
  async getPublicSessions(filters = {}) {
    try {
      let query = supabase?.from('multiplayer_sessions')?.select(`
          *,
          host:user_profiles!host_id(username, full_name, avatar_url),
          song:songs(id, title, artist, cover_image_url)
        `)?.eq('is_private', false)?.in('session_status', ['waiting', 'in_progress'])?.order('created_at', { ascending: false });

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

  // Get session by ID
  async getSessionById(sessionId) {
    try {
      const { data, error } = await supabase?.from('multiplayer_sessions')?.select(`
          *,
          host:user_profiles!host_id(username, full_name, avatar_url),
          song:songs(*),
          session_participants(
            id,
            joined_at,
            left_at,
            final_score,
            participant:user_profiles!user_id(username, full_name, avatar_url)
          )
        `)?.eq('id', sessionId)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Join session by ID or join code
  async joinSession(sessionId, joinCode = null) {
    try {
      let session;
      
      if (joinCode) {
        const { data: sessionData, error: sessionError } = await supabase?.from('multiplayer_sessions')?.select('id, current_participants, max_participants, session_status')?.eq('join_code', joinCode?.toUpperCase())?.single();

        if (sessionError) throw new Error('Invalid join code');
        session = sessionData;
        sessionId = session?.id;
      } else {
        const { data: sessionData, error: sessionError } = await supabase?.from('multiplayer_sessions')?.select('current_participants, max_participants, session_status')?.eq('id', sessionId)?.single();

        if (sessionError) throw sessionError;
        session = sessionData;
      }

      // Check if session is joinable
      if (session?.session_status !== 'waiting') {
        throw new Error('Session is not accepting new participants');
      }

      if (session?.current_participants >= session?.max_participants) {
        throw new Error('Session is full');
      }

      const currentUser = (await supabase?.auth?.getUser())?.data?.user;
      
      // Check if user already in session
      const { data: existingParticipant } = await supabase?.from('session_participants')?.select('id')?.eq('session_id', sessionId)?.eq('user_id', currentUser?.id)?.is('left_at', null)?.single();

      if (existingParticipant) {
        throw new Error('Already in this session');
      }

      // Add participant
      const { data, error } = await supabase?.from('session_participants')?.insert([{
          session_id: sessionId,
          user_id: currentUser?.id
        }])?.select(`
          *,
          participant:user_profiles!user_id(username, full_name, avatar_url)
        `)?.single();

      if (error) throw error;

      // Update session participant count
      const { error: updateError } = await supabase?.from('multiplayer_sessions')?.update({
          current_participants: session?.current_participants + 1
        })?.eq('id', sessionId);

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Leave session
  async leaveSession(sessionId) {
    try {
      const currentUser = (await supabase?.auth?.getUser())?.data?.user;

      // Update participant record
      const { error: participantError } = await supabase?.from('session_participants')?.update({
          left_at: new Date()?.toISOString()
        })?.eq('session_id', sessionId)?.eq('user_id', currentUser?.id)?.is('left_at', null);

      if (participantError) throw participantError;

      // Update session participant count
      const { data: session, error: sessionError } = await supabase?.from('multiplayer_sessions')?.select('current_participants, host_id')?.eq('id', sessionId)?.single();

      if (sessionError) throw sessionError;

      const newCount = Math.max(0, session?.current_participants - 1);

      // If host leaves, end session
      if (session?.host_id === currentUser?.id) {
        await supabase?.from('multiplayer_sessions')?.update({
            session_status: 'cancelled',
            current_participants: newCount,
            ended_at: new Date()?.toISOString()
          })?.eq('id', sessionId);
      } else {
        await supabase?.from('multiplayer_sessions')?.update({
            current_participants: newCount
          })?.eq('id', sessionId);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Start session (host only)
  async startSession(sessionId) {
    try {
      const { data, error } = await supabase?.from('multiplayer_sessions')?.update({
          session_status: 'in_progress',
          started_at: new Date()?.toISOString()
        })?.eq('id', sessionId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // End session
  async endSession(sessionId) {
    try {
      const { data, error } = await supabase?.from('multiplayer_sessions')?.update({
          session_status: 'completed',
          ended_at: new Date()?.toISOString()
        })?.eq('id', sessionId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update session settings (host only)
  async updateSessionSettings(sessionId, settings) {
    try {
      const { data, error } = await supabase?.from('multiplayer_sessions')?.update({
          settings,
          updated_at: new Date()?.toISOString()
        })?.eq('id', sessionId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Submit participant score
  async submitScore(sessionId, score) {
    try {
      const currentUser = (await supabase?.auth?.getUser())?.data?.user;

      const { data, error } = await supabase?.from('session_participants')?.update({
          final_score: score
        })?.eq('session_id', sessionId)?.eq('user_id', currentUser?.id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get session results
  async getSessionResults(sessionId) {
    try {
      const { data, error } = await supabase?.from('session_participants')?.select(`
          *,
          participant:user_profiles!user_id(username, full_name, avatar_url)
        `)?.eq('session_id', sessionId)?.not('final_score', 'is', null)?.order('final_score', { ascending: false });

      if (error) throw error;

      // Add rankings
      const rankedResults = data?.map((participant, index) => ({
        ...participant,
        rank: index + 1
      })) || [];

      return { data: rankedResults, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user's session history
  async getUserSessionHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase?.from('session_participants')?.select(`
          *,
          session:multiplayer_sessions(
            id,
            name,
            session_status,
            started_at,
            ended_at,
            song:songs(title, artist, cover_image_url),
            host:user_profiles!host_id(username, full_name)
          )
        `)?.eq('user_id', userId)?.order('joined_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Subscribe to session updates (real-time)
  subscribeToSession(sessionId, callbacks = {}) {
    const channel = supabase?.channel(`session:${sessionId}`)?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'multiplayer_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          callbacks?.onSessionUpdate?.(payload);
        }
      )?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          callbacks?.onParticipantUpdate?.(payload);
        }
      )?.subscribe();

    return channel;
  }

  // Unsubscribe from session updates
  unsubscribeFromSession(channel) {
    return supabase?.removeChannel(channel);
  }

  // Generate unique join code
  async generateJoinCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars?.charAt(Math.floor(Math.random() * chars?.length));
      }

      // Check if code exists
      const { data } = await supabase?.from('multiplayer_sessions')?.select('join_code')?.eq('join_code', code)?.single();

      isUnique = !data;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Could not generate unique join code');
    }

    return code;
  }

  // Search sessions by join code
  async findSessionByJoinCode(joinCode) {
    try {
      const { data, error } = await supabase?.from('multiplayer_sessions')?.select(`
          *,
          host:user_profiles!host_id(username, full_name, avatar_url),
          song:songs(id, title, artist, cover_image_url)
        `)?.eq('join_code', joinCode?.toUpperCase())?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const multiplayerService = new MultiplayerService();
export default multiplayerService;