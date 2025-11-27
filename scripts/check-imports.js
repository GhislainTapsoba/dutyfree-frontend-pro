#!/usr/bin/env node

/**
 * Script de vérification des imports
 * Vérifie que tous les chemins d'import existent avant le build
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];

// Chemins à vérifier
const projectRoot = path.resolve(__dirname, '..');
const libPath = path.join(projectRoot, 'lib');
const componentsPath = path.join(projectRoot, 'components');

console.log('🔍 Vérification des imports...\n');

// Liste des imports requis
const requiredPaths = [
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/supabase/middleware.ts',
  'lib/utils.ts',
  'lib/api/index.ts',
];

// Vérifier que les chemins requis existent
requiredPaths.forEach(relativePath => {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`❌ Fichier requis manquant: ${relativePath}`);
  } else {
    console.log(`✅ ${relativePath}`);
  }
});

// Vérifier les variables d'environnement
const envPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envPath)) {
  errors.push('❌ Fichier .env.local manquant');
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_API_URL',
  ];

  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      errors.push(`❌ Variable d'environnement manquante: ${varName}`);
    } else {
      console.log(`✅ ${varName} configurée`);
    }
  });
}

// Rapport final
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
  console.log('\n❌ ERREURS DÉTECTÉES:\n');
  errors.forEach(error => console.log(error));
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVERTISSEMENTS:\n');
  warnings.forEach(warning => console.log(warning));
}

console.log('\n✅ Toutes les vérifications sont passées!\n');
process.exit(0);
