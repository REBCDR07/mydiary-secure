-- Script de réactivation de la sécurité
-- À exécuter APRÈS les tests, avant la mise en production

-- 1. Réactiver RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- 2. Créer les politiques de sécurité pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Créer les politiques de sécurité pour diary_entries
CREATE POLICY "Users can view own entries" ON public.diary_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON public.diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Créer les politiques de sécurité pour user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Créer les politiques de sécurité pour backups
CREATE POLICY "Users can view own backups" ON public.backups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backups" ON public.backups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backups" ON public.backups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups" ON public.backups
    FOR DELETE USING (auth.uid() = user_id);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🔒 Sécurité réactivée :';
    RAISE NOTICE '✅ RLS activé sur toutes les tables';
    RAISE NOTICE '✅ Politiques de sécurité créées';
    RAISE NOTICE '⚠️  Réactivez la confirmation email dans le Dashboard pour la production';
END $$;