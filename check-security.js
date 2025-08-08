#!/usr/bin/env node

// Script de vérification de sécurité pour MyDiary Secure
// Usage: node check-security.js

const fs = require("fs");
const path = require("path");

console.log("🔍 Vérification de sécurité MyDiary Secure...\n");

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Fonction utilitaire pour les logs colorés
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
};

// 1. Vérifier que .env existe
function checkEnvFile() {
  log.info("Vérification du fichier .env...");

  if (fs.existsSync(".env")) {
    log.success("Fichier .env trouvé");
    checks.passed++;

    // Vérifier le contenu
    const envContent = fs.readFileSync(".env", "utf8");
    if (
      envContent.includes("SUPABASE_URL=") &&
      envContent.includes("SUPABASE_ANON_KEY=")
    ) {
      log.success("Variables Supabase configurées dans .env");
      checks.passed++;
    } else {
      log.error("Variables Supabase manquantes dans .env");
      checks.failed++;
    }
  } else {
    log.warning("Fichier .env non trouvé - créez-le depuis .env.example");
    checks.warnings++;
  }
}

// 2. Vérifier que .env.example existe
function checkEnvExample() {
  log.info("Vérification du fichier .env.example...");

  if (fs.existsSync(".env.example")) {
    log.success("Fichier .env.example trouvé");
    checks.passed++;
  } else {
    log.error("Fichier .env.example manquant");
    checks.failed++;
  }
}

// 3. Vérifier .gitignore
function checkGitignore() {
  log.info("Vérification du fichier .gitignore...");

  if (fs.existsSync(".gitignore")) {
    const gitignoreContent = fs.readFileSync(".gitignore", "utf8");
    if (gitignoreContent.includes(".env")) {
      log.success(".env est ignoré par Git");
      checks.passed++;
    } else {
      log.error(".env n'est PAS ignoré par Git - DANGER !");
      checks.failed++;
    }
  } else {
    log.error("Fichier .gitignore manquant");
    checks.failed++;
  }
}

// 4. Rechercher des clés hardcodées dans le code
function checkHardcodedKeys() {
  log.info("Recherche de clés hardcodées...");

  const filesToCheck = [
    "js/supabase-config.js",
    "js/env-loader.js",
    "index.html",
  ];

  let foundKeys = false;

  filesToCheck.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      // Rechercher des patterns de clés Supabase
      const patterns = [
        /https:\/\/[a-z]+\.supabase\.co/g,
        /eyJhbGciOiJIUzI1NiI[A-Za-z0-9+/=]+/g,
      ];

      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          // Vérifier si c'est dans un commentaire ou une fonction de fallback
          const lines = content.split("\n");
          matches.forEach((match) => {
            const lineIndex = lines.findIndex((line) => line.includes(match));
            if (lineIndex !== -1) {
              const line = lines[lineIndex].trim();
              if (
                line.includes("fallback") ||
                line.includes("test") ||
                line.includes("//")
              ) {
                log.warning(
                  `Clé de fallback trouvée dans ${file}:${lineIndex + 1}`
                );
                checks.warnings++;
              } else {
                log.error(
                  `Clé hardcodée trouvée dans ${file}:${lineIndex + 1}`
                );
                foundKeys = true;
                checks.failed++;
              }
            }
          });
        }
      });
    }
  });

  if (!foundKeys && checks.failed === 0) {
    log.success("Aucune clé hardcodée trouvée");
    checks.passed++;
  }
}

// 5. Vérifier la structure des fichiers de sécurité
function checkSecurityFiles() {
  log.info("Vérification des fichiers de sécurité...");

  const securityFiles = ["SECURITY.md", "js/env-loader.js"];

  securityFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      log.success(`${file} trouvé`);
      checks.passed++;
    } else {
      log.error(`${file} manquant`);
      checks.failed++;
    }
  });
}

// 6. Vérifier la configuration Git
function checkGitConfig() {
  log.info("Vérification de la configuration Git...");

  try {
    const { execSync } = require("child_process");

    // Vérifier si .env est tracké
    try {
      const trackedFiles = execSync("git ls-files", { encoding: "utf8" });
      if (trackedFiles.includes(".env")) {
        log.error(".env est tracké par Git - SUPPRIMEZ-LE IMMÉDIATEMENT !");
        checks.failed++;
      } else {
        log.success(".env n'est pas tracké par Git");
        checks.passed++;
      }
    } catch (e) {
      log.warning("Impossible de vérifier les fichiers Git trackés");
      checks.warnings++;
    }
  } catch (e) {
    log.warning("Git non disponible ou pas un repo Git");
    checks.warnings++;
  }
}

// Exécuter toutes les vérifications
function runAllChecks() {
  checkEnvFile();
  console.log();

  checkEnvExample();
  console.log();

  checkGitignore();
  console.log();

  checkHardcodedKeys();
  console.log();

  checkSecurityFiles();
  console.log();

  checkGitConfig();
  console.log();
}

// Afficher le résumé
function showSummary() {
  console.log("📊 RÉSUMÉ DE SÉCURITÉ");
  console.log("=".repeat(50));
  console.log(`✅ Tests réussis: ${checks.passed}`);
  console.log(`❌ Tests échoués: ${checks.failed}`);
  console.log(`⚠️  Avertissements: ${checks.warnings}`);
  console.log();

  if (checks.failed === 0) {
    console.log("🎉 SÉCURITÉ OK - Prêt pour GitHub !");
    process.exit(0);
  } else {
    console.log("🚨 PROBLÈMES DE SÉCURITÉ DÉTECTÉS !");
    console.log("Corrigez les erreurs avant de publier sur GitHub.");
    process.exit(1);
  }
}

// Actions de correction automatique
function showFixSuggestions() {
  if (checks.failed > 0) {
    console.log("\n🔧 SUGGESTIONS DE CORRECTION :");
    console.log("1. Créer .env depuis .env.example : cp .env.example .env");
    console.log('2. Ajouter .env au .gitignore : echo ".env" >> .gitignore');
    console.log("3. Supprimer .env du tracking Git : git rm --cached .env");
    console.log(
      "4. Remplacer les clés hardcodées par des variables d'environnement"
    );
    console.log("5. Relancer la vérification : node check-security.js");
  }
}

// Exécution principale
runAllChecks();
showSummary();
showFixSuggestions();
