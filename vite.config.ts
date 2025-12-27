// front/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";


const srcPath = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // ✅ "@/..." にだけ効く（scoped package を壊さない）
      { find: /^@\//, replacement: srcPath },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/uploads": "http://localhost:3000",
      "/media": "http://localhost:3000",
    },
  },
});
