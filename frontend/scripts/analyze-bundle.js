#!/usr/bin/env node

/**
 * Bundle analysis script to identify optimization opportunities
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUNDLE_SIZE_LIMIT = {
  'react-vendor': 150, // KB
  'router': 50,
  'query': 100,
  'charts': 200,
  'forms': 80,
  'http': 50,
  'utils': 30,
  'vendor': 100,
  'pages': 150,
  'features': 100,
  'ui': 80,
  'services': 50,
};

function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');

  try {
    // Build the project
    console.log('Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Read build stats
    const distPath = join(process.cwd(), 'dist');
    const statsPath = join(distPath, 'stats.json');

    // Generate stats if not exists
    try {
      readFileSync(statsPath);
    } catch {
      console.log('Generating build stats...');
      execSync('npx vite build --mode production --outDir dist --emptyOutDir', {
        stdio: 'inherit',
      });
    }

    // Analyze chunks
    const assetsPath = join(distPath, 'assets');
    const files = execSync(`ls -la ${assetsPath}`, { encoding: 'utf8' });
    
    console.log('\n📊 Bundle Analysis Results:\n');
    console.log('Chunk Name'.padEnd(20) + 'Size (KB)'.padEnd(12) + 'Status');
    console.log('-'.repeat(50));

    const chunks = [];
    const lines = files.split('\n').filter(line => line.includes('.js'));
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const size = parseInt(parts[4]) / 1024; // Convert to KB
      const filename = parts[parts.length - 1];
      
      // Extract chunk name from filename
      let chunkName = 'unknown';
      for (const [name] of Object.entries(BUNDLE_SIZE_LIMIT)) {
        if (filename.includes(name)) {
          chunkName = name;
          break;
        }
      }
      
      const limit = BUNDLE_SIZE_LIMIT[chunkName] || 100;
      const status = size > limit ? '❌ OVER LIMIT' : '✅ OK';
      
      chunks.push({ name: chunkName, size, limit, filename, status });
      
      console.log(
        chunkName.padEnd(20) + 
        `${size.toFixed(1)}`.padEnd(12) + 
        status
      );
    }

    // Generate recommendations
    console.log('\n💡 Optimization Recommendations:\n');
    
    const overLimitChunks = chunks.filter(chunk => chunk.size > chunk.limit);
    
    if (overLimitChunks.length === 0) {
      console.log('✅ All chunks are within size limits!');
    } else {
      overLimitChunks.forEach(chunk => {
        console.log(`❌ ${chunk.name}: ${chunk.size.toFixed(1)}KB (limit: ${chunk.limit}KB)`);
        
        // Provide specific recommendations
        switch (chunk.name) {
          case 'charts':
            console.log('   → Consider lazy loading chart components');
            console.log('   → Use lighter chart library alternatives');
            break;
          case 'vendor':
            console.log('   → Review third-party dependencies');
            console.log('   → Consider using lighter alternatives');
            break;
          case 'features':
            console.log('   → Implement more granular code splitting');
            console.log('   → Lazy load heavy feature components');
            break;
          default:
            console.log('   → Consider code splitting or lazy loading');
        }
        console.log('');
      });
    }

    // Calculate total bundle size
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    console.log(`📦 Total bundle size: ${totalSize.toFixed(1)}KB`);
    
    if (totalSize > 1000) {
      console.log('⚠️  Bundle size is quite large. Consider more aggressive code splitting.');
    } else {
      console.log('✅ Bundle size looks good!');
    }

    // Save analysis results
    const analysisResult = {
      timestamp: new Date().toISOString(),
      totalSize: totalSize.toFixed(1),
      chunks,
      recommendations: overLimitChunks.map(chunk => ({
        chunk: chunk.name,
        currentSize: chunk.size,
        limit: chunk.limit,
        overBy: chunk.size - chunk.limit,
      })),
    };

    writeFileSync(
      join(process.cwd(), 'bundle-analysis.json'),
      JSON.stringify(analysisResult, null, 2)
    );

    console.log('\n📄 Analysis saved to bundle-analysis.json');

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function findUnusedExports() {
  console.log('\n🔍 Scanning for unused exports...\n');

  try {
    // Use a simple grep-based approach to find potentially unused exports
    const unusedExports = [];
    
    // This is a simplified check - in a real project you might use tools like
    // unimported, ts-unused-exports, or webpack-bundle-analyzer
    console.log('💡 To find unused exports, consider using:');
    console.log('   → npx unimported');
    console.log('   → npx ts-unused-exports tsconfig.json');
    console.log('   → npx webpack-bundle-analyzer dist/stats.json');
    
  } catch (error) {
    console.error('❌ Unused exports scan failed:', error.message);
  }
}

// Run analysis
if (process.argv.includes('--unused')) {
  findUnusedExports();
} else {
  analyzeBundleSize();
}