// front/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // バックエンド側に /api プレフィックスが無い場合は rewrite で外す
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,        
      },
    },
    fs:{ strict:false},
  },
})