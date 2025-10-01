import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
plugins: [react()],
server: {
port: 5173,
proxy: {
// 例: 必要なら /api を Nest 側にプロキシ
// '/api': { target: 'http://localhost:3000', changeOrigin: true },
},
},
})