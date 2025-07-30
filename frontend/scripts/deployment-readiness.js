#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log('🔍 Checking deployment readiness...');

const checks = [];

// Check if build exists
if (existsSync(distDir)) {
  checks.push({ name: 'Build directory exists', status: 'pass', message: 'dist/ directory found' });
} else {
  checks.push({ name: 'Build directory exists', status: 'fail', message: 'dist/ directory not found. Run build first.' });
}

// Check essential files
const essentialFiles = [
  'index.html',
  'manifest.json',
  'build-info.json'
];

for (const file of essentialFiles) {
  const filePath = join(distDir, file);
  if (existsSync(filePath)) {
    checks.push({ name: `${file} exists`, status: 'pass', message: `${file} found` });
  } else {
    checks.push({ name: `${file} exists`, status: 'fail', message: `${file} not found` });
  }
}

// Check index.html content
const indexPath = join(distDir, 'index.html');
if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf8');
  
  // Check for meta tags
  if (indexContent.includes('<meta name="description"')) {
    checks.push({ name: 'SEO meta description', status: 'pass', message: 'Meta description found' });
  } else {
    checks.push({ name: 'SEO meta description', status: 'warn', message: 'Meta description missing' });
  }
  
  // Check for viewport meta
  if (indexContent.includes('<meta name="viewport"')) {
    checks.push({ name: 'Viewport meta tag', status: 'pass', message: 'Viewport meta tag found' });
  } else {
    checks.push({ name: 'Viewport meta tag', status: 'fail', message: 'Viewport meta tag missing' });
  }
  
  // Check for favicon
  if (indexContent.includes('favicon') || indexContent.includes('icon')) {
    checks.push({ name: 'Favicon', status: 'pass', message: 'Favicon reference found' });
  } else {
    checks.push({ name: 'Favicon', status: 'warn', message: 'Favicon reference not found' });
  }
  
  // Check for assets
  if (indexContent.includes('.js') && indexContent.includes('.css')) {
    checks.push({ name: 'Assets linked', status: 'pass', message: 'JS and CSS assets found' });
  } else {
    checks.push({ name: 'Assets linked', status: 'fail', message: 'JS or CSS assets missing' });
  }
}

// Check manifest.json
const manifestPath = join(distDir, 'manifest.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'environment'];
    for (const field of requiredFields) {
      if (manifest[field]) {
        checks.push({ name: `Manifest ${field}`, status: 'pass', message: `${field}: ${manifest[field]}` });
      } else {
        checks.push({ name: `Manifest ${field}`, status: 'fail', message: `${field} missing from manifest` });
      }
    }
    
    // Check API configuration
    if (manifest.config && manifest.config.apiBaseUrl) {
      try {
        new URL(manifest.config.apiBaseUrl);
        checks.push({ name: 'API URL valid', status: 'pass', message: `API: ${manifest.config.apiBaseUrl}` });
      } catch {
        checks.push({ name: 'API URL valid', status: 'fail', message: 'Invalid API URL format' });
      }
    } else {
      checks.push({ name: 'API URL configured', status: 'fail', message: 'API URL not configured' });
    }
    
  } catch (error) {
    checks.push({ name: 'Manifest valid JSON', status: 'fail', message: 'Manifest.json is not valid JSON' });
  }
}

// Check build info
const buildInfoPath = join(distDir, 'build-info.json');
if (existsSync(buildInfoPath)) {
  try {
    const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
    
    if (buildInfo.timestamp) {
      const buildDate = new Date(buildInfo.timestamp);
      const hoursAgo = (Date.now() - buildDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 24) {
        checks.push({ name: 'Build freshness', status: 'pass', message: `Built ${hoursAgo.toFixed(1)} hours ago` });
      } else {
        checks.push({ name: 'Build freshness', status: 'warn', message: `Built ${Math.floor(hoursAgo / 24)} days ago` });
      }
    }
    
    if (buildInfo.environment === 'production') {
      checks.push({ name: 'Production build', status: 'pass', message: 'Built for production' });
    } else {
      checks.push({ name: 'Production build', status: 'warn', message: `Built for ${buildInfo.environment}` });
    }
    
  } catch (error) {
    checks.push({ name: 'Build info valid', status: 'fail', message: 'Build info is not valid JSON' });
  }
}

// Check file sizes
const fileSizeChecks = [
  { pattern: /\.js$/, maxSize: 1024 * 1024, name: 'JavaScript files' }, // 1MB
  { pattern: /\.css$/, maxSize: 512 * 1024, name: 'CSS files' },        // 512KB
  { pattern: /\.(jpg|jpeg|png|gif)$/i, maxSize: 2 * 1024 * 1024, name: 'Image files' } // 2MB
];

try {
  const files = require('fs').readdirSync(distDir, { recursive: true });
  
  for (const check of fileSizeChecks) {
    const matchingFiles = files.filter(f => check.pattern.test(f));
    const largeFiles = [];
    
    for (const file of matchingFiles) {
      const filePath = join(distDir, file);
      if (existsSync(filePath)) {
        const size = statSync(filePath).size;
        if (size > check.maxSize) {
          largeFiles.push({ file, size });
        }
      }
    }
    
    if (largeFiles.length === 0) {
      checks.push({ 
        name: `${check.name} size`, 
        status: 'pass', 
        message: `All files under ${(check.maxSize / 1024).toFixed(0)}KB` 
      });
    } else {
      checks.push({ 
        name: `${check.name} size`, 
        status: 'warn', 
        message: `${largeFiles.length} large files found` 
      });
    }
  }
} catch (error) {
  checks.push({ name: 'File size check', status: 'warn', message: 'Could not check file sizes' });
}

// Security checks
const securityFiles = [
  { file: '.htaccess', message: 'Apache security headers configured' },
  { file: 'robots.txt', message: 'Search engine directives configured' }
];

for (const secFile of securityFiles) {
  const filePath = join(distDir, secFile.file);
  if (existsSync(filePath)) {
    checks.push({ name: secFile.file, status: 'pass', message: secFile.message });
  } else {
    checks.push({ name: secFile.file, status: 'warn', message: `${secFile.file} not found` });
  }
}

// Environment variable checks
const envVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

for (const envVar of envVars) {
  if (process.env[envVar]) {
    checks.push({ name: `ENV ${envVar}`, status: 'pass', message: `${envVar} configured` });
  } else {
    checks.push({ name: `ENV ${envVar}`, status: 'warn', message: `${envVar} not set` });
  }
}

// Generate report
const summary = checks.reduce((acc, check) => {
  acc[check.status] = (acc[check.status] || 0) + 1;
  return acc;
}, {});

const totalChecks = checks.length;
const passedChecks = summary.pass || 0;
const failedChecks = summary.fail || 0;
const warningChecks = summary.warn || 0;

console.log('\n📊 Deployment Readiness Report');
console.log('================================');

// Display checks
for (const check of checks) {
  const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${check.name}: ${check.message}`);
}

console.log('\n📈 Summary:');
console.log(`  Total checks: ${totalChecks}`);
console.log(`  ✅ Passed: ${passedChecks}`);
console.log(`  ❌ Failed: ${failedChecks}`);
console.log(`  ⚠️  Warnings: ${warningChecks}`);

const readinessScore = Math.round((passedChecks / totalChecks) * 100);
console.log(`  🎯 Readiness score: ${readinessScore}%`);

// Deployment recommendation
if (failedChecks === 0 && readinessScore >= 90) {
  console.log('\n🚀 READY FOR DEPLOYMENT');
  console.log('   All critical checks passed. Safe to deploy!');
} else if (failedChecks === 0) {
  console.log('\n⚠️  DEPLOYMENT WITH CAUTION');
  console.log('   No critical failures, but some warnings exist.');
  console.log('   Consider addressing warnings before deployment.');
} else {
  console.log('\n❌ NOT READY FOR DEPLOYMENT');
  console.log(`   ${failedChecks} critical issue(s) must be resolved.`);
  console.log('   Please fix failed checks before deploying.');
}

// Exit with appropriate code
process.exit(failedChecks > 0 ? 1 : 0);
