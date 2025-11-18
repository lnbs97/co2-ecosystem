import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss  from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Wir richten einen Proxy für alle Anfragen ein, die mit /api beginnen
      '/api': {
        target: 'http://localhost:8080', // Das Ziel ist Ihr Backend-Server
        changeOrigin: true, // Notwendig, um den "Origin"-Header zu ändern
        // Optional: Wenn Ihr Backend /api erwartet, ist dies nicht nötig.
        // Falls Ihr Backend /api/test/hello erwartet, aber der Proxy auch /api sendet:
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  },
})
