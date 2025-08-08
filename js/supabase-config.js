// Configuration Supabase pour MyDiary Secure
// Version: 2.0.0

// Configuration Supabase - Chargée depuis les variables d'environnement
let SUPABASE_CONFIG = {
  url: null, // Sera chargé depuis .env
  anonKey: null, // Sera chargé depuis .env

  // Options de configuration
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },

  // Configuration de la base de données
  db: {
    schema: "public",
  },

  // Configuration du stockage
  storage: {
    bucketName: "diary-attachments", // Pour futures fonctionnalités
  },
};

// Initialisation du client Supabase
let supabase = null;

// Fonction d'initialisation avec variables d'environnement
const initSupabase = async () => {
  try {
    // Charger la configuration depuis les variables d'environnement
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
      await loadSupabaseConfig();
    }

    if (typeof window !== "undefined" && window.supabase) {
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        {
          auth: SUPABASE_CONFIG.auth,
          db: SUPABASE_CONFIG.db,
        }
      );

      console.log("✅ Supabase initialisé avec succès");
      return true;
    } else {
      console.error(
        "❌ Supabase client non trouvé. Assurez-vous d'inclure le SDK Supabase."
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation Supabase:", error);
    return false;
  }
};

// Charger la configuration depuis les variables d'environnement
const loadSupabaseConfig = async () => {
  try {
    // Utiliser le loader d'environnement si disponible
    if (window.envLoader) {
      const config = await window.envLoader.load();
      SUPABASE_CONFIG.url = config.SUPABASE_URL;
      SUPABASE_CONFIG.anonKey = config.SUPABASE_ANON_KEY;
    } else {
      // Fallback vers les valeurs par défaut pour les tests locaux uniquement
      console.warn(
        "⚠️ EnvLoader non disponible, utilisation des valeurs de fallback pour tests"
      );
      // ATTENTION: Ces valeurs sont uniquement pour les tests locaux
      // En production, utilisez toujours les variables d'environnement
      SUPABASE_CONFIG.url = "https://lxijflrozgrninziwddd.supabase.co"; // fallback test URL
      SUPABASE_CONFIG.anonKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aWpmbHJvemdybmlueml3ZGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDc2NjUsImV4cCI6MjA3MDE4MzY2NX0.8apOCqYAMqx0vnq8RkyMJ1tdlur7hXEaAx516rycEao"; // fallback test key
    }

    console.log("✅ Configuration Supabase chargée depuis l'environnement");
  } catch (error) {
    console.error("❌ Erreur chargement configuration:", error);
    throw error;
  }
};

// Vérification de la connexion
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) throw error;
    console.log("✅ Connexion Supabase vérifiée");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion Supabase:", error.message);
    return false;
  }
};

// Gestionnaire d'erreurs Supabase
const handleSupabaseError = (error, context = "") => {
  console.error(`Erreur Supabase ${context}:`, error);

  // Messages d'erreur personnalisés
  const errorMessages = {
    "Invalid login credentials": "Identifiants de connexion invalides",
    "User already registered": "Cet utilisateur existe déjà",
    "Email not confirmed": "Veuillez confirmer votre email",
    "Password should be at least 6 characters":
      "Le mot de passe doit contenir au moins 6 caractères",
    "Unable to validate email address": "Adresse email invalide",
    "Network request failed": "Erreur de connexion réseau",
    "JWT expired": "Session expirée, veuillez vous reconnecter",
  };

  return (
    errorMessages[error.message] ||
    error.message ||
    "Une erreur inattendue s'est produite"
  );
};

// Utilitaires de validation
const validateSupabaseConfig = () => {
  const errors = [];

  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === "YOUR_SUPABASE_URL") {
    errors.push("URL Supabase non configurée");
  }

  if (
    !SUPABASE_CONFIG.anonKey ||
    SUPABASE_CONFIG.anonKey === "YOUR_SUPABASE_ANON_KEY"
  ) {
    errors.push("Clé anonyme Supabase non configurée");
  }

  if (errors.length > 0) {
    console.error("❌ Configuration Supabase invalide:", errors);
    return false;
  }

  return true;
};

// Export des utilitaires
window.SupabaseUtils = {
  config: SUPABASE_CONFIG,
  init: initSupabase,
  checkConnection: checkSupabaseConnection,
  handleError: handleSupabaseError,
  validate: validateSupabaseConfig,
  getClient: () => supabase,
};

// Auto-initialisation si le DOM est prêt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (validateSupabaseConfig()) {
      initSupabase();
    }
  });
} else {
  if (validateSupabaseConfig()) {
    initSupabase();
  }
}
