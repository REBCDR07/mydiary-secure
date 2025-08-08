// Chargeur de variables d'environnement pour MyDiary Secure
// Version: 2.0.0

class EnvLoader {
  constructor() {
    this.config = {};
    this.isLoaded = false;
  }

  // Charger les variables d'environnement
  async load() {
    try {
      // En développement, charger depuis .env
      if (this.isDevelopment()) {
        await this.loadFromEnvFile();
      } else {
        // En production, utiliser les variables d'environnement du serveur
        this.loadFromEnvironment();
      }

      this.isLoaded = true;
      console.log("✅ Configuration environnement chargée");
      return this.config;
    } catch (error) {
      console.error("❌ Erreur chargement configuration:", error);
      // Fallback vers la configuration par défaut
      this.loadFallbackConfig();
      return this.config;
    }
  }

  // Charger depuis le fichier .env (développement)
  async loadFromEnvFile() {
    try {
      const response = await fetch("/.env");
      if (!response.ok) {
        throw new Error("Fichier .env non trouvé");
      }

      const envContent = await response.text();
      this.parseEnvContent(envContent);
    } catch (error) {
      console.warn("⚠️ Impossible de charger .env, utilisation du fallback");
      this.loadFallbackConfig();
    }
  }

  // Charger depuis les variables d'environnement (production)
  loadFromEnvironment() {
    // En production, ces variables seraient injectées par le serveur
    this.config = {
      SUPABASE_URL: window.ENV?.SUPABASE_URL || this.getFallbackUrl(),
      SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || this.getFallbackKey(),
      APP_NAME: window.ENV?.APP_NAME || "MyDiary Secure",
      APP_VERSION: window.ENV?.APP_VERSION || "2.0.0",
      APP_ENVIRONMENT: window.ENV?.APP_ENVIRONMENT || "production",
      ENABLE_DEBUG: window.ENV?.ENABLE_DEBUG === "true",
      ENABLE_CONSOLE_LOGS: window.ENV?.ENABLE_CONSOLE_LOGS === "true",
    };
  }

  // Parser le contenu du fichier .env
  parseEnvContent(content) {
    const lines = content.split("\n");

    lines.forEach((line) => {
      line = line.trim();

      // Ignorer les commentaires et lignes vides
      if (line.startsWith("#") || !line) return;

      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        this.config[key.trim()] = value;
      }
    });
  }

  // Configuration de fallback (pour les tests)
  loadFallbackConfig() {
    console.warn("⚠️ Utilisation de la configuration de fallback");
    this.config = {
      SUPABASE_URL: this.getFallbackUrl(),
      SUPABASE_ANON_KEY: this.getFallbackKey(),
      APP_NAME: "MyDiary Secure",
      APP_VERSION: "2.0.0",
      APP_ENVIRONMENT: "development",
      ENABLE_DEBUG: true,
      ENABLE_CONSOLE_LOGS: true,
    };
  }

  // URL de fallback (pour les tests locaux uniquement)
  getFallbackUrl() {
    // ATTENTION: Valeur de test uniquement - remplacez par vos vraies valeurs dans .env
    return "https://lxijflrozgrninziwddd.supabase.co"; // fallback test URL
  }

  // Clé de fallback (pour les tests locaux uniquement)
  getFallbackKey() {
    // ATTENTION: Valeur de test uniquement - remplacez par vos vraies valeurs dans .env
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aWpmbHJvemdybmlueml3ZGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDc2NjUsImV4cCI6MjA3MDE4MzY2NX0.8apOCqYAMqx0vnq8RkyMJ1tdlur7hXEaAx516rycEao"; // fallback test key
  }

  // Vérifier si on est en développement
  isDevelopment() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("local")
    );
  }

  // Obtenir une variable de configuration
  get(key, defaultValue = null) {
    if (!this.isLoaded) {
      console.warn(
        "⚠️ Configuration non chargée, utilisez await envLoader.load()"
      );
    }
    return this.config[key] || defaultValue;
  }

  // Obtenir toute la configuration
  getAll() {
    return { ...this.config };
  }

  // Vérifier si la configuration est valide
  isValid() {
    return (
      this.config.SUPABASE_URL &&
      this.config.SUPABASE_ANON_KEY &&
      this.config.SUPABASE_URL.startsWith("https://") &&
      this.config.SUPABASE_ANON_KEY.length > 50
    );
  }

  // Masquer les informations sensibles pour les logs
  getSafeConfig() {
    const safeConfig = { ...this.config };

    if (safeConfig.SUPABASE_ANON_KEY) {
      safeConfig.SUPABASE_ANON_KEY =
        safeConfig.SUPABASE_ANON_KEY.substring(0, 10) + "...";
    }

    return safeConfig;
  }
}

// Instance globale
window.envLoader = new EnvLoader();

// Export pour utilisation
window.EnvLoader = EnvLoader;
