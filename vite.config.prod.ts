import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Production build configuration for static hosting
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  define: {
    // For static hosting, disable API features
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.VITE_STATIC_HOSTING': JSON.stringify('true'),
  },
})