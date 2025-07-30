import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Include .jsx and .tsx in Fast Refresh
      include: "**/*.{jsx,tsx}",
    })
  ],
  server: {
    // Force page reload on HTML changes to prevent layout issues
    hmr: {
      overlay: true,
    },
    // Ensure styles are loaded before JavaScript
    middlewareMode: false,
  },
  build: {
    // Enable code splitting and optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            if (id.includes('react-hook-form')) {
              return 'forms';
            }
            if (id.includes('axios')) {
              return 'http';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            // Other vendor libraries
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/features/')) {
            return 'features';
          }
          if (id.includes('/components/ui/')) {
            return 'ui';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    // Tree shaking is enabled by default in Vite production builds
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      // Exclude heavy libraries from pre-bundling to enable lazy loading
      'chart.js',
      'react-chartjs-2',
    ],
    // Force pre-bundling of critical dependencies
    force: true,
  },
  // Ensure React is properly resolved
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Enable CSS code splitting and ensure proper loading order
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    // Ensure CSS is processed inline during development
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
