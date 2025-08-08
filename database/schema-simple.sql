-- MyDiary Secure - Schéma simplifié pour débogage
-- Version: 2.0.0

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "theme": "light",
        "font_preference": "font-inter",
        "notifications_enabled": true,
        "auto_backup": true
    }'::jsonb,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Table des entrées de journal
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT, -- Contenu en clair pour les entrées non chiffrées
    encrypted_content TEXT, -- Contenu chiffré pour les entrées protégées
    mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'angry', 'anxious')),
    font_style TEXT DEFAULT 'font-inter' CHECK (font_style IN ('font-inter', 'font-roboto', 'font-indie', 'font-mono')),
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_salt TEXT, -- Salt unique pour chaque entrée chiffrée
    tags TEXT[] DEFAULT '{}', -- Tags pour catégorisation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    CONSTRAINT content_required CHECK (
        (is_encrypted = FALSE AND content IS NOT NULL) OR 
        (is_encrypted = TRUE AND encrypted_content IS NOT NULL)
    )
);

-- Table pour les statistiques utilisateur (cache des calculs)
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_entries INTEGER DEFAULT 0,
    writing_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    most_common_mood TEXT,
    entries_this_month INTEGER DEFAULT 0,
    entries_this_year INTEGER DEFAULT 0,
    last_entry_date DATE,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les sauvegardes automatiques
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    backup_data JSONB NOT NULL,
    backup_type TEXT DEFAULT 'auto' CHECK (backup_type IN ('auto', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON public.diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_mood ON public.diary_entries(mood);
CREATE INDEX IF NOT EXISTS idx_diary_entries_tags ON public.diary_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_expires_at ON public.backups(expires_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer les triggers existants s'ils existent
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON public.diary_entries;

-- Créer les triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at 
    BEFORE UPDATE ON public.diary_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les statistiques utilisateur (version simplifiée)
CREATE OR REPLACE FUNCTION calculate_user_stats(target_user_id UUID)
RETURNS void AS $$
DECLARE
    entry_count INTEGER;
    month_count INTEGER;
    year_count INTEGER;
    common_mood TEXT;
    last_entry DATE;
BEGIN
    -- Compter le total d'entrées
    SELECT COUNT(*) INTO entry_count
    FROM public.diary_entries
    WHERE user_id = target_user_id;
    
    -- Calculer les entrées du mois
    SELECT COUNT(*) INTO month_count
    FROM public.diary_entries
    WHERE user_id = target_user_id
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Calculer les entrées de l'année
    SELECT COUNT(*) INTO year_count
    FROM public.diary_entries
    WHERE user_id = target_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Trouver l'humeur la plus commune
    SELECT mood INTO common_mood
    FROM public.diary_entries
    WHERE user_id = target_user_id
    GROUP BY mood
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Dernière entrée
    SELECT DATE(created_at) INTO last_entry
    FROM public.diary_entries
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Insérer ou mettre à jour les statistiques
    INSERT INTO public.user_stats (
        user_id, total_entries, writing_streak, longest_streak,
        most_common_mood, entries_this_month, entries_this_year,
        last_entry_date, last_calculated
    ) VALUES (
        target_user_id, entry_count, 0, 0,
        common_mood, month_count, year_count,
        last_entry, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_entries = EXCLUDED.total_entries,
        most_common_mood = EXCLUDED.most_common_mood,
        entries_this_month = EXCLUDED.entries_this_month,
        entries_this_year = EXCLUDED.entries_this_year,
        last_entry_date = EXCLUDED.last_entry_date,
        last_calculated = EXCLUDED.last_calculated;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Initialiser les statistiques
    INSERT INTO public.user_stats (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activer RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can view own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can create own backups" ON public.backups;

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour diary_entries
CREATE POLICY "Users can view own entries" ON public.diary_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON public.diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour backups
CREATE POLICY "Users can view own backups" ON public.backups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backups" ON public.backups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour nettoyer les sauvegardes expirées
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS void AS $$
BEGIN
    DELETE FROM public.backups WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs étendus';
COMMENT ON TABLE public.diary_entries IS 'Entrées de journal avec support chiffrement';
COMMENT ON TABLE public.user_stats IS 'Statistiques utilisateur mises en cache';
COMMENT ON TABLE public.backups IS 'Sauvegardes automatiques des données';

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'MyDiary Secure - Schéma de base de données installé avec succès !';
    RAISE NOTICE 'Tables créées: profiles, diary_entries, user_stats, backups';
    RAISE NOTICE 'Fonctions créées: handle_new_user, calculate_user_stats, cleanup_expired_backups';
    RAISE NOTICE 'Politiques RLS activées pour toutes les tables';
END $$;