# EduAI Frontend Deployment Guide

This document provides comprehensive instructions for deploying the EduAI Frontend application across different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Build Process](#build-process)
- [Deployment Environments](#deployment-environments)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Prerequisites

### System Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Modern web browser for testing

### Development Tools

```bash
# Install dependencies
npm install

# Verify installation
npm run test:run
npm run lint
npm run build:dev
```

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your local settings
   ```

## Environment Configuration

### Environment Files

The application supports three deployment environments:

- **Development** (`.env.development`)
- **Staging** (`.env.staging`)
- **Production** (`.env.production`)

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NODE_ENV` | Deployment environment | `production` |
| `VITE_API_BASE_URL` | Backend API URL | `https://api.eduai.com` |
| `VITE_APP_NAME` | Application name | `EduAI Frontend` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DEBUG` | Enable debug mode | `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `20000` |
| `VITE_RETRY_ATTEMPTS` | API retry attempts | `3` |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_FEATURE_OFFLINE_SUPPORT` | Enable offline support | `true` |
| `VITE_FEATURE_SERVICE_WORKER` | Enable service worker | `true` |
| `VITE_FEATURE_PUSH_NOTIFICATIONS` | Enable push notifications | `false` |
| `VITE_FEATURE_DARK_MODE` | Enable dark mode | `true` |
| `VITE_FEATURE_BETA_FEATURES` | Enable beta features | `false` |

## Build Process

### Build Commands

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:production

# Build with analysis
npm run build:analyze
```

### Build Validation

The build process includes automatic validation:

1. **TypeScript compilation check**
2. **ESLint code quality check**
3. **Unit and integration tests** (production only)
4. **Bundle size analysis**
5. **Environment variable validation**

### Build Output

```
dist/
├── assets/           # Static assets (JS, CSS, images)
├── index.html        # Main HTML file
├── manifest.json     # Deployment manifest
├── build-info.json   # Build information
└── sw.js            # Service worker (if enabled)
```

## Deployment Environments

### Development Environment

**Purpose**: Local development and testing

**Configuration**:
- API URL: `http://localhost:8000`
- Debug mode: Enabled
- Analytics: Disabled
- Service worker: Disabled

**Deployment**:
```bash
npm run build:dev
npm run preview
```

### Staging Environment

**Purpose**: Pre-production testing and QA

**Configuration**:
- API URL: `https://api-staging.eduai.com`
- Debug mode: Disabled
- Analytics: Enabled
- Service worker: Enabled
- Beta features: Enabled

**Deployment**:
```bash
npm run build:staging
npm run deploy:staging
```

**Post-deployment checklist**:
- [ ] Verify API connectivity
- [ ] Test user authentication
- [ ] Validate core user flows
- [ ] Check responsive design
- [ ] Test performance metrics

### Production Environment

**Purpose**: Live application for end users

**Configuration**:
- API URL: `https://api.eduai.com`
- Debug mode: Disabled
- Analytics: Enabled
- Service worker: Enabled
- Beta features: Disabled

**Deployment**:
```bash
npm run build:production
npm run deploy:production
```

**Pre-deployment checklist**:
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Staging environment validated

**Post-deployment checklist**:
- [ ] Health check passed
- [ ] Monitor error rates
- [ ] Verify analytics data
- [ ] Check performance metrics
- [ ] Validate user flows

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main, staging, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      
      # Staging deployment
      - name: Deploy to Staging
        if: github.ref == 'refs/heads/staging'
        run: |
          npm run build:staging
          # Deploy to staging server
          
      # Production deployment
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: |
          npm run build:production
          # Deploy to production server
```

### Deployment Scripts

Custom deployment scripts are available in the `scripts/` directory:

- `build.js` - Environment-specific build script
- `deploy.js` - Deployment automation
- `health-check.js` - Post-deployment health checks
- `rollback.js` - Rollback to previous version

## Monitoring and Health Checks

### Health Check Endpoint

The application includes a health check endpoint:

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "api": "healthy",
    "database": "healthy",
    "cache": "healthy"
  }
}
```

### Monitoring Tools

1. **Application Performance Monitoring (APM)**
   - Error tracking with Sentry
   - Performance monitoring
   - User session recording

2. **Analytics**
   - Google Analytics integration
   - Custom event tracking
   - User behavior analysis

3. **Infrastructure Monitoring**
   - Server health monitoring
   - CDN performance tracking
   - SSL certificate monitoring

### Alerts and Notifications

Configure alerts for:
- Application errors (>1% error rate)
- Performance degradation (>3s load time)
- API failures (>5% failure rate)
- Security incidents

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: TypeScript compilation errors
```bash
# Solution
npm run lint:fix
npx tsc --noEmit
```

**Issue**: Environment variable missing
```bash
# Solution
cp .env.example .env.production
# Edit .env.production with correct values
```

#### Deployment Issues

**Issue**: API connectivity problems
```bash
# Check API endpoint
curl -I https://api.eduai.com/health

# Verify environment configuration
node -e "console.log(process.env.VITE_API_BASE_URL)"
```

**Issue**: Service worker not updating
```bash
# Clear service worker cache
# In browser console:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

#### Performance Issues

**Issue**: Large bundle size
```bash
# Analyze bundle
npm run build:analyze

# Check for unused dependencies
npx depcheck
```

**Issue**: Slow loading times
- Enable compression (gzip/brotli)
- Optimize images
- Enable CDN caching
- Review code splitting

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set debug environment variable
VITE_DEBUG=true npm run build:staging

# Or in browser console
localStorage.setItem('debug', 'true');
```

### Log Analysis

Application logs are available in:
- Browser console (development)
- Application monitoring dashboard (staging/production)
- Server logs (deployment issues)

## Security Considerations

### Content Security Policy (CSP)

Configure CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```

### HTTPS Configuration

- Force HTTPS in production
- Use HSTS headers
- Configure secure cookies

### Environment Variables

- Never commit sensitive data to version control
- Use secure secret management
- Rotate API keys regularly

### Dependency Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Build Security

- Verify build integrity
- Scan for vulnerabilities
- Use trusted base images (Docker)

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous version
npm run rollback

# Or manually
git checkout <previous-commit>
npm run build:production
npm run deploy:production
```

### Database Rollback

If deployment includes database changes:
1. Stop application traffic
2. Restore database backup
3. Deploy previous application version
4. Verify functionality
5. Resume traffic

### Monitoring During Rollback

- Monitor error rates
- Check API response times
- Verify user authentication
- Validate core functionality

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Dependency updates, security patches
- **Monthly**: Performance review, log analysis
- **Quarterly**: Security audit, disaster recovery testing

### Documentation Updates

Keep documentation current:
- Update deployment procedures
- Document configuration changes
- Maintain troubleshooting guides
- Review security procedures

### Contact Information

- **Development Team**: dev-team@eduai.com
- **DevOps Team**: devops@eduai.com
- **Security Team**: security@eduai.com
- **On-call Support**: +1-555-0123

---

For additional support or questions, please refer to the project wiki or contact the development team.