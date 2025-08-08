// Gestionnaire d'authentification Supabase pour MyDiary Secure
// Version: 2.0.0

class SupabaseAuthManager {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.isInitialized = false;
  }

  // Initialisation
  async init() {
    if (!supabase) {
      throw new Error("Supabase non initialisé");
    }

    // Récupérer la session actuelle
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Erreur lors de la récupération de la session:", error);
    } else if (session) {
      this.session = session;
      this.currentUser = session.user;
      console.log("✅ Session utilisateur restaurée");
    }

    // Écouter les changements d'authentification
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Changement d'état auth:", event);

      this.session = session;
      this.currentUser = session?.user || null;

      switch (event) {
        case "SIGNED_IN":
          this.handleSignIn(session);
          break;
        case "SIGNED_OUT":
          this.handleSignOut();
          break;
        case "TOKEN_REFRESHED":
          console.log("🔄 Token rafraîchi");
          break;
        case "USER_UPDATED":
          console.log("👤 Utilisateur mis à jour");
          break;
      }
    });

    this.isInitialized = true;
    return this.currentUser;
  }

  // Inscription
  async signUp(email, password, username, fullName = "") {
    try {
      // Vérifier si le nom d'utilisateur est disponible
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingProfile) {
        throw new Error("Ce nom d'utilisateur est déjà pris");
      }

      // Créer le compte
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email de confirmation requis
        return {
          success: true,
          requiresConfirmation: true,
          message: "Veuillez vérifier votre email pour confirmer votre compte",
        };
      }

      return {
        success: true,
        user: data.user,
        message: "Compte créé avec succès",
      };
    } catch (error) {
      console.error("Erreur inscription:", error);
      throw new Error(SupabaseUtils.handleError(error, "inscription"));
    }
  }

  // Connexion
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Récupérer le profil utilisateur
      const profile = await this.getUserProfile(data.user.id);

      return {
        success: true,
        user: data.user,
        profile,
        message: `Bienvenue ${profile?.username || "utilisateur"} !`,
      };
    } catch (error) {
      console.error("Erreur connexion:", error);
      throw new Error(SupabaseUtils.handleError(error, "connexion"));
    }
  }

  // Connexion avec nom d'utilisateur
  async signInWithUsername(username, password) {
    try {
      // Utiliser un email valide pour les tests (à remplacer en production)
      // car nous n'avons pas accès à l'API admin côté client
      const email = "eltonhounnou2@gmail.com";

      // Essayer de se connecter avec l'email généré
      return await this.signIn(email, password);
    } catch (error) {
      console.error("Erreur connexion username:", error);
      throw new Error(SupabaseUtils.handleError(error, "connexion"));
    }
  }

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return {
        success: true,
        message: "Déconnexion réussie",
      };
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      throw new Error(SupabaseUtils.handleError(error, "déconnexion"));
    }
  }

  // Récupérer le profil utilisateur
  async getUserProfile(userId = null) {
    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur récupération profil:", error);
      return null;
    }
  }

  // Mettre à jour le profil
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error("Utilisateur non connecté");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data,
        message: "Profil mis à jour avec succès",
      };
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      throw new Error(SupabaseUtils.handleError(error, "mise à jour profil"));
    }
  }

  // Changer le mot de passe
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: "Mot de passe mis à jour avec succès",
      };
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      throw new Error(
        SupabaseUtils.handleError(error, "changement mot de passe")
      );
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: "Email de réinitialisation envoyé",
      };
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      throw new Error(SupabaseUtils.handleError(error, "réinitialisation"));
    }
  }

  // Gestionnaires d'événements
  handleSignIn(session) {
    console.log("👤 Utilisateur connecté:", session.user.email);

    // Déclencher l'événement personnalisé
    window.dispatchEvent(
      new CustomEvent("userSignedIn", {
        detail: { user: session.user, session },
      })
    );
  }

  handleSignOut() {
    console.log("👋 Utilisateur déconnecté");

    // Nettoyer les données locales
    this.currentUser = null;
    this.session = null;

    // Déclencher l'événement personnalisé
    window.dispatchEvent(new CustomEvent("userSignedOut"));
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.currentUser && !!this.session;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Obtenir la session actuelle
  getSession() {
    return this.session;
  }

  // Vérifier les permissions
  async checkPermissions(resource, action) {
    if (!this.isAuthenticated()) {
      return false;
    }

    // Logique de permissions basique
    // Peut être étendue selon les besoins
    return true;
  }
}

// Instance globale
window.supabaseAuth = new SupabaseAuthManager();

// Export pour utilisation
window.SupabaseAuth = SupabaseAuthManager;
