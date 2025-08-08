 // App Configuration
 const CONFIG = {
    APP_NAME: 'MyDiary Secure',
    VERSION: '1.0.0',
    STORAGE_KEY: 'mydiary_data',
    MOOD_EMOJIS: {
        happy: '😊',
        sad: '😢',
        neutral: '😐',
        excited: '😃',
        angry: '😠',
        anxious: '😰'
    },
    MOOD_NAMES: {
        happy: 'Heureux',
        sad: 'Triste',
        neutral: 'Neutre',
        excited: 'Excité',
        angry: 'En colère',
        anxious: 'Anxieux'
    }
};

// State Management
let currentUser = null;
let currentEntryId = null;
let entries = [];
let filteredEntries = [];

// DOM Elements
const elements = {
    // Screens
    loadingScreen: document.getElementById('loading-screen'),
    authScreen: document.getElementById('auth-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),
    writeEntryScreen: document.getElementById('write-entry-screen'),
    entriesListScreen: document.getElementById('entries-list-screen'),
    
    // Auth
    loginForm: document.getElementById('login-form'),
    loginFormContainer: document.getElementById('login-form-container'),
    registerForm: document.getElementById('register-form'),
    registerFormContainer: document.getElementById('register-form-container'),
    showRegister: document.getElementById('show-register'),
    showLogin: document.getElementById('show-login'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    registerUsername: document.getElementById('register-username'),
    registerPassword: document.getElementById('register-password'),
    confirmPassword: document.getElementById('confirm-password'),
    passwordMatch: document.getElementById('password-match'),
    toggleLoginPassword: document.getElementById('toggle-login-password'),
    toggleRegisterPassword: document.getElementById('toggle-register-password'),
    toggleConfirmPassword: document.getElementById('toggle-confirm-password'),
    
    // Dashboard
    logoutBtn: document.getElementById('logout-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeToggleWrite: document.getElementById('theme-toggle-write'),
    themeToggleList: document.getElementById('theme-toggle-list'),
    newEntryBtn: document.getElementById('new-entry-btn'),
    viewEntriesBtn: document.getElementById('view-entries-btn'),
    totalEntries: document.getElementById('total-entries'),
    writingStreak: document.getElementById('writing-streak'),
    averageMood: document.getElementById('average-mood'),
    monthEntries: document.getElementById('month-entries'),
    recentEntries: document.getElementById('recent-entries'),
    backToDashboard: document.getElementById('back-to-dashboard'),
    createFirstEntry: document.getElementById('create-first-entry'),
    
    // Write Entry
    entryForm: document.getElementById('entry-form'),
    entryTitle: document.getElementById('entry-title'),
    entryContent: document.getElementById('entry-content'),
    entryMood: document.getElementById('entry-mood'),
    entryFont: document.getElementById('entry-font'),
    entryPassword: document.getElementById('entry-password'),
    toggleEntryPassword: document.getElementById('toggle-entry-password'),
    previewEntry: document.getElementById('preview-entry'),
    cancelEntry: document.getElementById('cancel-entry'),
    
    // Entries List
    backToDashboardFromList: document.getElementById('back-to-dashboard-from-list'),
    searchEntries: document.getElementById('search-entries'),
    filterMood: document.getElementById('filter-mood'),
    entriesContainer: document.getElementById('entries-container'),
    noEntriesMessage: document.getElementById('no-entries-message'),
    createFirstEntryFromList: document.getElementById('create-first-entry-from-list'),
    
    // Modals
    previewModal: document.getElementById('preview-modal'),
    closePreview: document.getElementById('close-preview'),
    previewTitle: document.getElementById('preview-title'),
    previewMood: document.getElementById('preview-mood'),
    previewDate: document.getElementById('preview-date'),
    previewContent: document.getElementById('preview-content'),
    
    passwordModal: document.getElementById('password-modal'),
    entryPasswordInput: document.getElementById('entry-password-input'),
    toggleModalPassword: document.getElementById('toggle-modal-password'),
    passwordError: document.getElementById('password-error'),
    cancelPassword: document.getElementById('cancel-password'),
    unlockEntry: document.getElementById('unlock-entry'),
    
    // Toast
    toastNotification: document.getElementById('toast-notification'),
    toastIcon: document.getElementById('toast-icon'),
    toastTitle: document.getElementById('toast-title'),
    toastMessage: document.getElementById('toast-message'),
    closeToast: document.getElementById('close-toast')
};

// Theme Management
const themeManager = {
    init: () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeManager.setTheme(savedTheme);
        
        // Bind theme toggle buttons
        [elements.themeToggle, elements.themeToggleWrite, elements.themeToggleList].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', themeManager.toggleTheme);
            }
        });
    },
    
    setTheme: (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    },
    
    toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        themeManager.setTheme(isDark ? 'light' : 'dark');
    }
};

// Utility Functions
const utils = {
    // Generate a unique ID
    generateId: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    // Format date
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    
    // Truncate text
    truncateText: (text, length = 100) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // Show notification
    showNotification: (title, message, type = 'info') => {
        let iconClass = 'fas fa-info-circle';
        let iconColor = 'text-blue-500';
        
        if (type === 'success') {
            iconClass = 'fas fa-check-circle';
            iconColor = 'text-green-500';
        } else if (type === 'error') {
            iconClass = 'fas fa-exclamation-circle';
            iconColor = 'text-red-500';
        } else if (type === 'warning') {
            iconClass = 'fas fa-exclamation-triangle';
            iconColor = 'text-yellow-500';
        }
        
        elements.toastIcon.className = `${iconClass} ${iconColor} text-lg`;
        elements.toastTitle.textContent = title;
        elements.toastMessage.textContent = message;
        elements.toastNotification.classList.remove('hidden');
        
        setTimeout(() => {
            elements.toastNotification.classList.add('hidden');
        }, 5000);
    },
    
    // Toggle password visibility
    togglePasswordVisibility: (inputElement, toggleButton) => {
        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            inputElement.type = 'password';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        }
    },
    
    // Get mood emoji
    getMoodEmoji: (mood) => {
        return CONFIG.MOOD_EMOJIS[mood] || '❓';
    },
    
    // Get mood name
    getMoodName: (mood) => {
        return CONFIG.MOOD_NAMES[mood] || 'Inconnu';
    }
};

// Crypto Utilities
const cryptoUtils = {
    // Hash password using SHA-256
    hashPassword: async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },
    
    // Generate encryption key from password
    getKeyFromPassword: async (password) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const salt = encoder.encode('mymood-secure-salt'); // Fixed salt for simplicity
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },
    
    // Encrypt data
    encryptData: async (data, password) => {
        try {
            const key = await cryptoUtils.getKeyFromPassword(password);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(data);
            
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedData
            );
            
            // Combine iv and encrypted data
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedData), iv.length);
            
            // Convert to base64 for storage
            return btoa(String.fromCharCode.apply(null, combined));
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    },
    
    // Decrypt data
    decryptData: async (encryptedData, password) => {
        try {
            const key = await cryptoUtils.getKeyFromPassword(password);
            
            // Convert from base64
            const binaryString = atob(encryptedData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Extract iv and encrypted data
            const iv = bytes.slice(0, 12);
            const data = bytes.slice(12);
            
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                data
            );
            
            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }
};

// Data Manager
const dataManager = {
    // Initialize data storage
    init: () => {
        if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                users: {},
                entries: {}
            }));
        }
    },
    
    // Get all data
    getData: () => {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));
    },
    
    // Save all data
    saveData: (data) => {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    },
    
    // Register new user
    registerUser: async (username, password) => {
        const data = dataManager.getData();
        
        if (data.users[username]) {
            throw new Error('Cet utilisateur existe déjà');
        }
        
        const hashedPassword = await cryptoUtils.hashPassword(password);
        data.users[username] = {
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        dataManager.saveData(data);
        return true;
    },
    
    // Login user
    loginUser: async (username, password) => {
        const data = dataManager.getData();
        
        if (!data.users[username]) {
            throw new Error('Utilisateur non trouvé');
        }
        
        const hashedPassword = await cryptoUtils.hashPassword(password);
        if (data.users[username].password !== hashedPassword) {
            throw new Error('Mot de passe incorrect');
        }
        
        return true;
    },
    
    // Save entry
    saveEntry: async (entry) => {
        const data = dataManager.getData();
        
        if (!data.entries[currentUser]) {
            data.entries[currentUser] = [];
        }
        
        // Encrypt content if password is provided
        if (entry.password) {
            entry.encryptedContent = await cryptoUtils.encryptData(entry.content, entry.password);
            entry.content = null; // Remove plain text content
            entry.isEncrypted = true;
        } else {
            entry.isEncrypted = false;
        }
        
        // Remove password from stored entry for security
        delete entry.password;
        
        data.entries[currentUser].push(entry);
        dataManager.saveData(data);
        return true;
    },
    
    // Get user entries
    getUserEntries: () => {
        const data = dataManager.getData();
        return data.entries[currentUser] || [];
    },
    
    // Decrypt entry content
    decryptEntry: async (entry, password) => {
        if (!entry.isEncrypted) {
            return entry.content;
        }
        
        try {
            return await cryptoUtils.decryptData(entry.encryptedContent, password);
        } catch (error) {
            throw new Error('Mot de passe incorrect');
        }
    }
};

// Screen Manager
const screenManager = {
    showScreen: (screenId) => {
        // Hide all screens
        Object.values(elements).forEach(element => {
            if (element && element.id && element.id.includes('-screen')) {
                element.classList.add('hidden');
            }
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    },
    
    showLoading: () => {
        screenManager.showScreen('loading-screen');
    },
    
    showAuth: () => {
        screenManager.showScreen('auth-screen');
    },
    
    showDashboard: () => {
        screenManager.showScreen('dashboard-screen');
        dashboardManager.updateStats();
        dashboardManager.loadRecentEntries();
    },
    
    showWriteEntry: () => {
        screenManager.showScreen('write-entry-screen');
        elements.entryTitle.focus();
    },
    
    showEntriesList: () => {
        screenManager.showScreen('entries-list-screen');
        entriesManager.loadEntries();
    }
};

// Auth Manager
const authManager = {
    init: () => {
        // Form submissions
        elements.loginForm.addEventListener('submit', authManager.handleLogin);
        elements.registerForm.addEventListener('submit', authManager.handleRegister);
        
        // Form toggles
        elements.showRegister.addEventListener('click', authManager.showRegisterForm);
        elements.showLogin.addEventListener('click', authManager.showLoginForm);
        
        // Password visibility toggles
        elements.toggleLoginPassword.addEventListener('click', () => {
            utils.togglePasswordVisibility(elements.loginPassword, elements.toggleLoginPassword);
        });
        elements.toggleRegisterPassword.addEventListener('click', () => {
            utils.togglePasswordVisibility(elements.registerPassword, elements.toggleRegisterPassword);
        });
        elements.toggleConfirmPassword.addEventListener('click', () => {
            utils.togglePasswordVisibility(elements.confirmPassword, elements.toggleConfirmPassword);
        });
        
        // Password confirmation validation
        elements.confirmPassword.addEventListener('input', authManager.validatePasswordMatch);
    },
    
    handleLogin: async (e) => {
        e.preventDefault();
        
        const username = elements.loginUsername.value.trim();
        const password = elements.loginPassword.value;
        
        try {
            await dataManager.loginUser(username, password);
            currentUser = username;
            utils.showNotification('Connexion réussie', `Bienvenue ${username}!`, 'success');
            screenManager.showDashboard();
        } catch (error) {
            utils.showNotification('Erreur de connexion', error.message, 'error');
        }
    },
    
    handleRegister: async (e) => {
        e.preventDefault();
        
        const username = elements.registerUsername.value.trim();
        const password = elements.registerPassword.value;
        const confirmPassword = elements.confirmPassword.value;
        
        if (password !== confirmPassword) {
            utils.showNotification('Erreur', 'Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        try {
            await dataManager.registerUser(username, password);
            utils.showNotification('Inscription réussie', 'Votre compte a été créé avec succès', 'success');
            authManager.showLoginForm();
            elements.loginUsername.value = username;
        } catch (error) {
            utils.showNotification('Erreur d\'inscription', error.message, 'error');
        }
    },
    
    showRegisterForm: () => {
        elements.loginFormContainer.classList.add('hidden');
        elements.registerFormContainer.classList.remove('hidden');
    },
    
    showLoginForm: () => {
        elements.registerFormContainer.classList.add('hidden');
        elements.loginFormContainer.classList.remove('hidden');
    },
    
    validatePasswordMatch: () => {
        const password = elements.registerPassword.value;
        const confirmPassword = elements.confirmPassword.value;
        
        if (confirmPassword && password !== confirmPassword) {
            elements.passwordMatch.classList.remove('hidden');
        } else {
            elements.passwordMatch.classList.add('hidden');
        }
    },
    
    logout: () => {
        currentUser = null;
        entries = [];
        filteredEntries = [];
        
        // Clear forms
        elements.loginForm.reset();
        elements.registerForm.reset();
        
        utils.showNotification('Déconnexion', 'Vous avez été déconnecté avec succès', 'info');
        screenManager.showAuth();
    }
};

// Dashboard Manager
const dashboardManager = {
    init: () => {
        elements.newEntryBtn.addEventListener('click', () => screenManager.showWriteEntry());
        elements.viewEntriesBtn.addEventListener('click', () => screenManager.showEntriesList());
        elements.createFirstEntry.addEventListener('click', () => screenManager.showWriteEntry());
        elements.logoutBtn.addEventListener('click', authManager.logout);
    },
    
    updateStats: () => {
        const userEntries = dataManager.getUserEntries();
        
        // Total entries
        elements.totalEntries.textContent = userEntries.length;
        
        // Writing streak (simplified calculation)
        const streak = dashboardManager.calculateWritingStreak(userEntries);
        elements.writingStreak.textContent = `${streak} jour${streak !== 1 ? 's' : ''}`;
        
        // Average mood
        const avgMood = dashboardManager.calculateAverageMood(userEntries);
        elements.averageMood.textContent = utils.getMoodEmoji(avgMood);
        
        // Month entries
        const monthEntries = dashboardManager.getMonthEntries(userEntries);
        elements.monthEntries.textContent = monthEntries;
    },
    
    calculateWritingStreak: (entries) => {
        if (entries.length === 0) return 0;
        
        const today = new Date();
        const sortedEntries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        let streak = 0;
        let currentDate = new Date(today);
        
        for (const entry of sortedEntries) {
            const entryDate = new Date(entry.createdAt);
            const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    calculateAverageMood: (entries) => {
        if (entries.length === 0) return 'neutral';
        
        const moodCounts = {};
        entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        
        return Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    },
    
    getMonthEntries: (entries) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return entries.filter(entry => {
            const entryDate = new Date(entry.createdAt);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        }).length;
    },
    
    loadRecentEntries: () => {
        const userEntries = dataManager.getUserEntries();
        const recentEntries = userEntries
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        
        if (recentEntries.length === 0) {
            elements.recentEntries.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-book-open text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400">Aucune entrée pour le moment</p>
                    <button id="create-first-entry" class="mt-4 btn-primary text-white px-6 py-2 rounded-xl">
                        Créer votre première entrée
                    </button>
                </div>
            `;
            
            // Re-bind the event listener
            document.getElementById('create-first-entry').addEventListener('click', () => screenManager.showWriteEntry());
        } else {
            elements.recentEntries.innerHTML = recentEntries.map(entry => `
                <div class="card-enhanced rounded-xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer" onclick="entriesManager.viewEntry('${entry.id}')">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white truncate">${entry.title}</h3>
                        <span class="text-2xl">${utils.getMoodEmoji(entry.mood)}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${utils.formatDate(entry.createdAt)}</p>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">${utils.truncateText(entry.content || 'Contenu chiffré', 80)}</p>
                </div>
            `).join('');
        }
    }
};

// Entry Manager
const entryManager = {
    init: () => {
        elements.entryForm.addEventListener('submit', entryManager.handleSaveEntry);
        elements.backToDashboard.addEventListener('click', () => screenManager.showDashboard());
        elements.cancelEntry.addEventListener('click', () => screenManager.showDashboard());
        elements.previewEntry.addEventListener('click', entryManager.showPreview);
        elements.closePreview.addEventListener('click', entryManager.closePreview);
        
        // Font change handler
        elements.entryFont.addEventListener('change', entryManager.updateFont);
        
        // Password visibility toggle
        elements.toggleEntryPassword.addEventListener('click', () => {
            utils.togglePasswordVisibility(elements.entryPassword, elements.toggleEntryPassword);
        });
    },
    
    handleSaveEntry: async (e) => {
        e.preventDefault();
        
        const title = elements.entryTitle.value.trim();
        const content = elements.entryContent.value.trim();
        const mood = elements.entryMood.value;
        const font = elements.entryFont.value;
        const password = elements.entryPassword.value;
        
        if (!title || !content || !mood) {
            utils.showNotification('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        const entry = {
            id: utils.generateId(),
            title,
            content,
            mood,
            font,
            password,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            await dataManager.saveEntry(entry);
            utils.showNotification('Succès', 'Votre entrée a été sauvegardée avec succès', 'success');
            elements.entryForm.reset();
            screenManager.showDashboard();
        } catch (error) {
            utils.showNotification('Erreur', 'Impossible de sauvegarder l\'entrée', 'error');
        }
    },
    
    updateFont: () => {
        const selectedFont = elements.entryFont.value;
        elements.entryContent.className = elements.entryContent.className.replace(/font-\w+/g, '') + ' ' + selectedFont;
    },
    
    showPreview: () => {
        const title = elements.entryTitle.value.trim();
        const content = elements.entryContent.value.trim();
        const mood = elements.entryMood.value;
        const font = elements.entryFont.value;
        
        if (!title || !content || !mood) {
            utils.showNotification('Erreur', 'Veuillez remplir tous les champs pour voir l\'aperçu', 'error');
            return;
        }
        
        elements.previewTitle.textContent = title;
        elements.previewMood.innerHTML = `<span class="mr-2">${utils.getMoodEmoji(mood)}</span> ${utils.getMoodName(mood)}`;
        elements.previewDate.textContent = utils.formatDate(new Date().toISOString());
        elements.previewContent.innerHTML = content.replace(/\n/g, '<br>');
        elements.previewContent.className = `prose dark:prose-invert max-w-none ${font}`;
        
        elements.previewModal.classList.remove('hidden');
    },
    
    closePreview: () => {
        elements.previewModal.classList.add('hidden');
    }
};

// Entries Manager
const entriesManager = {
    init: () => {
        elements.backToDashboardFromList.addEventListener('click', () => screenManager.showDashboard());
        elements.createFirstEntryFromList.addEventListener('click', () => screenManager.showWriteEntry());
        elements.searchEntries.addEventListener('input', entriesManager.filterEntries);
        elements.filterMood.addEventListener('change', entriesManager.filterEntries);
        
        // Password modal handlers
        elements.cancelPassword.addEventListener('click', entriesManager.closePasswordModal);
        elements.unlockEntry.addEventListener('click', entriesManager.unlockEntry);
        elements.toggleModalPassword.addEventListener('click', () => {
            utils.togglePasswordVisibility(elements.entryPasswordInput, elements.toggleModalPassword);
        });
    },
    
    loadEntries: () => {
        entries = dataManager.getUserEntries();
        filteredEntries = [...entries];
        entriesManager.renderEntries();
    },
    
    filterEntries: () => {
        const searchTerm = elements.searchEntries.value.toLowerCase();
        const moodFilter = elements.filterMood.value;
        
        filteredEntries = entries.filter(entry => {
            const matchesSearch = !searchTerm || 
                entry.title.toLowerCase().includes(searchTerm) ||
                (entry.content && entry.content.toLowerCase().includes(searchTerm));
            
            const matchesMood = !moodFilter || entry.mood === moodFilter;
            
            return matchesSearch && matchesMood;
        });
        
        entriesManager.renderEntries();
    },
    
    renderEntries: () => {
        if (filteredEntries.length === 0) {
            elements.entriesContainer.classList.add('hidden');
            elements.noEntriesMessage.classList.remove('hidden');
        } else {
            elements.entriesContainer.classList.remove('hidden');
            elements.noEntriesMessage.classList.add('hidden');
            
            elements.entriesContainer.innerHTML = filteredEntries
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(entry => `
                    <div class="card-enhanced rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer mood-${entry.mood}" onclick="entriesManager.viewEntry('${entry.id}')">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white truncate">${entry.title}</h3>
                            <div class="flex items-center space-x-2">
                                <span class="text-3xl">${utils.getMoodEmoji(entry.mood)}</span>
                                ${entry.isEncrypted ? '<i class="fas fa-lock text-yellow-500"></i>' : ''}
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${utils.formatDate(entry.createdAt)}</p>
                        <p class="text-gray-700 dark:text-gray-300">${utils.truncateText(entry.content || 'Contenu chiffré - cliquez pour déverrouiller', 120)}</p>
                        <div class="mt-4 flex items-center justify-between">
                            <span class="text-xs text-gray-500 dark:text-gray-400">${utils.getMoodName(entry.mood)}</span>
                            <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 transition-colors duration-200"></i>
                        </div>
                    </div>
                `).join('');
        }
    },
    
    viewEntry: (entryId) => {
        const entry = entries.find(e => e.id === entryId);
        if (!entry) return;
        
        if (entry.isEncrypted) {
            currentEntryId = entryId;
            elements.passwordModal.classList.remove('hidden');
            elements.entryPasswordInput.focus();
        } else {
            entriesManager.showEntryPreview(entry);
        }
    },
    
    unlockEntry: async () => {
        const password = elements.entryPasswordInput.value;
        if (!password) return;
        
        const entry = entries.find(e => e.id === currentEntryId);
        if (!entry) return;
        
        try {
            const decryptedContent = await dataManager.decryptEntry(entry, password);
            entry.decryptedContent = decryptedContent;
            entriesManager.closePasswordModal();
            entriesManager.showEntryPreview(entry);
        } catch (error) {
            elements.passwordError.classList.remove('hidden');
            elements.entryPasswordInput.value = '';
        }
    },
    
    showEntryPreview: (entry) => {
        elements.previewTitle.textContent = entry.title;
        elements.previewMood.innerHTML = `<span class="mr-2">${utils.getMoodEmoji(entry.mood)}</span> ${utils.getMoodName(entry.mood)}`;
        elements.previewDate.textContent = utils.formatDate(entry.createdAt);
        
        const content = entry.decryptedContent || entry.content || 'Contenu non disponible';
        elements.previewContent.innerHTML = content.replace(/\n/g, '<br>');
        elements.previewContent.className = `prose dark:prose-invert max-w-none ${entry.font || 'font-inter'}`;
        
        elements.previewModal.classList.remove('hidden');
    },
    
    closePasswordModal: () => {
        elements.passwordModal.classList.add('hidden');
        elements.entryPasswordInput.value = '';
        elements.passwordError.classList.add('hidden');
        currentEntryId = null;
    }
};

// Toast Manager
const toastManager = {
    init: () => {
        elements.closeToast.addEventListener('click', () => {
            elements.toastNotification.classList.add('hidden');
        });
    }
};

// App Initialization
const app = {
    init: async () => {
        // Initialize data storage
        dataManager.init();
        
        // Initialize theme
        themeManager.init();
        
        // Initialize managers
        authManager.init();
        dashboardManager.init();
        entryManager.init();
        entriesManager.init();
        toastManager.init();
        
        // Show loading screen briefly
        setTimeout(() => {
            elements.loadingScreen.classList.add('hidden');
            screenManager.showAuth();
        }, 1500);
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', app.init);