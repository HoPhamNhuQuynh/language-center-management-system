import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',     
      'Cross-Origin-Embedder-Policy': 'unsafe-none', 
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8000', 
        changeOrigin: true,
        secure: false, 
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../docs/automation/frontend_coverage', 
      thresholds: {
        lines: 80, 
      },
      exclude: [
        'node_modules/',
        'src/main.jsx', 
        'src/App.jsx', 
        '**/*.d.ts',
      ],
    },
  }
})
