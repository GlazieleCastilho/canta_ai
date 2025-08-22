-- Location: supabase/migrations/20250822012016_karaoke_system_with_auth.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete karaoke system with authentication
-- Dependencies: None (fresh start)

-- 1. TYPES AND ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'premium', 'regular');
CREATE TYPE public.song_genre AS ENUM ('pop', 'rock', 'country', 'jazz', 'blues', 'hip_hop', 'electronic', 'classical', 'folk', 'r_and_b', 'reggae', 'metal', 'punk', 'alternative', 'indie', 'other');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE public.session_status AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.performance_rating AS ENUM ('poor', 'fair', 'good', 'excellent', 'perfect');

-- 2. CORE TABLES (NO FOREIGN KEYS)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role DEFAULT 'regular'::public.user_role,
    total_score INTEGER DEFAULT 0,
    total_performances INTEGER DEFAULT 0,
    preferred_genres public.song_genre[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPENDENT TABLES (WITH FOREIGN KEYS TO CORE TABLES)
CREATE TABLE public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    genre public.song_genre NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    difficulty public.difficulty_level DEFAULT 'medium'::public.difficulty_level,
    audio_file_url TEXT, -- storage reference
    cover_image_url TEXT, -- storage reference
    lyrics_file_url TEXT, -- storage reference for timing data
    bpm INTEGER, -- beats per minute
    key_signature TEXT, -- musical key
    language TEXT DEFAULT 'English',
    release_year INTEGER,
    popularity_score INTEGER DEFAULT 0,
    total_performances INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.lyrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    start_time DECIMAL(10,3) NOT NULL, -- in seconds with millisecond precision
    end_time DECIMAL(10,3) NOT NULL,
    text_content TEXT NOT NULL,
    phonetic_guide TEXT, -- for pronunciation help
    pitch_target DECIMAL(8,2), -- target pitch in Hz
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    total_songs INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

CREATE TABLE public.performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    timing_score INTEGER DEFAULT 0,
    pitch_score INTEGER DEFAULT 0,
    rhythm_score INTEGER DEFAULT 0,
    overall_rating public.performance_rating,
    performance_data JSONB, -- detailed performance metrics
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    session_id UUID, -- for multiplayer sessions
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    microphone_settings JSONB DEFAULT '{}',
    audio_settings JSONB DEFAULT '{}',
    visual_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE public.multiplayer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    host_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    max_participants INTEGER DEFAULT 4,
    current_participants INTEGER DEFAULT 1,
    session_status public.session_status DEFAULT 'waiting'::public.session_status,
    is_private BOOLEAN DEFAULT false,
    join_code TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.multiplayer_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    final_score INTEGER,
    UNIQUE(session_id, user_id)
);

CREATE TABLE public.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    best_score INTEGER NOT NULL,
    best_performance_id UUID REFERENCES public.performances(id) ON DELETE SET NULL,
    rank_position INTEGER,
    achieved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(song_id, user_id)
);

CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    points_awarded INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. ESSENTIAL INDEXES
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_songs_genre ON public.songs(genre);
CREATE INDEX idx_songs_artist ON public.songs(artist);
CREATE INDEX idx_songs_popularity ON public.songs(popularity_score DESC);
CREATE INDEX idx_songs_public ON public.songs(is_public);
CREATE INDEX idx_lyrics_song_id ON public.lyrics(song_id);
CREATE INDEX idx_lyrics_timing ON public.lyrics(song_id, start_time);
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlists_public ON public.playlists(is_public);
CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_position ON public.playlist_songs(playlist_id, position);
CREATE INDEX idx_performances_user_id ON public.performances(user_id);
CREATE INDEX idx_performances_song_id ON public.performances(song_id);
CREATE INDEX idx_performances_score ON public.performances(score DESC);
CREATE INDEX idx_performances_completed_at ON public.performances(completed_at DESC);
CREATE INDEX idx_multiplayer_sessions_host_id ON public.multiplayer_sessions(host_id);
CREATE INDEX idx_multiplayer_sessions_status ON public.multiplayer_sessions(session_status);
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_leaderboards_song_rank ON public.leaderboards(song_id, rank_position);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- 5. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'audio-files',
        'audio-files',
        true,
        52428800, -- 50MB limit for audio files
        ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac']
    ),
    (
        'cover-images',
        'cover-images', 
        true,
        10485760, -- 10MB limit for images
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    ),
    (
        'lyrics-files',
        'lyrics-files',
        true,
        1048576, -- 1MB limit for lyrics timing files
        ARRAY['application/json', 'text/plain']
    ),
    (
        'user-avatars',
        'user-avatars',
        true,
        5242880, -- 5MB limit for avatars
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    );

-- 6. HELPER FUNCTIONS (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.update_song_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update song performance statistics
    UPDATE public.songs 
    SET 
        total_performances = (
            SELECT COUNT(*) 
            FROM public.performances 
            WHERE song_id = NEW.song_id
        ),
        average_score = (
            SELECT COALESCE(AVG(score), 0) 
            FROM public.performances 
            WHERE song_id = NEW.song_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.song_id;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update user performance statistics
    UPDATE public.user_profiles 
    SET 
        total_performances = (
            SELECT COUNT(*) 
            FROM public.performances 
            WHERE user_id = NEW.user_id
        ),
        total_score = (
            SELECT COALESCE(SUM(score), 0) 
            FROM public.performances 
            WHERE user_id = NEW.user_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, username)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- 7. ENABLE RLS ON ALL TABLES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- Pattern 1: Core user table (user_profiles) - Simple policies only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, private write for songs
CREATE POLICY "public_can_read_public_songs"
ON public.songs
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "users_manage_own_songs"
ON public.songs
FOR ALL
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Pattern 2: Simple user ownership for most tables
CREATE POLICY "users_manage_own_playlists"
ON public.playlists
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_performances"
ON public.performances
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Lyrics can be read by anyone but only managed by song owners
CREATE POLICY "public_can_read_lyrics"
ON public.lyrics
FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.songs s 
        WHERE s.id = song_id AND s.is_public = true
    )
);

CREATE POLICY "song_owners_manage_lyrics"
ON public.lyrics
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.songs s 
        WHERE s.id = song_id AND s.uploaded_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.songs s 
        WHERE s.id = song_id AND s.uploaded_by = auth.uid()
    )
);

-- Playlist songs management
CREATE POLICY "users_manage_playlist_songs"
ON public.playlist_songs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.playlists p 
        WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.playlists p 
        WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
);

-- Multiplayer sessions
CREATE POLICY "users_view_public_sessions"
ON public.multiplayer_sessions
FOR SELECT
TO authenticated
USING (is_private = false OR host_id = auth.uid());

CREATE POLICY "users_manage_own_sessions"
ON public.multiplayer_sessions
FOR ALL
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- Session participants
CREATE POLICY "participants_view_session_data"
ON public.session_participants
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.multiplayer_sessions ms 
        WHERE ms.id = session_id AND ms.host_id = auth.uid()
    )
);

CREATE POLICY "users_manage_own_participation"
ON public.session_participants
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Leaderboards are public read, but only system can write
CREATE POLICY "public_can_read_leaderboards"
ON public.leaderboards
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_leaderboard_entries"
ON public.leaderboards
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. STORAGE POLICIES

-- Audio files - public read, authenticated upload
CREATE POLICY "public_can_view_audio_files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio-files');

CREATE POLICY "authenticated_users_upload_audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "owners_manage_audio_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-files' AND owner = auth.uid())
WITH CHECK (bucket_id = 'audio-files' AND owner = auth.uid());

CREATE POLICY "owners_delete_audio_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files' AND owner = auth.uid());

-- Cover images - public read, authenticated upload
CREATE POLICY "public_can_view_cover_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cover-images');

CREATE POLICY "authenticated_users_upload_covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-images');

CREATE POLICY "owners_manage_cover_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cover-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'cover-images' AND owner = auth.uid());

CREATE POLICY "owners_delete_cover_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cover-images' AND owner = auth.uid());

-- Lyrics files - public read, authenticated upload
CREATE POLICY "public_can_view_lyrics_files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lyrics-files');

CREATE POLICY "authenticated_users_upload_lyrics"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lyrics-files');

CREATE POLICY "owners_manage_lyrics_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'lyrics-files' AND owner = auth.uid())
WITH CHECK (bucket_id = 'lyrics-files' AND owner = auth.uid());

CREATE POLICY "owners_delete_lyrics_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'lyrics-files' AND owner = auth.uid());

-- User avatars - public read, own folder upload
CREATE POLICY "public_can_view_avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

CREATE POLICY "users_upload_own_avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_manage_own_avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-avatars' AND owner = auth.uid())
WITH CHECK (bucket_id = 'user-avatars' AND owner = auth.uid());

CREATE POLICY "users_delete_own_avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars' AND owner = auth.uid());

-- 10. TRIGGERS
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_song_stats_trigger
    AFTER INSERT ON public.performances
    FOR EACH ROW EXECUTE FUNCTION public.update_song_stats();

CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT ON public.performances
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- 11. SAMPLE DATA FOR DEVELOPMENT
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    song1_id UUID := gen_random_uuid();
    song2_id UUID := gen_random_uuid();
    song3_id UUID := gen_random_uuid();
    playlist1_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@karaoke.app', crypt('karaoke2024!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Karaoke Admin", "username": "karaokeadmin", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo@karaoke.app', crypt('karaoke2024!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Demo Singer", "username": "demosinger"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'rockstar@karaoke.app', crypt('karaoke2024!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Rock Star", "username": "rockstar"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Sample songs
    INSERT INTO public.songs (id, title, artist, album, genre, duration, difficulty, bpm, key_signature, release_year, uploaded_by, popularity_score) VALUES
        (song1_id, 'Sweet Caroline', 'Neil Diamond', 'Brother Love''s Travelling Salvation Show', 'pop', 201, 'easy', 125, 'C Major', 1969, admin_uuid, 95),
        (song2_id, 'Don''t Stop Believin''', 'Journey', 'Escape', 'rock', 251, 'medium', 119, 'E Major', 1981, admin_uuid, 98),
        (song3_id, 'Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 'rock', 355, 'expert', 72, 'Bb Major', 1975, admin_uuid, 100);

    -- Sample lyrics for Sweet Caroline
    INSERT INTO public.lyrics (song_id, line_number, start_time, end_time, text_content, pitch_target) VALUES
        (song1_id, 1, 0.000, 3.500, 'Where it began, I can''t begin to knowing', 261.63),
        (song1_id, 2, 3.500, 7.200, 'But then I know it''s growing strong', 293.66),
        (song1_id, 3, 7.200, 10.800, 'Was in the spring, and spring became the summer', 329.63),
        (song1_id, 4, 10.800, 14.500, 'Who''d have believed you''d come along', 349.23),
        (song1_id, 5, 18.000, 22.000, 'Hands, touching hands', 392.00),
        (song1_id, 6, 22.000, 26.500, 'Reaching out, touching me, touching you', 440.00),
        (song1_id, 7, 29.500, 33.000, 'Sweet Caroline', 523.25),
        (song1_id, 8, 35.000, 38.500, 'Good times never seemed so good', 493.88);

    -- Sample playlist
    INSERT INTO public.playlists (id, name, description, user_id, is_public, total_songs) VALUES
        (playlist1_id, 'Classic Rock Hits', 'The best classic rock songs for karaoke night!', user1_uuid, true, 2);

    -- Add songs to playlist
    INSERT INTO public.playlist_songs (playlist_id, song_id, position) VALUES
        (playlist1_id, song2_id, 1),
        (playlist1_id, song3_id, 2);

    -- Sample performances
    INSERT INTO public.performances (user_id, song_id, score, accuracy_percentage, timing_score, pitch_score, rhythm_score, overall_rating) VALUES
        (user1_uuid, song1_id, 87, 89.50, 85, 88, 89, 'good'),
        (user1_uuid, song2_id, 92, 94.20, 91, 93, 92, 'excellent'),
        (user2_uuid, song1_id, 78, 82.10, 76, 79, 80, 'good'),
        (user2_uuid, song3_id, 95, 96.80, 94, 96, 95, 'excellent');

    -- Sample leaderboard entries
    INSERT INTO public.leaderboards (song_id, user_id, best_score, rank_position) VALUES
        (song1_id, user1_uuid, 87, 1),
        (song1_id, user2_uuid, 78, 2),
        (song2_id, user1_uuid, 92, 1),
        (song3_id, user2_uuid, 95, 1);

    -- Sample user preferences
    INSERT INTO public.user_preferences (user_id, microphone_settings, audio_settings, visual_settings) VALUES
        (user1_uuid, 
         '{"sensitivity": 75, "noise_gate": true}',
         '{"volume": 80, "echo": 0.3, "reverb": 0.2}',
         '{"theme": "dark", "animations": true, "lyrics_size": "medium"}'
        ),
        (user2_uuid,
         '{"sensitivity": 80, "noise_gate": false}',
         '{"volume": 85, "echo": 0.4, "reverb": 0.1}',
         '{"theme": "light", "animations": false, "lyrics_size": "large"}'
        );

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;