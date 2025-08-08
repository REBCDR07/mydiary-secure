# 📔 MyDiary Secure

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)
![Security](https://img.shields.io/badge/security-AES--256--GCM-red.svg)

**Version 2.0.0** - Journal intime personnel avec chiffrement de bout en bout et sécurité renforcée

## 🌟 Présentation

MyDiary Secure est une application web moderne et sécurisée qui vous permet de tenir un journal intime personnel avec un chiffrement de bout en bout. Vos pensées, émotions et souvenirs restent privés et sécurisés, accessibles uniquement par vous.

## ✨ Fonctionnalités Principales

### 🔐 **Sécurité Avancée**

- **Chiffrement AES-256-GCM** : Vos données sont chiffrées localement avant d'être stockées
- **Authentification sécurisée** : Système de connexion robuste avec Supabase
- **Variables d'environnement** : Configuration sécurisée des clés API
- **Protection des données** : Aucun accès possible à vos données sans votre mot de passe

### 📝 **Gestion des Entrées**

- **Éditeur intuitif** : Interface simple et élégante pour rédiger vos entrées
- **Organisation par date** : Vos entrées sont automatiquement organisées chronologiquement
- **Recherche avancée** : Trouvez rapidement vos entrées par mots-clés ou dates
- **Modification facile** : Éditez vos entrées à tout moment

### 😊 **Suivi d'Humeur**

- **Classification émotionnelle** : Associez une humeur à chaque entrée
- **Statistiques visuelles** : Graphiques et analyses de votre bien-être émotionnel
- **Tendances temporelles** : Suivez l'évolution de votre humeur au fil du temps

### 🎨 **Interface Moderne**

- **Design responsive** : Optimisé pour tous les appareils (mobile, tablette, desktop)
- **Mode sombre/clair** : Basculez entre les thèmes selon vos préférences
- **Animations fluides** : Expérience utilisateur agréable et moderne
- **Interface intuitive** : Navigation simple et ergonomique

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Styling** : Tailwind CSS pour un design moderne et responsive
- **Backend** : Supabase (Base de données PostgreSQL + Authentification)
- **Chiffrement** : Web Crypto API (AES-256-GCM, PBKDF2)
- **Sécurité** : Variables d'environnement, loader de configuration
- **Icons** : Font Awesome 6
- **Animations** : CSS3 Transitions et Animations

## 📁 Structure du Projet

```
mydiary-secure/
├── 📄 index.html              # Application principale
├── 📄 .env                    # Variables d'environnement (non versionné)
├── 📄 .env.example           # Template de configuration
├── 📄 .gitignore             # Fichiers à ignorer par Git
├── 📄 README.md              # Documentation principale
├── 📄 SECURITY.md            # Guide de sécurité
├── 📄 check-security.js      # Script de vérification de sécurité
│
├── 📁 js/                    # Scripts JavaScript
│   ├── 📄 script.js          # Script principal (mode local)
│   ├── 📄 script-supabase.js # Script principal (mode Supabase)
│   ├── 📄 env-loader.js      # Chargeur de variables d'environnement
│   ├── 📄 supabase-config.js # Configuration Supabase
│   ├── 📄 supabase-auth.js   # Authentification Supabase
│   ├── 📄 supabase-data.js   # Gestion des données Supabase
│   └── 📄 tailwind.js        # Configuration Tailwind
│
├── 📁 styles/                # Feuilles de style
│   ├── 📄 style.css          # Styles principaux
│   └── 📄 main.css           # Styles additionnels
│
├── 📁 gdu/                   # Conditions Générales d'Utilisation
│   └── 📄 index.html         # CGU en format HTML
│
└── 📁 database/              # Scripts de base de données
    ├── 📄 schema.sql         # Schéma principal
    ├── 📄 schema-simple.sql  # Schéma simplifié
    └── 📄 *.sql              # Autres scripts SQL
```

## 🚀 Installation

### Prérequis

- Navigateur web moderne supportant :
  - ES6+ (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
  - Web Crypto API
  - LocalStorage
  - CSS Grid et Flexbox

### Étapes d'Installation

1. **Téléchargement**

   ```bash
   # Cloner le projet
   git clone https://github.com/REBCDR07/mydiary-secure.git
   cd mydiary-secure
   ```

2. **Configuration des variables d'environnement**

   ```bash
   # Copier le template de configuration
   cp .env.example .env

   # Éditer le fichier .env avec vos vraies clés Supabase
   # Remplacez les valeurs par vos vraies clés depuis votre projet Supabase
   ```

3. **Lancement**

   ```bash
   # Utiliser un serveur local (obligatoire pour les variables d'environnement)
   python -m http.server 8000
   # Puis accéder à http://localhost:8000

   # Ou avec Node.js
   npx http-server -p 8000
   ```

4. **Vérification de sécurité** (optionnel)
   ```bash
   # Vérifier que la configuration est sécurisée
   node check-security.js
   ```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec vos clés Supabase :

```env
# Configuration Supabase (remplacez par vos vraies valeurs)
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

### Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez les scripts SQL du dossier `database/`
3. Configurez les politiques RLS (Row Level Security)
4. Récupérez vos clés API depuis les paramètres du projet

## 🛡️ Sécurité

### Fonctionnalités de Sécurité

- ✅ **Chiffrement local** : AES-256-GCM avec PBKDF2
- ✅ **Variables d'environnement** : Clés API protégées
- ✅ **Authentification robuste** : Supabase Auth
- ✅ **RLS activé** : Politiques de sécurité au niveau base de données
- ✅ **Validation des entrées** : Protection contre les injections
- ✅ **HTTPS obligatoire** : Chiffrement des communications

### Script de Vérification

```bash
# Vérifier la sécurité avant publication
node check-security.js
```

Ce script vérifie :

- Présence des fichiers de configuration
- Absence de clés hardcodées
- Configuration Git correcte
- Structure de sécurité

## 📱 Utilisation

### Première utilisation

1. **Inscription** : Créez un compte avec votre email
2. **Connexion** : Connectez-vous avec vos identifiants
3. **Première entrée** : Rédigez votre première entrée de journal
4. **Personnalisation** : Configurez vos préférences (thème, police, etc.)

### Fonctionnalités Avancées

- **Recherche** : Utilisez la barre de recherche pour trouver vos entrées
- **Filtres** : Filtrez par humeur ou période
- **Statistiques** : Consultez vos statistiques d'humeur
- **Export** : Sauvegardez vos données (fonctionnalité à venir)

## 🚀 Déploiement

### Plateformes Supportées

- **Vercel** : Déploiement automatique avec variables d'environnement
- **Netlify** : Support des variables d'environnement
- **GitHub Pages** : Avec GitHub Actions pour les variables
- **Serveur personnel** : Apache/Nginx avec HTTPS

### Variables d'Environnement par Plateforme

#### Vercel

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

#### Netlify

```bash
netlify env:set SUPABASE_URL "https://votre-projet.supabase.co"
netlify env:set SUPABASE_ANON_KEY "votre_cle"
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines de Contribution

- Respectez le style de code existant
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Vérifiez la sécurité avec `node check-security.js`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

### Contacts

- 📧 **Email** : [eltonhounnou27@gmail.com](mailto:eltonhounnou27@gmail.com)
- 💬 **WhatsApp** : [+229 40 66 33 49](https://wa.me/+22940663349)
- 🐙 **GitHub** : [REBCDR07](https://github.com/REBCDR07)

### Documentation

- 📖 **Guide de sécurité** : [SECURITY.md](SECURITY.md)
- 📋 **Conditions d'utilisation** : [CGU](gdu/index.html)
- 🔧 **Configuration Supabase** : Voir section Configuration

## 🎯 Roadmap

### Version 2.1.0 (À venir)

- [ ] Export/Import des données
- [ ] Sauvegarde automatique cloud
- [ ] Thèmes personnalisés
- [ ] Mode hors ligne

### Version 2.2.0 (Futur)

- [ ] Application mobile (PWA)
- [ ] Partage sécurisé d'entrées
- [ ] Rappels et notifications
- [ ] Analyse d'humeur IA

## 🙏 Remerciements

- **Supabase** pour l'infrastructure backend
- **Tailwind CSS** pour le framework CSS
- **Font Awesome** pour les icônes
- **Manus AI** pour l'assistance au développement

---

<div align="center">

**MyDiary Secure** - Votre confidentialité, notre engagement.

[![GitHub stars](https://img.shields.io/github/stars/REBCDR07/mydiary-secure?style=social)](https://github.com/REBCDR07/mydiary-secure/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/REBCDR07/mydiary-secure?style=social)](https://github.com/REBCDR07/mydiary-secure/network/members)

</div>
