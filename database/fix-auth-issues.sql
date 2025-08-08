-- Script de correction des problèmes d'authentification
-- MyDiary Secure - Version de débogage

-- 1. Désactiver temporairement RLS pour les tests
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que les tables existent
SELECT 'profiles' as table_name, count(*) as row_count FROM public.profiles
UNION ALL
SELECT 'diary_entries' as table_name, count(*) as row_count FROM public.diary_entries
UNION ALL
SELECT 'user_stats' as table_name, count(*) as row_count FROM public.user_stats
UNION ALL
SELECT 'backups' as table_name, count(*) as row_count FROM public.backups;

-- 3. Créer un utilisateur de test si nécessaire
-- (Cette partie sera exécutée manuellement si besoin)

-- 4. Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 5. Afficher les utilisateurs existants (pour debug)
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Afficher les profils existants
SELECT id, username, full_name, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🔧 Corrections appliquées :';
    RAISE NOTICE '✅ RLS désactivé temporairement';
    RAISE NOTICE '✅ Tables vérifiées';
    RAISE NOTICE '⚠️  N''oubliez pas de désactiver la confirmation email dans le Dashboard';
    RAISE NOTICE '⚠️  Réactivez RLS après les tests';
END $$;