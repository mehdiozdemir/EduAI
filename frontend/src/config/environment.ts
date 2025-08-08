// Environment configuration for different deployment stages

export interface EnvironmentConfig {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  API_TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  CACHE_DURATION: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  FEATURES: {
    OFFLINE_SUPPORT: boolean;
    SERVICE_WORKER: boolean;
    PUSH_NOTIFICATIONS: boolean;
    DARK_MODE: boolean;
    BETA_FEATURES: boolean;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  API_BASE_URL: 'http://localhost:8000',
  APP_NAME: 'EduAI Frontend',
  APP_VERSION: '1.0.0',
  NODE_ENV: 'development',
  DEBUG: true,
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_REPORTING: false,
  ENABLE_PERFORMANCE_MONITORING: false,
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 300000, // 5 minutes
  LOG_LEVEL: 'debug',
  FEATURES: {
    OFFLINE_SUPPORT: false,
    SERVICE_WORKER: false,
    PUSH_NOTIFICATIONS: false,
    DARK_MODE: true,
    BETA_FEATURES: true,
  },
};

// Development configuration
const developmentConfig: Partial<EnvironmentConfig> = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  DEBUG: true,
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_REPORTING: false,
  ENABLE_PERFORMANCE_MONITORING: false,
  LOG_LEVEL: 'debug',
  FEATURES: {
    OFFLINE_SUPPORT: false,
    SERVICE_WORKER: false,
    PUSH_NOTIFICATIONS: false,
    DARK_MODE: true,
    BETA_FEATURES: true,
  },
};

// Staging configuration
const stagingConfig: Partial<EnvironmentConfig> = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-staging.eduai.com',
  NODE_ENV: 'staging',
  DEBUG: false,
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  API_TIMEOUT: 15000,
  RETRY_ATTEMPTS: 2,
  CACHE_DURATION: 600000, // 10 minutes
  LOG_LEVEL: 'info',
  FEATURES: {
    OFFLINE_SUPPORT: true,
    SERVICE_WORKER: true,
    PUSH_NOTIFICATIONS: false,
    DARK_MODE: true,
    BETA_FEATURES: true,
  },
};

// Production configuration
const productionConfig: Partial<EnvironmentConfig> = {
  // In containerized prod behind nginx, prefer same-origin root; use absolute paths in services (e.g., '/api/v1')
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/',
  NODE_ENV: 'production',
  DEBUG: false,
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  API_TIMEOUT: 20000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 900000, // 15 minutes
  LOG_LEVEL: 'error',
  FEATURES: {
    OFFLINE_SUPPORT: true,
    SERVICE_WORKER: true,
    PUSH_NOTIFICATIONS: true,
    DARK_MODE: true,
    BETA_FEATURES: false,
  },
};

// Get current environment
const getCurrentEnvironment = (): string => {
  return import.meta.env.VITE_NODE_ENV || import.meta.env.NODE_ENV || 'development';
};

// Merge configurations
const getConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  
  let envConfig: Partial<EnvironmentConfig> = {};
  
  switch (env) {
    case 'staging':
      envConfig = stagingConfig;
      break;
    case 'production':
      envConfig = productionConfig;
      break;
    case 'development':
    default:
      envConfig = developmentConfig;
      break;
  }
  
  return {
    ...defaultConfig,
    ...envConfig,
    FEATURES: {
      ...defaultConfig.FEATURES,
      ...envConfig.FEATURES,
    },
  };
};

// Export the configuration
export const config = getConfig();

// Environment utilities
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isStaging = () => config.NODE_ENV === 'staging';
export const isProduction = () => config.NODE_ENV === 'production';

// Feature flags
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['FEATURES']): boolean => {
  return config.FEATURES[feature];
};

// Logging utility
export const log = {
  debug: (...args: any[]) => {
    if (config.LOG_LEVEL === 'debug' && config.DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(config.LOG_LEVEL)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(config.LOG_LEVEL)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

// Validation
export const validateConfig = (): boolean => {
  const requiredFields = ['API_BASE_URL', 'APP_NAME', 'APP_VERSION'];
  
  for (const field of requiredFields) {
    if (!config[field as keyof EnvironmentConfig]) {
      log.error(`Missing required configuration: ${field}`);
      return false;
    }
  }
  
  // Validate API_BASE_URL format (support relative URLs like '/api')
  try {
    if (config.API_BASE_URL.startsWith('http://') || config.API_BASE_URL.startsWith('https://')) {
      new URL(config.API_BASE_URL);
    } else {
      // Relative URL: validate against current origin if in browser, otherwise allow
      const base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost';
      new URL(config.API_BASE_URL, base);
    }
  } catch {
    log.error('Invalid API_BASE_URL format');
    return false;
  }
  
  // Validate timeout values
  if (config.API_TIMEOUT < 1000) {
    log.error('API_TIMEOUT should be at least 1000ms');
    return false;
  }
  
  if (config.RETRY_ATTEMPTS < 0 || config.RETRY_ATTEMPTS > 5) {
    log.error('RETRY_ATTEMPTS should be between 0 and 5');
    return false;
  }
  
  return true;
};

// Initialize configuration validation
if (!validateConfig()) {
  throw new Error('Invalid configuration detected');
}

// Export for debugging in development
if (isDevelopment()) {
  (window as any).__EDUAI_CONFIG__ = config;
  log.debug('Configuration loaded:', config);
}