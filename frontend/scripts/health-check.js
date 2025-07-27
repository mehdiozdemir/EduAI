#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  endpoints: {
    api: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
  },
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
};

// HTTP request helper
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Retry helper
async function withRetry(fn, retries = HEALTH_CHECK_CONFIG.retries) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      log.warning(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Health check functions
async function checkBuildFiles() {
  log.info('Checking build files...');
  
  const requiredFiles = [
    'dist/index.html',
    'dist/manifest.json',
    'dist/build-info.json',
  ];

  const results = [];
  
  for (const file of requiredFiles) {
    const filePath = join(rootDir, file);
    const exists = existsSync(filePath);
    
    if (exists) {
      log.success(`${file} exists`);
      results.push({ file, status: 'ok' });
    } else {
      log.error(`${file} missing`);
      results.push({ file, status: 'missing' });
    }
  }

  return {
    name: 'Build Files',
    status: results.every(r => r.status === 'ok') ? 'healthy' : 'unhealthy',
    details: results,
  };
}

async function checkBuildInfo() {
  log.info('Checking build information...');
  
  const buildInfoPath = join(rootDir, 'dist/build-info.json');
  
  if (!existsSync(buildInfoPath)) {
    return {
      name: 'Build Info',
      status: 'unhealthy',
      error: 'build-info.json not found',
    };
  }

  try {
    const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
    
    const requiredFields = ['environment', 'timestamp', 'version', 'buildId'];
    const missingFields = requiredFields.filter(field => !buildInfo[field]);
    
    if (missingFields.length > 0) {
      return {
        name: 'Build Info',
        status: 'unhealthy',
        error: `Missing fields: ${missingFields.join(', ')}`,
      };
    }

    // Check if build is recent (within last 24 hours for production)
    const buildTime = new Date(buildInfo.timestamp);
    const now = new Date();
    const hoursSinceBuild = (now - buildTime) / (1000 * 60 * 60);
    
    if (buildInfo.environment === 'production' && hoursSinceBuild > 24) {
      log.warning(`Build is ${Math.round(hoursSinceBuild)} hours old`);
    }

    log.success(`Build info valid - Environment: ${buildInfo.environment}, Version: ${buildInfo.version}`);
    
    return {
      name: 'Build Info',
      status: 'healthy',
      details: {
        environment: buildInfo.environment,
        version: buildInfo.version,
        buildId: buildInfo.buildId,
        timestamp: buildInfo.timestamp,
        age: `${Math.round(hoursSinceBuild)} hours`,
      },
    };
  } catch (error) {
    return {
      name: 'Build Info',
      status: 'unhealthy',
      error: `Failed to parse build-info.json: ${error.message}`,
    };
  }
}

async function checkApiConnectivity() {
  log.info('Checking API connectivity...');
  
  const apiUrl = HEALTH_CHECK_CONFIG.endpoints.api;
  
  try {
    const response = await withRetry(async () => {
      return await makeRequest(`${apiUrl}/health`);
    });

    if (response.ok) {
      const data = await response.json();
      log.success(`API health check passed - Status: ${data.status || 'unknown'}`);
      
      return {
        name: 'API Connectivity',
        status: 'healthy',
        details: {
          url: apiUrl,
          status: data.status,
          responseTime: response.headers.get('x-response-time') || 'unknown',
        },
      };
    } else {
      return {
        name: 'API Connectivity',
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      name: 'API Connectivity',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkEnvironmentConfig() {
  log.info('Checking environment configuration...');
  
  const manifestPath = join(rootDir, 'dist/manifest.json');
  
  if (!existsSync(manifestPath)) {
    return {
      name: 'Environment Config',
      status: 'unhealthy',
      error: 'manifest.json not found',
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    
    const requiredConfig = ['name', 'version', 'environment'];
    const missingConfig = requiredConfig.filter(field => !manifest[field]);
    
    if (missingConfig.length > 0) {
      return {
        name: 'Environment Config',
        status: 'unhealthy',
        error: `Missing configuration: ${missingConfig.join(', ')}`,
      };
    }

    // Validate API URL format
    try {
      new URL(manifest.config.apiBaseUrl);
    } catch {
      return {
        name: 'Environment Config',
        status: 'unhealthy',
        error: 'Invalid API base URL format',
      };
    }

    log.success(`Environment config valid - ${manifest.environment} environment`);
    
    return {
      name: 'Environment Config',
      status: 'healthy',
      details: {
        environment: manifest.environment,
        apiBaseUrl: manifest.config.apiBaseUrl,
        features: Object.entries(manifest.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature),
      },
    };
  } catch (error) {
    return {
      name: 'Environment Config',
      status: 'unhealthy',
      error: `Failed to parse manifest.json: ${error.message}`,
    };
  }
}

async function checkServiceWorker() {
  log.info('Checking service worker...');
  
  const swPath = join(rootDir, 'dist/sw.js');
  const manifestPath = join(rootDir, 'dist/manifest.json');
  
  if (!existsSync(manifestPath)) {
    return {
      name: 'Service Worker',
      status: 'unhealthy',
      error: 'manifest.json not found',
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const swEnabled = manifest.features.serviceWorker;
    
    if (!swEnabled) {
      log.info('Service worker disabled in configuration');
      return {
        name: 'Service Worker',
        status: 'healthy',
        details: { enabled: false, reason: 'Disabled in configuration' },
      };
    }

    if (!existsSync(swPath)) {
      return {
        name: 'Service Worker',
        status: 'unhealthy',
        error: 'Service worker enabled but sw.js not found',
      };
    }

    // Basic validation of service worker file
    const swContent = readFileSync(swPath, 'utf8');
    if (swContent.length < 100) {
      return {
        name: 'Service Worker',
        status: 'unhealthy',
        error: 'Service worker file appears to be empty or corrupted',
      };
    }

    log.success('Service worker file exists and appears valid');
    
    return {
      name: 'Service Worker',
      status: 'healthy',
      details: {
        enabled: true,
        fileSize: `${Math.round(swContent.length / 1024)}KB`,
      },
    };
  } catch (error) {
    return {
      name: 'Service Worker',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkAssets() {
  log.info('Checking static assets...');
  
  const assetsDir = join(rootDir, 'dist/assets');
  
  if (!existsSync(assetsDir)) {
    return {
      name: 'Static Assets',
      status: 'unhealthy',
      error: 'Assets directory not found',
    };
  }

  try {
    const { readdirSync, statSync } = await import('fs');
    const files = readdirSync(assetsDir);
    
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    if (jsFiles.length === 0) {
      return {
        name: 'Static Assets',
        status: 'unhealthy',
        error: 'No JavaScript files found in assets',
      };
    }

    if (cssFiles.length === 0) {
      return {
        name: 'Static Assets',
        status: 'unhealthy',
        error: 'No CSS files found in assets',
      };
    }

    // Check for suspiciously large files (>5MB)
    const largeFiles = files.filter(file => {
      const filePath = join(assetsDir, file);
      const stats = statSync(filePath);
      return stats.size > 5 * 1024 * 1024; // 5MB
    });

    if (largeFiles.length > 0) {
      log.warning(`Large asset files detected: ${largeFiles.join(', ')}`);
    }

    log.success(`Assets check passed - ${jsFiles.length} JS files, ${cssFiles.length} CSS files`);
    
    return {
      name: 'Static Assets',
      status: 'healthy',
      details: {
        totalFiles: files.length,
        jsFiles: jsFiles.length,
        cssFiles: cssFiles.length,
        largeFiles: largeFiles.length,
      },
    };
  } catch (error) {
    return {
      name: 'Static Assets',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

// Main health check function
async function runHealthCheck() {
  console.log('🏥 Starting health check...\n');
  
  const checks = [
    checkBuildFiles,
    checkBuildInfo,
    checkEnvironmentConfig,
    checkServiceWorker,
    checkAssets,
    checkApiConnectivity,
  ];

  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check();
      results.push(result);
      
      if (result.status === 'healthy') {
        log.success(`${result.name}: Healthy`);
      } else {
        log.error(`${result.name}: ${result.error || 'Unhealthy'}`);
      }
    } catch (error) {
      log.error(`${check.name}: Failed to run check - ${error.message}`);
      results.push({
        name: check.name || 'Unknown',
        status: 'unhealthy',
        error: error.message,
      });
    }
    
    console.log(''); // Add spacing between checks
  }

  // Summary
  const healthyChecks = results.filter(r => r.status === 'healthy').length;
  const totalChecks = results.length;
  const overallHealth = healthyChecks === totalChecks ? 'healthy' : 'unhealthy';
  
  console.log('📊 Health Check Summary');
  console.log('='.repeat(50));
  console.log(`Overall Status: ${overallHealth === 'healthy' ? '🟢 HEALTHY' : '🔴 UNHEALTHY'}`);
  console.log(`Checks Passed: ${healthyChecks}/${totalChecks}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  if (overallHealth === 'unhealthy') {
    console.log('\n🚨 Failed Checks:');
    results
      .filter(r => r.status === 'unhealthy')
      .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }

  // Generate health report
  const healthReport = {
    status: overallHealth,
    timestamp: new Date().toISOString(),
    summary: {
      total: totalChecks,
      healthy: healthyChecks,
      unhealthy: totalChecks - healthyChecks,
    },
    checks: results,
  };

  // Save health report
  try {
    const { writeFileSync } = await import('fs');
    writeFileSync(
      join(rootDir, 'dist/health-report.json'),
      JSON.stringify(healthReport, null, 2)
    );
    log.success('Health report saved to dist/health-report.json');
  } catch (error) {
    log.warning(`Failed to save health report: ${error.message}`);
  }

  // Exit with appropriate code
  process.exit(overallHealth === 'healthy' ? 0 : 1);
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthCheck().catch(error => {
    log.error(`Health check failed: ${error.message}`);
    process.exit(1);
  });
}

export { runHealthCheck };