import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { 
          src: resolve(__dirname, 'public/manifest.json'), 
          dest: '.' 
        },
        { 
          src: resolve(__dirname, 'public/icon-*.png'), 
          dest: '.' 
        },
        { 
          src: resolve(__dirname, 'index.html'), 
          dest: '.' 
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.tsx')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].css';
          }
          return 'assets/[name].[ext]';
        },
        // Browser-friendly format
        format: 'es',
      },
      // Exclude Node-specific modules
      external: [
        'path',
        'fs',
        'child_process',
        'module',
        'os',
        'crypto',
        'util',
        'events',
        'stream',
        'assert',
        'url',
        'http',
        'https',
        'zlib',
        'tty',
        'net',
        'dns',
        'worker_threads',
        'buffer',
        'querystring',
        'perf_hooks',
        'fsevents',
        'readline'
      ]
    }
  },
  // Prevent Node modules from being bundled
  ssr: {
    noExternal: true
  },
  // Optimize dependencies
  optimizeDeps: {
    exclude: [
      'fsevents',
      'chokidar',
      'esbuild',
      'rollup',
      '@babel/core',
      'vite',
      '@vitejs/plugin-react',
      'vite-plugin-static-copy'
    ]
  }
});