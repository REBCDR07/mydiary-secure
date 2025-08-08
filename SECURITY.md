# 🔒 Guide de Sécurité - MyDiary Secure

## 📋 Configuration des Variables d'Environnement

### **Étapes d'Installation Sécurisée**

1. **Cloner le projet**

   ```bash
   git clone https://github.com/REBCDR07/mydiary-secure.git
   cd mydiary-secure
   ```

2. **Configurer les variables d'environnement**

   ```bash
   # Copier le template
   cp .env.example .env

   # Éditer avec vos vraies valeurs
   nano .env
   ```

3. **Remplir le fichier .env**

   ```env
   # Remplacez par vos vraies valeurs Supabase
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_ANON_KEY=votre_vraie_cle_anon_ici

   # Configuration de l'application
   APP_NAME=MyDiary Secure
   APP_VERSION=2.0.0
   APP_ENVIRONMENT=production

   # Sécurité (désactiver en production)
   ENABLE_DEBUG=false
   ENABLE_CONSOLE_LOGS=false
   ```

## 🛡️ Bonnes Pratiques de Sécurité

### **Variables d'Environnement**

- ✅ **Jamais** commiter le fichier `.env`
- ✅ Utiliser `.env.example` comme template
- ✅ Différentes configurations pour dev/prod
- ✅ Clés rotées régulièrement

### **Déploiement**

- ✅ Variables injectées par le serveur en production
- ✅ HTTPS obligatoire
- ✅ Headers de sécurité configurés
- ✅ Logs désactivés en production

### **Supabase**

- ✅ RLS (Row Level Security) activé
- ✅ Politiques de sécurité configurées
- ✅ Clés API avec permissions minimales
- ✅ Monitoring des accès

## 🚀 Déploiement Sécurisé

### **Variables d'Environnement par Plateforme**

#### **Vercel**

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

#### **Netlify**

```bash
netlify env:set SUPABASE_URL "https://votre-projet.supabase.co"
netlify env:set SUPABASE_ANON_KEY "votre_cle"
```

#### **GitHub Pages avec Actions**

```yaml
# .github/workflows/deploy.yml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## ⚠️ Checklist de Sécurité

Avant de publier sur GitHub :

- [ ] Fichier `.env` ajouté au `.gitignore`
- [ ] Clés API supprimées du code source
- [ ] `.env.example` créé avec des valeurs factices
- [ ] Variables d'environnement configurées sur la plateforme de déploiement
- [ ] Tests effectués avec les vraies variables
- [ ] Documentation de sécurité mise à jour

## 🔍 Vérification

Pour vérifier que tout est sécurisé :

```bash
# Vérifier que .env n'est pas tracké
git status

# Rechercher des clés dans le code
grep -r "supabase.co" --exclude-dir=node_modules .
grep -r "eyJhbGciOiJIUzI1NiI" --exclude-dir=node_modules .
```

## 📞 Support

En cas de problème de sécurité :

- 📧 Email : eltonhounnou2@gmail.com
- 💬 WhatsApp : +229 40 66 33 49
- 🐙 GitHub Issues : [Créer un ticket](https://github.com/REBCDR07/mydiary-secure/issues)

---

**⚠️ IMPORTANT** : Ne jamais partager vos clés API ou variables d'environnement publiquement !
