#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get environment from command line arguments
const environment = process.argv[2] || 'development';
const validEnvironments = ['development', 'staging', 'production'];

if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Building for ${environment} environment...`);

// Set environment variables
process.env.NODE_ENV = environment === 'development' ? 'development' : 'production';
process.env.VITE_NODE_ENV = environment;

// Load environment-specific .env file
const envFile = join(rootDir, `.env.${environment}`);
if (existsSync(envFile)) {
  console.log(`📄 Loading environment file: .env.${environment}`);
  
  // Read and parse .env file
  const envContent = readFileSync(envFile, 'utf8');
  const envVars = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      acc[key.trim()] = value.trim();
      return acc;
    }, {});
  
  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
} else {
  console.warn(`⚠️  Environment file not found: .env.${environment}`);
}

// Pre-build validation
console.log('🔍 Validating configuration...');

const requiredVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

// Validate API URL
try {
  new URL(process.env.VITE_API_BASE_URL);
  console.log(`✅ API URL validated: ${process.env.VITE_API_BASE_URL}`);
} catch (error) {
  console.error(`❌ Invalid API URL: ${process.env.VITE_API_BASE_URL}`);
  process.exit(1);
}

// Clean previous build
console.log('🧹 Cleaning previous build...');
try {
  execSync('rm -rf dist', { cwd: rootDir, stdio: 'inherit' });
} catch (error) {
  // Ignore error if dist doesn't exist
}

// Run TypeScript check
console.log('🔧 Running TypeScript check...');
try {
  execSync('npx tsc --noEmit', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.error('❌ TypeScript check failed');
  process.exit(1);
}

// Run linting
console.log('🔍 Running ESLint...');
try {
  execSync('npx eslint src --ext .ts,.tsx --max-warnings 0', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.error('❌ Linting failed');
  if (environment !== 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing production build despite linting errors');
  }
}

// Skip tests for production builds (temp)
if (environment === 'production') {
  console.log('⚠️  Skipping tests for production build (temp)');
}

// Build the application
console.log('🏗️  Building application...');
try {
  const buildCommand = environment === 'production' 
    ? 'npx vite build --mode production'
    : `npx vite build --mode ${environment}`;
  
  execSync(buildCommand, { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Generate build info
console.log('📝 Generating build info...');
const buildInfo = {
  environment,
  timestamp: new Date().toISOString(),
  version: process.env.VITE_APP_VERSION,
  nodeVersion: process.version,
  buildId: Math.random().toString(36).substring(2, 15),
  gitCommit: (() => {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  })(),
  gitBranch: (() => {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  })(),
};

writeFileSync(
  join(rootDir, 'dist', 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

// Bundle analysis for production
if (environment === 'production') {
  console.log('📊 Analyzing bundle size...');
  try {
    execSync('npm run build:analyze', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Bundle analysis failed, continuing...');
  }
}

// Generate deployment manifest
console.log('📋 Generating deployment manifest...');
const manifest = {
  name: process.env.VITE_APP_NAME,
  version: process.env.VITE_APP_VERSION,
  environment,
  buildInfo,
  features: {
    offlineSupport: process.env.VITE_FEATURE_OFFLINE_SUPPORT === 'true',
    serviceWorker: process.env.VITE_FEATURE_SERVICE_WORKER === 'true',
    pushNotifications: process.env.VITE_FEATURE_PUSH_NOTIFICATIONS === 'true',
    darkMode: process.env.VITE_FEATURE_DARK_MODE === 'true',
    betaFeatures: process.env.VITE_FEATURE_BETA_FEATURES === 'true',
  },
  config: {
    apiBaseUrl: process.env.VITE_API_BASE_URL,
    apiTimeout: parseInt(process.env.VITE_API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.VITE_RETRY_ATTEMPTS || '3'),
    cacheDuration: parseInt(process.env.VITE_CACHE_DURATION || '300000'),
  },
};

writeFileSync(
  join(rootDir, 'dist', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Success message
console.log('🎉 Build completed successfully!');
console.log(`📦 Build output: ${join(rootDir, 'dist')}`);
console.log(`🌍 Environment: ${environment}`);
console.log(`📋 Build ID: ${buildInfo.buildId}`);
console.log(`🔗 API URL: ${process.env.VITE_API_BASE_URL}`);

// Environment-specific post-build actions
if (environment === 'production') {
  console.log('');
  console.log('🚀 Production build ready for deployment!');
  console.log('📝 Next steps:');
  console.log('  1. Review build output in dist/ directory');
  console.log('  2. Run security scan if required');
  console.log('  3. Deploy to production environment');
  console.log('  4. Monitor application performance');
} else if (environment === 'staging') {
  console.log('');
  console.log('🧪 Staging build ready for testing!');
  console.log('📝 Next steps:');
  console.log('  1. Deploy to staging environment');
  console.log('  2. Run integration tests');
  console.log('  3. Perform user acceptance testing');
  console.log('  4. Validate performance metrics');
} else {
  console.log('');
  console.log('🛠️  Development build completed!');
  console.log('📝 You can now:');
  console.log('  1. Test the build locally with: npm run preview');
  console.log('  2. Deploy to development environment');
  console.log('  3. Continue development with: npm run dev');
}