# 🚨 Guide de Résolution - Problèmes Netlify + Supabase

## 🔍 Problème : Compte créé mais pas visible dans la base de données

### **Causes Possibles**

1. **Variables d'environnement non configurées sur Netlify**
2. **Politiques RLS (Row Level Security) mal configurées**
3. **Erreur de configuration Supabase**
4. **Problème de réseau ou de CORS**

---

## 🛠️ Solutions Étape par Étape

### **Étape 1 : Vérifier les Variables d'Environnement sur Netlify**

1. **Accédez à votre dashboard Netlify**

   - Allez sur [netlify.com](https://netlify.com)
   - Sélectionnez votre site MyDiary Secure

2. **Configurez les variables d'environnement**

   ```bash
   # Dans Site settings > Environment variables
   SUPABASE_URL = https://votre-projet.supabase.co
   SUPABASE_ANON_KEY = votre_vraie_cle_anon_key_ici
   APP_NAME = MyDiary Secure
   APP_VERSION = 2.0.0
   APP_ENVIRONMENT = production
   ENABLE_DEBUG = false
   ENABLE_CONSOLE_LOGS = false
   ```

3. **Redéployez le site**
   - Allez dans Deploys
   - Cliquez sur "Trigger deploy" > "Deploy site"

### **Étape 2 : Vérifier la Configuration Supabase**

1. **Accédez à votre projet Supabase**

   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet

2. **Vérifiez l'authentification**

   ```sql
   -- Dans SQL Editor, exécutez :
   SELECT * FROM auth.users;
   ```

3. **Vérifiez les politiques RLS**

   ```sql
   -- Vérifiez que RLS est activé
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'diary_entries';

   -- Vérifiez les politiques
   SELECT * FROM pg_policies WHERE tablename = 'diary_entries';
   ```

### **Étape 3 : Diagnostic avec l'Outil de Debug**

1. **Accédez à l'outil de diagnostic**

   - Ouvrez `https://votre-site.netlify.app/debug-supabase.html`
   - Ouvrez la console du navigateur (F12)

2. **Analysez les résultats**
   - ✅ Variables d'environnement chargées
   - ✅ Client Supabase initialisé
   - ✅ Connexion à la base de données
   - ⚠️ Vérifiez les erreurs éventuelles

### **Étape 4 : Corriger les Politiques RLS**

Si les utilisateurs ne sont pas visibles, exécutez ces requêtes SQL :

```sql
-- 1. Activer RLS sur la table diary_entries
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 2. Politique pour permettre aux utilisateurs de voir leurs propres entrées
CREATE POLICY "Users can view own entries" ON diary_entries
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Politique pour permettre aux utilisateurs de créer des entrées
CREATE POLICY "Users can insert own entries" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Politique pour permettre aux utilisateurs de modifier leurs entrées
CREATE POLICY "Users can update own entries" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Politique pour permettre aux utilisateurs de supprimer leurs entrées
CREATE POLICY "Users can delete own entries" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);
```

### **Étape 5 : Vérifier les URLs et CORS**

1. **Vérifiez l'URL de votre site**

   - Dans Supabase > Settings > API
   - Ajoutez votre URL Netlify dans "Site URL"
   - Exemple : `https://votre-site.netlify.app`

2. **Configurez les URLs autorisées**
   ```
   Site URL: https://votre-site.netlify.app
   Additional redirect URLs:
   - https://votre-site.netlify.app/
   - https://votre-site.netlify.app/index.html
   ```

---

## 🔧 Commandes de Debug Utiles

### **Tester la Connexion Supabase**

```javascript
// Dans la console du navigateur
const { data, error } = await supabase.auth.getSession();
console.log("Session:", data, "Error:", error);
```

### **Vérifier les Variables d'Environnement**

```javascript
// Dans la console du navigateur
const config = await window.envLoader.load();
console.log("Config:", config);
```

### **Tester l'Inscription**

```javascript
// Dans la console du navigateur
const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: "motdepasse123",
});
console.log("SignUp:", data, "Error:", error);
```

---

## 📋 Checklist de Vérification

- [ ] Variables d'environnement configurées sur Netlify
- [ ] Site redéployé après configuration des variables
- [ ] URL du site ajoutée dans Supabase
- [ ] Politiques RLS configurées correctement
- [ ] Outil de diagnostic exécuté sans erreur
- [ ] Test d'inscription/connexion fonctionnel

---

## 🆘 Si le Problème Persiste

### **1. Vérifiez les Logs Netlify**

- Allez dans Functions > View logs
- Recherchez les erreurs liées à Supabase

### **2. Vérifiez les Logs Supabase**

- Dans votre projet Supabase > Logs
- Regardez les erreurs d'authentification

### **3. Contactez le Support**

- 📧 Email : eltonhounnou27@gmail.com
- 💬 WhatsApp : +229 40 66 33 49
- 🐙 GitHub Issues : [Créer un ticket](https://github.com/REBCDR07/mydiary-secure/issues)

---

## 🎯 Configuration Recommandée pour la Production

### **Variables d'Environnement Netlify**

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
APP_ENVIRONMENT=production
ENABLE_DEBUG=false
ENABLE_CONSOLE_LOGS=false
```

### **Configuration Supabase**

```
Site URL: https://votre-site.netlify.app
JWT expiry: 3600 (1 heure)
Enable email confirmations: true
Enable phone confirmations: false
```

### **Headers de Sécurité (netlify.toml)**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

**💡 Conseil** : Utilisez toujours l'outil de diagnostic `debug-supabase.html` pour identifier rapidement les problèmes de configuration.
