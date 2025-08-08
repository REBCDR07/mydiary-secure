// Gestionnaire de données Supabase pour MyDiary Secure
// Version: 2.0.0

class SupabaseDataManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Vérifier l'authentification
  _checkAuth() {
    if (!supabaseAuth.isAuthenticated()) {
      throw new Error("Utilisateur non connecté");
    }
    return supabaseAuth.getCurrentUser();
  }

  // Gestion du cache
  _getCacheKey(table, params = {}) {
    return `${table}_${JSON.stringify(params)}`;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  _getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  _clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // === GESTION DES ENTRÉES ===

  // Créer une nouvelle entrée
  async createEntry(entryData) {
    try {
      const user = this._checkAuth();

      // Préparer les données
      const entry = {
        user_id: user.id,
        title: entryData.title.trim(),
        mood: entryData.mood,
        font_style: entryData.font || "font-inter",
        tags: entryData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Gestion du chiffrement
      if (entryData.password && entryData.content) {
        // Générer un salt unique pour cette entrée
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Chiffrer le contenu
        const encryptedContent = await this._encryptContent(
          entryData.content,
          entryData.password,
          salt
        );

        entry.encrypted_content = encryptedContent;
        entry.is_encrypted = true;
        entry.encryption_salt = saltHex;
      } else {
        entry.content = entryData.content;
        entry.is_encrypted = false;
      }

      // Insérer en base
      const { data, error } = await supabase
        .from("diary_entries")
        .insert(entry)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      this._clearCache("diary_entries");
      this._clearCache("user_stats");

      return {
        success: true,
        entry: data,
        message: "Entrée créée avec succès",
      };
    } catch (error) {
      console.error("Erreur création entrée:", error);
      throw new Error(SupabaseUtils.handleError(error, "création entrée"));
    }
  }

  // Récupérer toutes les entrées de l'utilisateur
  async getUserEntries(options = {}) {
    try {
      const user = this._checkAuth();
      const cacheKey = this._getCacheKey("diary_entries", {
        userId: user.id,
        ...options,
      });

      // Vérifier le cache
      const cached = this._getCache(cacheKey);
      if (cached && !options.forceRefresh) {
        return cached;
      }

      let query = supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id);

      // Filtres
      if (options.mood) {
        query = query.eq("mood", options.mood);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps("tags", options.tags);
      }

      if (options.dateFrom) {
        query = query.gte("created_at", options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte("created_at", options.dateTo);
      }

      // Tri
      const orderBy = options.orderBy || "created_at";
      const orderDirection = options.orderDirection || "desc";
      query = query.order(orderBy, { ascending: orderDirection === "asc" });

      // Pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mettre en cache
      this._setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Erreur récupération entrées:", error);
      throw new Error(SupabaseUtils.handleError(error, "récupération entrées"));
    }
  }

  // Récupérer une entrée spécifique
  async getEntry(entryId) {
    try {
      const user = this._checkAuth();

      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("id", entryId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erreur récupération entrée:", error);
      throw new Error(SupabaseUtils.handleError(error, "récupération entrée"));
    }
  }

  // Mettre à jour une entrée
  async updateEntry(entryId, updates) {
    try {
      const user = this._checkAuth();

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Gestion du chiffrement si nécessaire
      if (updates.password && updates.content) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        updateData.encrypted_content = await this._encryptContent(
          updates.content,
          updates.password,
          salt
        );
        updateData.is_encrypted = true;
        updateData.encryption_salt = saltHex;
        updateData.content = null;
      }

      const { data, error } = await supabase
        .from("diary_entries")
        .update(updateData)
        .eq("id", entryId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      this._clearCache("diary_entries");

      return {
        success: true,
        entry: data,
        message: "Entrée mise à jour avec succès",
      };
    } catch (error) {
      console.error("Erreur mise à jour entrée:", error);
      throw new Error(SupabaseUtils.handleError(error, "mise à jour entrée"));
    }
  }

  // Supprimer une entrée
  async deleteEntry(entryId) {
    try {
      const user = this._checkAuth();

      const { error } = await supabase
        .from("diary_entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Invalider le cache
      this._clearCache("diary_entries");
      this._clearCache("user_stats");

      return {
        success: true,
        message: "Entrée supprimée avec succès",
      };
    } catch (error) {
      console.error("Erreur suppression entrée:", error);
      throw new Error(SupabaseUtils.handleError(error, "suppression entrée"));
    }
  }

  // Rechercher dans les entrées
  async searchEntries(searchTerm, options = {}) {
    try {
      const user = this._checkAuth();

      let query = supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id);

      // Recherche textuelle (seulement dans les entrées non chiffrées)
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`
        );
      }

      // Autres filtres
      if (options.mood) {
        query = query.eq("mood", options.mood);
      }

      query = query.order("created_at", { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erreur recherche entrées:", error);
      throw new Error(SupabaseUtils.handleError(error, "recherche entrées"));
    }
  }

  // === GESTION DES STATISTIQUES ===

  // Récupérer les statistiques utilisateur
  async getUserStats(forceRefresh = false) {
    try {
      const user = this._checkAuth();
      const cacheKey = this._getCacheKey("user_stats", { userId: user.id });

      // Vérifier le cache
      const cached = this._getCache(cacheKey);
      if (cached && !forceRefresh) {
        return cached;
      }

      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // Pas d'erreur si pas de données
        throw error;
      }

      // Si pas de stats, les calculer
      if (!data) {
        await this._calculateUserStats(user.id);
        return await this.getUserStats(true);
      }

      // Mettre en cache
      this._setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Erreur récupération stats:", error);
      throw new Error(
        SupabaseUtils.handleError(error, "récupération statistiques")
      );
    }
  }

  // Calculer les statistiques utilisateur
  async _calculateUserStats(userId) {
    try {
      const { error } = await supabase.rpc("calculate_user_stats", {
        target_user_id: userId,
      });

      if (error) throw error;

      // Invalider le cache
      this._clearCache("user_stats");
    } catch (error) {
      console.error("Erreur calcul stats:", error);
      throw error;
    }
  }

  // === GESTION DU CHIFFREMENT ===

  // Chiffrer le contenu avec un salt spécifique
  async _encryptContent(content, password, salt) {
    try {
      const key = await this._getKeyFromPassword(password, salt);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(content);

      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
      );

      // Combiner IV et données chiffrées
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedData), iv.length);

      return btoa(String.fromCharCode.apply(null, combined));
    } catch (error) {
      console.error("Erreur chiffrement:", error);
      throw error;
    }
  }

  // Déchiffrer le contenu d'une entrée
  async decryptEntry(entry, password) {
    try {
      if (!entry.is_encrypted || !entry.encrypted_content) {
        return entry.content;
      }

      // Récupérer le salt
      const salt = new Uint8Array(
        entry.encryption_salt.match(/.{2}/g).map((byte) => parseInt(byte, 16))
      );

      const key = await this._getKeyFromPassword(password, salt);

      // Décoder les données
      const binaryString = atob(entry.encrypted_content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Extraire IV et données
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error("Erreur déchiffrement:", error);
      throw new Error("Mot de passe incorrect ou données corrompues");
    }
  }

  // Générer une clé de chiffrement à partir du mot de passe et du salt
  async _getKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // === GESTION DES SAUVEGARDES ===

  // Créer une sauvegarde
  async createBackup(type = "manual") {
    try {
      const user = this._checkAuth();

      // Récupérer toutes les données utilisateur
      const entries = await this.getUserEntries({ forceRefresh: true });
      const profile = await supabaseAuth.getUserProfile();
      const stats = await this.getUserStats(true);

      const backupData = {
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        entries,
        stats,
        metadata: {
          totalEntries: entries.length,
          encryptedEntries: entries.filter((e) => e.is_encrypted).length,
        },
      };

      const { data, error } = await supabase
        .from("backups")
        .insert({
          user_id: user.id,
          backup_data: backupData,
          backup_type: type,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        backup: data,
        message: "Sauvegarde créée avec succès",
      };
    } catch (error) {
      console.error("Erreur création sauvegarde:", error);
      throw new Error(SupabaseUtils.handleError(error, "création sauvegarde"));
    }
  }

  // Récupérer les sauvegardes
  async getBackups() {
    try {
      const user = this._checkAuth();

      const { data, error } = await supabase
        .from("backups")
        .select("id, backup_type, created_at, expires_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erreur récupération sauvegardes:", error);
      throw new Error(
        SupabaseUtils.handleError(error, "récupération sauvegardes")
      );
    }
  }

  // Nettoyer le cache
  clearCache() {
    this._clearCache();
  }
}

// Instance globale
window.supabaseData = new SupabaseDataManager();

// Export pour utilisation
window.SupabaseDataManager = SupabaseDataManager;
