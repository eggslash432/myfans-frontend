import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/creators': { target: 'http://localhost:3000', changeOrigin: true },
      '/posts': { target: 'http://localhost:3000', changeOrigin: true },
      '/plans': { target: 'http://localhost:3000', changeOrigin: true },
      '/subscriptions': { target: 'http://localhost:3000', changeOrigin: true },
      '/payments': { target: 'http://localhost:3000', changeOrigin: true },
    }
  },
})