#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gzipSizeSync } from 'gzip-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log('🔧 Running production optimizations...');

// Check if build exists
if (!existsSync(distDir)) {
  console.error('❌ Build directory not found. Run build first.');
  process.exit(1);
}

// File size analysis
function analyzeFileSize(filePath) {
  const stats = statSync(filePath);
  const size = stats.size;
  const gzipped = gzipSizeSync(readFileSync(filePath));
  
  return {
    size,
    gzipped,
    ratio: ((size - gzipped) / size * 100).toFixed(1)
  };
}

// Get all files recursively
function getAllFiles(dir, files = []) {
  const dirFiles = readdirSync(dir);
  
  for (const file of dirFiles) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  
  return files;
}

// Bundle analysis
console.log('📊 Analyzing bundle...');
const allFiles = getAllFiles(distDir);
const jsFiles = allFiles.filter(f => extname(f) === '.js');
const cssFiles = allFiles.filter(f => extname(f) === '.css');
const assetFiles = allFiles.filter(f => !['.js', '.css', '.html', '.json', '.txt'].includes(extname(f)));

let totalSize = 0;
let totalGzipped = 0;
const fileAnalysis = [];

// Analyze JavaScript files
console.log('📈 JavaScript files:');
for (const file of jsFiles) {
  const analysis = analyzeFileSize(file);
  const fileName = file.replace(distDir + '/', '');
  
  fileAnalysis.push({
    file: fileName,
    type: 'js',
    ...analysis
  });
  
  totalSize += analysis.size;
  totalGzipped += analysis.gzipped;
  
  console.log(`  ${fileName}: ${(analysis.size / 1024).toFixed(1)}KB → ${(analysis.gzipped / 1024).toFixed(1)}KB (${analysis.ratio}% compression)`);
}

// Analyze CSS files
console.log('🎨 CSS files:');
for (const file of cssFiles) {
  const analysis = analyzeFileSize(file);
  const fileName = file.replace(distDir + '/', '');
  
  fileAnalysis.push({
    file: fileName,
    type: 'css',
    ...analysis
  });
  
  totalSize += analysis.size;
  totalGzipped += analysis.gzipped;
  
  console.log(`  ${fileName}: ${(analysis.size / 1024).toFixed(1)}KB → ${(analysis.gzipped / 1024).toFixed(1)}KB (${analysis.ratio}% compression)`);
}

// Performance recommendations
const recommendations = [];

// Check large JavaScript files
const largeJsFiles = fileAnalysis
  .filter(f => f.type === 'js' && f.size > 500 * 1024) // > 500KB
  .sort((a, b) => b.size - a.size);

if (largeJsFiles.length > 0) {
  recommendations.push({
    type: 'warning',
    message: `Large JavaScript files detected (${largeJsFiles.length} files > 500KB)`,
    files: largeJsFiles.map(f => f.file),
    suggestion: 'Consider code splitting or lazy loading'
  });
}

// Check total bundle size
const totalSizeMB = totalSize / (1024 * 1024);
if (totalSizeMB > 5) {
  recommendations.push({
    type: 'warning',
    message: `Large total bundle size: ${totalSizeMB.toFixed(1)}MB`,
    suggestion: 'Consider removing unused dependencies or implementing code splitting'
  });
} else if (totalSizeMB > 2) {
  recommendations.push({
    type: 'info',
    message: `Bundle size is acceptable: ${totalSizeMB.toFixed(1)}MB`,
    suggestion: 'Monitor for future growth'
  });
} else {
  recommendations.push({
    type: 'success',
    message: `Excellent bundle size: ${totalSizeMB.toFixed(1)}MB`,
    suggestion: 'Keep up the good optimization work!'
  });
}

// Image optimization check
const imageFiles = assetFiles.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
let totalImageSize = 0;
for (const file of imageFiles) {
  totalImageSize += statSync(file).size;
}

if (totalImageSize > 2 * 1024 * 1024) { // > 2MB
  recommendations.push({
    type: 'warning',
    message: `Large image assets: ${(totalImageSize / (1024 * 1024)).toFixed(1)}MB`,
    suggestion: 'Consider WebP format, image compression, or lazy loading'
  });
}

// Generate optimization report
const optimizationReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: allFiles.length,
    totalSize: totalSize,
    totalGzipped: totalGzipped,
    compressionRatio: ((totalSize - totalGzipped) / totalSize * 100).toFixed(1),
    jsFiles: jsFiles.length,
    cssFiles: cssFiles.length,
    assetFiles: assetFiles.length
  },
  fileAnalysis,
  recommendations,
  performance: {
    bundleScore: totalSizeMB < 1 ? 'A' : totalSizeMB < 2 ? 'B' : totalSizeMB < 5 ? 'C' : 'D',
    compressionScore: totalGzipped / totalSize < 0.3 ? 'A' : totalGzipped / totalSize < 0.5 ? 'B' : 'C'
  }
};

// Save optimization report
writeFileSync(
  join(distDir, 'optimization-report.json'),
  JSON.stringify(optimizationReport, null, 2)
);

// Display summary
console.log('\n📋 Optimization Summary:');
console.log(`  Total bundle size: ${(totalSize / 1024).toFixed(1)}KB → ${(totalGzipped / 1024).toFixed(1)}KB`);
console.log(`  Compression ratio: ${optimizationReport.summary.compressionRatio}%`);
console.log(`  Bundle score: ${optimizationReport.performance.bundleScore}`);
console.log(`  Compression score: ${optimizationReport.performance.compressionScore}`);

// Display recommendations
console.log('\n💡 Recommendations:');
for (const rec of recommendations) {
  const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`  ${icon} ${rec.message}`);
  console.log(`     ${rec.suggestion}`);
  if (rec.files) {
    console.log(`     Files: ${rec.files.slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}`);
  }
}

// Generate .htaccess for Apache (if needed)
const htaccess = `
# Compression
<IfModule mod_deflate.c>
    # Enable compression for text files
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    
    # Default
    ExpiresDefault "access plus 1 week"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# SPA Routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^index\\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
`;

writeFileSync(join(distDir, '.htaccess'), htaccess.trim());

console.log('\n🎉 Production optimization completed!');
console.log(`📄 Reports saved to dist/optimization-report.json`);
console.log(`🔧 .htaccess generated for Apache servers`);
