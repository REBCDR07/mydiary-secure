// MyDiary Secure - Script principal avec intégration Supabase
// Version: 2.0.0

// Configuration de l'application (éviter le conflit avec d'autres scripts)
const APP_CONFIG = {
  APP_NAME: "MyDiary Secure",
  VERSION: "2.0.0",
  MOOD_EMOJIS: {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    excited: "😃",
    angry: "😠",
    anxious: "😰",
  },
  MOOD_NAMES: {
    happy: "Heureux",
    sad: "Triste",
    neutral: "Neutre",
    excited: "Excité",
    angry: "En colère",
    anxious: "Anxieux",
  },
};

// État de l'application
let appState = {
  currentUser: null,
  currentProfile: null,
  entries: [],
  filteredEntries: [],
  stats: null,
  isLoading: false,
};

// Éléments DOM
const elements = {
  // Écrans
  loadingScreen: document.getElementById("loading-screen"),
  authScreen: document.getElementById("auth-screen"),
  dashboardScreen: document.getElementById("dashboard-screen"),
  writeEntryScreen: document.getElementById("write-entry-screen"),
  entriesListScreen: document.getElementById("entries-list-screen"),

  // Authentification
  loginForm: document.getElementById("login-form"),
  loginFormContainer: document.getElementById("login-form-container"),
  registerForm: document.getElementById("register-form"),
  registerFormContainer: document.getElementById("register-form-container"),
  showRegister: document.getElementById("show-register"),
  showLogin: document.getElementById("show-login"),

  // Champs de connexion
  loginEmail: document.getElementById("login-email"),
  loginUsername: document.getElementById("login-username"),
  loginPassword: document.getElementById("login-password"),

  // Champs d'inscription
  registerEmail: document.getElementById("register-email"),
  registerUsername: document.getElementById("register-username"),
  registerPassword: document.getElementById("register-password"),
  confirmPassword: document.getElementById("confirm-password"),
  passwordMatch: document.getElementById("password-match"),

  // Boutons de visibilité des mots de passe
  toggleLoginPassword: document.getElementById("toggle-login-password"),
  toggleRegisterPassword: document.getElementById("toggle-register-password"),
  toggleConfirmPassword: document.getElementById("toggle-confirm-password"),

  // Dashboard
  logoutBtn: document.getElementById("logout-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  themeToggleWrite: document.getElementById("theme-toggle-write"),
  themeToggleList: document.getElementById("theme-toggle-list"),
  newEntryBtn: document.getElementById("new-entry-btn"),
  viewEntriesBtn: document.getElementById("view-entries-btn"),

  // Statistiques
  totalEntries: document.getElementById("total-entries"),
  writingStreak: document.getElementById("writing-streak"),
  averageMood: document.getElementById("average-mood"),
  monthEntries: document.getElementById("month-entries"),
  recentEntries: document.getElementById("recent-entries"),

  // Formulaire d'entrée
  entryForm: document.getElementById("entry-form"),
  entryTitle: document.getElementById("entry-title"),
  entryContent: document.getElementById("entry-content"),
  entryMood: document.getElementById("entry-mood"),
  entryFont: document.getElementById("entry-font"),
  entryPassword: document.getElementById("entry-password"),
  toggleEntryPassword: document.getElementById("toggle-entry-password"),
  previewEntry: document.getElementById("preview-entry"),
  cancelEntry: document.getElementById("cancel-entry"),
  backToDashboard: document.getElementById("back-to-dashboard"),

  // Liste des entrées
  backToDashboardFromList: document.getElementById(
    "back-to-dashboard-from-list"
  ),
  searchEntries: document.getElementById("search-entries"),
  filterMood: document.getElementById("filter-mood"),
  entriesContainer: document.getElementById("entries-container"),
  noEntriesMessage: document.getElementById("no-entries-message"),
  createFirstEntryFromList: document.getElementById(
    "create-first-entry-from-list"
  ),

  // Modales
  previewModal: document.getElementById("preview-modal"),
  closePreview: document.getElementById("close-preview"),
  previewTitle: document.getElementById("preview-title"),
  previewMood: document.getElementById("preview-mood"),
  previewDate: document.getElementById("preview-date"),
  previewContent: document.getElementById("preview-content"),

  passwordModal: document.getElementById("password-modal"),
  entryPasswordInput: document.getElementById("entry-password-input"),
  toggleModalPassword: document.getElementById("toggle-modal-password"),
  passwordError: document.getElementById("password-error"),
  cancelPassword: document.getElementById("cancel-password"),
  unlockEntry: document.getElementById("unlock-entry"),

  // Notifications
  toastNotification: document.getElementById("toast-notification"),
  toastIcon: document.getElementById("toast-icon"),
  toastTitle: document.getElementById("toast-title"),
  toastMessage: document.getElementById("toast-message"),
  closeToast: document.getElementById("close-toast"),
};

// Gestionnaire de thème
const themeManager = {
  init: () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    themeManager.setTheme(savedTheme);

    // Lier les boutons de basculement de thème
    [
      elements.themeToggle,
      elements.themeToggleWrite,
      elements.themeToggleList,
    ].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", themeManager.toggleTheme);
      }
    });
  },

  setTheme: (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    // Mettre à jour les préférences utilisateur si connecté
    if (appState.currentUser) {
      supabaseAuth
        .updateProfile({
          preferences: {
            ...appState.currentProfile?.preferences,
            theme,
          },
        })
        .catch(console.error);
    }
  },

  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains("dark");
    themeManager.setTheme(isDark ? "light" : "dark");
  },
};

// Utilitaires
const utils = {
  // Générer un ID unique
  generateId: () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  },

  // Formater une date
  formatDate: (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  },

  // Tronquer le texte
  truncateText: (text, length = 100) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + "...";
  },

  // Afficher une notification
  showNotification: (title, message, type = "info") => {
    let iconClass = "fas fa-info-circle";
    let iconColor = "text-blue-500";

    switch (type) {
      case "success":
        iconClass = "fas fa-check-circle";
        iconColor = "text-green-500";
        break;
      case "error":
        iconClass = "fas fa-exclamation-circle";
        iconColor = "text-red-500";
        break;
      case "warning":
        iconClass = "fas fa-exclamation-triangle";
        iconColor = "text-yellow-500";
        break;
    }

    if (elements.toastIcon) {
      elements.toastIcon.className = `${iconClass} ${iconColor} text-lg`;
    }
    if (elements.toastTitle) {
      elements.toastTitle.textContent = title;
    }
    if (elements.toastMessage) {
      elements.toastMessage.textContent = message;
    }
    if (elements.toastNotification) {
      elements.toastNotification.classList.remove("hidden");

      setTimeout(() => {
        elements.toastNotification.classList.add("hidden");
      }, 5000);
    }
  },

  // Basculer la visibilité du mot de passe
  togglePasswordVisibility: (inputElement, toggleButton) => {
    if (inputElement.type === "password") {
      inputElement.type = "text";
      toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      inputElement.type = "password";
      toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
  },

  // Obtenir l'emoji d'humeur
  getMoodEmoji: (mood) => {
    return APP_CONFIG.MOOD_EMOJIS[mood] || "❓";
  },

  // Obtenir le nom d'humeur
  getMoodName: (mood) => {
    return APP_CONFIG.MOOD_NAMES[mood] || "Inconnu";
  },

  // Valider l'email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Valider le nom d'utilisateur
  isValidUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Valider le mot de passe
  isValidPassword: (password) => {
    return password && password.length >= 8;
  },
};

// Gestionnaire d'écrans
const screenManager = {
  showScreen: (screenId) => {
    // Masquer tous les écrans
    Object.values(elements).forEach((element) => {
      if (element && element.id && element.id.includes("-screen")) {
        element.classList.add("hidden");
      }
    });

    // Afficher l'écran cible
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove("hidden");
    }
  },

  showLoading: () => {
    screenManager.showScreen("loading-screen");
  },

  showAuth: () => {
    screenManager.showScreen("auth-screen");
  },

  showDashboard: async () => {
    screenManager.showScreen("dashboard-screen");
    await dashboardManager.loadDashboard();
  },

  showWriteEntry: () => {
    screenManager.showScreen("write-entry-screen");
    if (elements.entryTitle) {
      elements.entryTitle.focus();
    }
  },

  showEntriesList: async () => {
    screenManager.showScreen("entries-list-screen");
    await entriesManager.loadEntries();
  },
};

// Gestionnaire d'authentification
const authManager = {
  init: () => {
    // Événements de formulaire
    if (elements.loginForm) {
      elements.loginForm.addEventListener("submit", authManager.handleLogin);
    }
    if (elements.registerForm) {
      elements.registerForm.addEventListener(
        "submit",
        authManager.handleRegister
      );
    }

    // Basculement entre formulaires
    if (elements.showRegister) {
      elements.showRegister.addEventListener(
        "click",
        authManager.showRegisterForm
      );
    }
    if (elements.showLogin) {
      elements.showLogin.addEventListener("click", authManager.showLoginForm);
    }

    // Basculement de visibilité des mots de passe
    if (elements.toggleLoginPassword) {
      elements.toggleLoginPassword.addEventListener("click", () => {
        utils.togglePasswordVisibility(
          elements.loginPassword,
          elements.toggleLoginPassword
        );
      });
    }
    if (elements.toggleRegisterPassword) {
      elements.toggleRegisterPassword.addEventListener("click", () => {
        utils.togglePasswordVisibility(
          elements.registerPassword,
          elements.toggleRegisterPassword
        );
      });
    }
    if (elements.toggleConfirmPassword) {
      elements.toggleConfirmPassword.addEventListener("click", () => {
        utils.togglePasswordVisibility(
          elements.confirmPassword,
          elements.toggleConfirmPassword
        );
      });
    }

    // Validation de confirmation de mot de passe
    if (elements.confirmPassword) {
      elements.confirmPassword.addEventListener(
        "input",
        authManager.validatePasswordMatch
      );
    }

    // Écouter les événements d'authentification Supabase
    window.addEventListener("userSignedIn", authManager.handleUserSignedIn);
    window.addEventListener("userSignedOut", authManager.handleUserSignedOut);
  },

  handleLogin: async (e) => {
    e.preventDefault();

    const email = elements.loginEmail.value.trim();
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value;

    if (!email || !username || !password) {
      utils.showNotification(
        "Erreur",
        "Veuillez remplir tous les champs",
        "error"
      );
      return;
    }

    if (!utils.isValidEmail(email)) {
      utils.showNotification(
        "Erreur",
        "Veuillez saisir un email valide",
        "error"
      );
      return;
    }

    try {
      appState.isLoading = true;
      screenManager.showLoading();

      // Utiliser l'email pour la connexion
      const result = await supabaseAuth.signIn(email, password);

      utils.showNotification("Connexion réussie", result.message, "success");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      utils.showNotification("Erreur de connexion", error.message, "error");
      screenManager.showAuth();
    } finally {
      appState.isLoading = false;
    }
  },

  handleRegister: async (e) => {
    e.preventDefault();

    const email = elements.registerEmail.value.trim();
    const username = elements.registerUsername.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;

    // Validations
    if (!email || !username || !password || !confirmPassword) {
      utils.showNotification(
        "Erreur",
        "Veuillez remplir tous les champs",
        "error"
      );
      return;
    }

    if (!utils.isValidEmail(email)) {
      utils.showNotification(
        "Erreur",
        "Veuillez saisir un email valide",
        "error"
      );
      return;
    }

    if (!utils.isValidUsername(username)) {
      utils.showNotification(
        "Erreur",
        "Le nom d'utilisateur doit contenir 3-20 caractères (lettres, chiffres, _)",
        "error"
      );
      return;
    }

    if (!utils.isValidPassword(password)) {
      utils.showNotification(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      utils.showNotification(
        "Erreur",
        "Les mots de passe ne correspondent pas",
        "error"
      );
      return;
    }

    try {
      appState.isLoading = true;
      screenManager.showLoading();

      // Utiliser l'email saisi par l'utilisateur
      const result = await supabaseAuth.signUp(email, password, username);

      if (result.requiresConfirmation) {
        utils.showNotification(
          "Inscription réussie",
          result.message,
          "success"
        );
        authManager.showLoginForm();
      } else {
        utils.showNotification(
          "Inscription réussie",
          result.message,
          "success"
        );
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      utils.showNotification("Erreur d'inscription", error.message, "error");
      screenManager.showAuth();
    } finally {
      appState.isLoading = false;
    }
  },

  showRegisterForm: () => {
    if (elements.loginFormContainer) {
      elements.loginFormContainer.classList.add("hidden");
    }
    if (elements.registerFormContainer) {
      elements.registerFormContainer.classList.remove("hidden");
    }
  },

  showLoginForm: () => {
    if (elements.registerFormContainer) {
      elements.registerFormContainer.classList.add("hidden");
    }
    if (elements.loginFormContainer) {
      elements.loginFormContainer.classList.remove("hidden");
    }
  },

  validatePasswordMatch: () => {
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;

    if (confirmPassword && password !== confirmPassword) {
      elements.passwordMatch.classList.remove("hidden");
    } else {
      elements.passwordMatch.classList.add("hidden");
    }
  },

  handleUserSignedIn: async (event) => {
    const { user } = event.detail;
    appState.currentUser = user;

    try {
      // Récupérer le profil utilisateur
      appState.currentProfile = await supabaseAuth.getUserProfile();

      // Appliquer les préférences utilisateur
      if (appState.currentProfile?.preferences?.theme) {
        themeManager.setTheme(appState.currentProfile.preferences.theme);
      }

      screenManager.showDashboard();
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      screenManager.showDashboard();
    }
  },

  handleUserSignedOut: () => {
    appState.currentUser = null;
    appState.currentProfile = null;
    appState.entries = [];
    appState.filteredEntries = [];
    appState.stats = null;

    // Nettoyer les formulaires
    if (elements.loginForm) elements.loginForm.reset();
    if (elements.registerForm) elements.registerForm.reset();

    screenManager.showAuth();
  },

  logout: async () => {
    try {
      await supabaseAuth.signOut();
      utils.showNotification(
        "Déconnexion",
        "Vous avez été déconnecté avec succès",
        "info"
      );
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      utils.showNotification(
        "Erreur",
        "Erreur lors de la déconnexion",
        "error"
      );
    }
  },
};

// Gestionnaire du tableau de bord
const dashboardManager = {
  init: () => {
    // Événements des boutons
    if (elements.newEntryBtn) {
      elements.newEntryBtn.addEventListener("click", () =>
        screenManager.showWriteEntry()
      );
    }
    if (elements.viewEntriesBtn) {
      elements.viewEntriesBtn.addEventListener("click", () =>
        screenManager.showEntriesList()
      );
    }
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener("click", authManager.logout);
    }

    // Boutons "créer première entrée"
    const createFirstEntryBtns = document.querySelectorAll(
      "#create-first-entry, #create-first-entry-from-list"
    );
    createFirstEntryBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => screenManager.showWriteEntry());
      }
    });
  },

  loadDashboard: async () => {
    try {
      // Charger les statistiques et les entrées récentes en parallèle
      const [stats, entries] = await Promise.all([
        supabaseData.getUserStats(),
        supabaseData.getUserEntries({
          limit: 3,
          orderBy: "created_at",
          orderDirection: "desc",
        }),
      ]);

      appState.stats = stats;
      dashboardManager.updateStats(stats);
      dashboardManager.loadRecentEntries(entries);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      utils.showNotification(
        "Erreur",
        "Impossible de charger le tableau de bord",
        "error"
      );
    }
  },

  updateStats: (stats) => {
    if (!stats) return;

    // Mettre à jour les statistiques
    if (elements.totalEntries) {
      elements.totalEntries.textContent = stats.total_entries || 0;
    }
    if (elements.writingStreak) {
      const streak = stats.writing_streak || 0;
      elements.writingStreak.textContent = `${streak} jour${
        streak !== 1 ? "s" : ""
      }`;
    }
    if (elements.averageMood) {
      elements.averageMood.textContent = utils.getMoodEmoji(
        stats.most_common_mood || "neutral"
      );
    }
    if (elements.monthEntries) {
      elements.monthEntries.textContent = stats.entries_this_month || 0;
    }
  },

  loadRecentEntries: (entries) => {
    if (!elements.recentEntries) return;

    if (!entries || entries.length === 0) {
      elements.recentEntries.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-book-open text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400">Aucune entrée pour le moment</p>
                    <button id="create-first-entry" class="mt-4 btn-primary text-white px-6 py-2 rounded-xl">
                        Créer votre première entrée
                    </button>
                </div>
            `;

      // Re-lier l'événement
      const createBtn = document.getElementById("create-first-entry");
      if (createBtn) {
        createBtn.addEventListener("click", () =>
          screenManager.showWriteEntry()
        );
      }
    } else {
      elements.recentEntries.innerHTML = entries
        .map(
          (entry) => `
                <div class="card-enhanced rounded-xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer" onclick="entriesManager.viewEntry('${
                  entry.id
                }')">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white truncate">${
                          entry.title
                        }</h3>
                        <span class="text-2xl">${utils.getMoodEmoji(
                          entry.mood
                        )}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${utils.formatDate(
                      entry.created_at
                    )}</p>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">${utils.truncateText(
                      entry.content || "Contenu chiffré",
                      80
                    )}</p>
                </div>
            `
        )
        .join("");
    }
  },
};

// Gestionnaire d'entrées
const entryManager = {
  init: () => {
    if (elements.entryForm) {
      elements.entryForm.addEventListener(
        "submit",
        entryManager.handleSaveEntry
      );
    }
    if (elements.backToDashboard) {
      elements.backToDashboard.addEventListener("click", () =>
        screenManager.showDashboard()
      );
    }
    if (elements.cancelEntry) {
      elements.cancelEntry.addEventListener("click", () =>
        screenManager.showDashboard()
      );
    }
    if (elements.previewEntry) {
      elements.previewEntry.addEventListener("click", entryManager.showPreview);
    }
    if (elements.closePreview) {
      elements.closePreview.addEventListener(
        "click",
        entryManager.closePreview
      );
    }

    // Changement de police
    if (elements.entryFont) {
      elements.entryFont.addEventListener("change", entryManager.updateFont);
    }

    // Basculement de visibilité du mot de passe
    if (elements.toggleEntryPassword) {
      elements.toggleEntryPassword.addEventListener("click", () => {
        utils.togglePasswordVisibility(
          elements.entryPassword,
          elements.toggleEntryPassword
        );
      });
    }
  },

  handleSaveEntry: async (e) => {
    e.preventDefault();

    const title = elements.entryTitle.value.trim();
    const content = elements.entryContent.value.trim();
    const mood = elements.entryMood.value;
    const font = elements.entryFont.value;
    const password = elements.entryPassword.value;

    if (!title || !content || !mood) {
      utils.showNotification(
        "Erreur",
        "Veuillez remplir tous les champs obligatoires",
        "error"
      );
      return;
    }

    try {
      appState.isLoading = true;

      const entryData = {
        title,
        content,
        mood,
        font,
        password: password || null,
      };

      const result = await supabaseData.createEntry(entryData);

      utils.showNotification("Succès", result.message, "success");
      elements.entryForm.reset();
      screenManager.showDashboard();
    } catch (error) {
      console.error("Erreur sauvegarde entrée:", error);
      utils.showNotification("Erreur", error.message, "error");
    } finally {
      appState.isLoading = false;
    }
  },

  updateFont: () => {
    const selectedFont = elements.entryFont.value;
    if (elements.entryContent) {
      elements.entryContent.className =
        elements.entryContent.className.replace(/font-\w+/g, "") +
        " " +
        selectedFont;
    }
  },

  showPreview: () => {
    const title = elements.entryTitle.value.trim();
    const content = elements.entryContent.value.trim();
    const mood = elements.entryMood.value;
    const font = elements.entryFont.value;

    if (!title || !content || !mood) {
      utils.showNotification(
        "Erreur",
        "Veuillez remplir tous les champs pour voir l'aperçu",
        "error"
      );
      return;
    }

    if (elements.previewTitle) elements.previewTitle.textContent = title;
    if (elements.previewMood) {
      elements.previewMood.innerHTML = `<span class="mr-2">${utils.getMoodEmoji(
        mood
      )}</span> ${utils.getMoodName(mood)}`;
    }
    if (elements.previewDate)
      elements.previewDate.textContent = utils.formatDate(
        new Date().toISOString()
      );
    if (elements.previewContent) {
      elements.previewContent.innerHTML = content.replace(/\n/g, "<br>");
      elements.previewContent.className = `prose dark:prose-invert max-w-none ${font}`;
    }

    if (elements.previewModal) {
      elements.previewModal.classList.remove("hidden");
    }
  },

  closePreview: () => {
    if (elements.previewModal) {
      elements.previewModal.classList.add("hidden");
    }
  },
};

// Gestionnaire de liste d'entrées
const entriesManager = {
  currentEntryId: null,

  init: () => {
    if (elements.backToDashboardFromList) {
      elements.backToDashboardFromList.addEventListener("click", () =>
        screenManager.showDashboard()
      );
    }
    if (elements.searchEntries) {
      elements.searchEntries.addEventListener(
        "input",
        entriesManager.filterEntries
      );
    }
    if (elements.filterMood) {
      elements.filterMood.addEventListener(
        "change",
        entriesManager.filterEntries
      );
    }

    // Modale de mot de passe
    if (elements.cancelPassword) {
      elements.cancelPassword.addEventListener(
        "click",
        entriesManager.closePasswordModal
      );
    }
    if (elements.unlockEntry) {
      elements.unlockEntry.addEventListener(
        "click",
        entriesManager.unlockEntry
      );
    }
    if (elements.toggleModalPassword) {
      elements.toggleModalPassword.addEventListener("click", () => {
        utils.togglePasswordVisibility(
          elements.entryPasswordInput,
          elements.toggleModalPassword
        );
      });
    }
  },

  loadEntries: async () => {
    try {
      appState.entries = await supabaseData.getUserEntries();
      appState.filteredEntries = [...appState.entries];
      entriesManager.renderEntries();
    } catch (error) {
      console.error("Erreur chargement entrées:", error);
      utils.showNotification(
        "Erreur",
        "Impossible de charger les entrées",
        "error"
      );
    }
  },

  filterEntries: async () => {
    const searchTerm = elements.searchEntries?.value.toLowerCase() || "";
    const moodFilter = elements.filterMood?.value || "";

    try {
      if (searchTerm) {
        // Utiliser la recherche Supabase
        appState.filteredEntries = await supabaseData.searchEntries(
          searchTerm,
          {
            mood: moodFilter || undefined,
          }
        );
      } else {
        // Filtrer localement
        appState.filteredEntries = appState.entries.filter((entry) => {
          const matchesMood = !moodFilter || entry.mood === moodFilter;
          return matchesMood;
        });
      }

      entriesManager.renderEntries();
    } catch (error) {
      console.error("Erreur filtrage entrées:", error);
    }
  },

  renderEntries: () => {
    if (!elements.entriesContainer || !elements.noEntriesMessage) return;

    if (appState.filteredEntries.length === 0) {
      elements.entriesContainer.classList.add("hidden");
      elements.noEntriesMessage.classList.remove("hidden");
    } else {
      elements.entriesContainer.classList.remove("hidden");
      elements.noEntriesMessage.classList.add("hidden");

      elements.entriesContainer.innerHTML = appState.filteredEntries
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(
          (entry) => `
                    <div class="card-enhanced rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer mood-${
                      entry.mood
                    }" onclick="entriesManager.viewEntry('${entry.id}')">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white truncate">${
                              entry.title
                            }</h3>
                            <div class="flex items-center space-x-2">
                                <span class="text-3xl">${utils.getMoodEmoji(
                                  entry.mood
                                )}</span>
                                ${
                                  entry.is_encrypted
                                    ? '<i class="fas fa-lock text-yellow-500"></i>'
                                    : ""
                                }
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${utils.formatDate(
                          entry.created_at
                        )}</p>
                        <p class="text-gray-700 dark:text-gray-300">${utils.truncateText(
                          entry.content ||
                            "Contenu chiffré - cliquez pour déverrouiller",
                          120
                        )}</p>
                        <div class="mt-4 flex items-center justify-between">
                            <span class="text-xs text-gray-500 dark:text-gray-400">${utils.getMoodName(
                              entry.mood
                            )}</span>
                            <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 transition-colors duration-200"></i>
                        </div>
                    </div>
                `
        )
        .join("");
    }
  },

  viewEntry: (entryId) => {
    const entry = appState.entries.find((e) => e.id === entryId);
    if (!entry) return;

    if (entry.is_encrypted) {
      entriesManager.currentEntryId = entryId;
      if (elements.passwordModal) {
        elements.passwordModal.classList.remove("hidden");
      }
      if (elements.entryPasswordInput) {
        elements.entryPasswordInput.focus();
      }
    } else {
      entriesManager.showEntryPreview(entry);
    }
  },

  unlockEntry: async () => {
    const password = elements.entryPasswordInput?.value;
    if (!password) return;

    const entry = appState.entries.find(
      (e) => e.id === entriesManager.currentEntryId
    );
    if (!entry) return;

    try {
      const decryptedContent = await supabaseData.decryptEntry(entry, password);
      entry.decryptedContent = decryptedContent;
      entriesManager.closePasswordModal();
      entriesManager.showEntryPreview(entry);
    } catch (error) {
      console.error("Erreur déchiffrement:", error);
      if (elements.passwordError) {
        elements.passwordError.classList.remove("hidden");
      }
      if (elements.entryPasswordInput) {
        elements.entryPasswordInput.value = "";
      }
    }
  },

  showEntryPreview: (entry) => {
    if (elements.previewTitle) elements.previewTitle.textContent = entry.title;
    if (elements.previewMood) {
      elements.previewMood.innerHTML = `<span class="mr-2">${utils.getMoodEmoji(
        entry.mood
      )}</span> ${utils.getMoodName(entry.mood)}`;
    }
    if (elements.previewDate)
      elements.previewDate.textContent = utils.formatDate(entry.created_at);

    const content =
      entry.decryptedContent || entry.content || "Contenu non disponible";
    if (elements.previewContent) {
      elements.previewContent.innerHTML = content.replace(/\n/g, "<br>");
      elements.previewContent.className = `prose dark:prose-invert max-w-none ${
        entry.font_style || "font-inter"
      }`;
    }

    if (elements.previewModal) {
      elements.previewModal.classList.remove("hidden");
    }
  },

  closePasswordModal: () => {
    if (elements.passwordModal) {
      elements.passwordModal.classList.add("hidden");
    }
    if (elements.entryPasswordInput) {
      elements.entryPasswordInput.value = "";
    }
    if (elements.passwordError) {
      elements.passwordError.classList.add("hidden");
    }
    entriesManager.currentEntryId = null;
  },
};

// Gestionnaire de notifications
const toastManager = {
  init: () => {
    if (elements.closeToast) {
      elements.closeToast.addEventListener("click", () => {
        if (elements.toastNotification) {
          elements.toastNotification.classList.add("hidden");
        }
      });
    }
  },
};

// Application principale
const app = {
  init: async () => {
    try {
      console.log("🚀 Initialisation de MyDiary Secure v2.0.0");

      // Vérifier la configuration Supabase
      if (!SupabaseUtils.validate()) {
        throw new Error("Configuration Supabase invalide");
      }

      // Initialiser Supabase
      if (!SupabaseUtils.init()) {
        throw new Error("Impossible d'initialiser Supabase");
      }

      // Vérifier la connexion
      const isConnected = await SupabaseUtils.checkConnection();
      if (!isConnected) {
        console.warn("⚠️ Connexion Supabase non vérifiée, mode dégradé");
      }

      // Initialiser l'authentification Supabase
      const currentUser = await supabaseAuth.init();

      // Initialiser les gestionnaires
      themeManager.init();
      authManager.init();
      dashboardManager.init();
      entryManager.init();
      entriesManager.init();
      toastManager.init();

      // Afficher l'écran approprié
      setTimeout(() => {
        if (elements.loadingScreen) {
          elements.loadingScreen.classList.add("hidden");
        }

        if (currentUser) {
          screenManager.showDashboard();
        } else {
          screenManager.showAuth();
        }
      }, 1500);

      console.log("✅ MyDiary Secure initialisé avec succès");
    } catch (error) {
      console.error("❌ Erreur d'initialisation:", error);

      // Mode de fallback
      if (elements.loadingScreen) {
        elements.loadingScreen.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-6">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Erreur d'initialisation</h1>
                        <p class="text-gray-600 dark:text-gray-300 mb-6">${error.message}</p>
                        <button onclick="location.reload()" class="btn-primary text-white px-6 py-3 rounded-xl">
                            Réessayer
                        </button>
                    </div>
                `;
      }
    }
  },
};

// Démarrer l'application
document.addEventListener("DOMContentLoaded", app.init);

// Export global pour débogage
window.MyDiaryApp = {
  app,
  appState,
  utils,
  screenManager,
  authManager,
  dashboardManager,
  entryManager,
  entriesManager,
  themeManager,
};
