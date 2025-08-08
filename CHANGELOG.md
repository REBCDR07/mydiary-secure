# 📋 Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-07

### 🎉 Ajouté

- **Authentification Supabase** : Système de connexion sécurisé avec email/mot de passe
- **Base de données cloud** : Stockage sécurisé des données avec Supabase PostgreSQL
- **Variables d'environnement** : Configuration sécurisée des clés API
- **Loader d'environnement** : Chargement automatique des variables depuis `.env`
- **Script de sécurité** : `check-security.js` pour vérifier la configuration
- **CGU en HTML** : Conditions Générales d'Utilisation avec interface moderne
- **Guide de sécurité** : Documentation complète des bonnes pratiques
- **Chiffrement renforcé** : AES-256-GCM avec dérivation PBKDF2
- **Mode multi-utilisateurs** : Chaque utilisateur a ses propres données chiffrées

### 🔧 Modifié

- **Architecture de sécurité** : Migration vers un système basé sur les variables d'environnement
- **Stockage des données** : Passage du localStorage vers une base de données chiffrée
- **Interface utilisateur** : Améliorations du design et de l'expérience utilisateur
- **Documentation** : README complet avec structure du projet et guide d'installation

### 🛡️ Sécurité

- **Protection des clés API** : Plus de clés hardcodées dans le code source
- **Chiffrement bout en bout** : Toutes les données sont chiffrées côté client
- **Authentification robuste** : Système de connexion sécurisé avec Supabase Auth
- **Politiques RLS** : Row Level Security activé au niveau base de données

### 🗑️ Supprimé

- **Fichiers de test** : Suppression des fichiers de test et de debug obsolètes
- **Documentation obsolète** : Nettoyage des guides de configuration anciens
- **Clés hardcodées** : Suppression de toutes les clés API du code source

---

## [1.0.0] - 2024-12-XX

### 🎉 Version Initiale

- **Interface de base** : Application de journal intime avec mode sombre/clair
- **Stockage local** : Sauvegarde dans le localStorage du navigateur
- **Chiffrement basique** : Chiffrement des données côté client
- **Suivi d'humeur** : Classification des émotions et statistiques
- **Design responsive** : Interface adaptée à tous les écrans
- **Recherche** : Fonctionnalité de recherche dans les entrées

---

## 🔮 Versions Futures

### [2.1.0] - Planifié

- [ ] Export/Import des données
- [ ] Sauvegarde automatique cloud
- [ ] Thèmes personnalisés
- [ ] Mode hors ligne (PWA)

### [2.2.0] - En Réflexion

- [ ] Application mobile native
- [ ] Partage sécurisé d'entrées
- [ ] Rappels et notifications
- [ ] Analyse d'humeur avec IA

---

## 📝 Notes de Version

### Compatibilité

- **Navigateurs supportés** : Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **APIs requises** : Web Crypto API, LocalStorage, Fetch API
- **Dépendances** : Supabase, Tailwind CSS, Font Awesome

### Migration depuis v1.0.0

1. Créer un compte Supabase
2. Configurer les variables d'environnement
3. Migrer les données existantes (guide à venir)
4. Tester la nouvelle configuration

### Support

Pour toute question sur les versions :

- 📧 Email : eltonhounnou27@gmail.com
- 💬 WhatsApp : +229 40 66 33 49
- 🐙 GitHub Issues : [Créer un ticket](https://github.com/REBCDR07/mydiary-secure/issues)
