import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
  ],
  base: '/dashboard/',
  server: {
    // 1. Expose to Docker network (0.0.0.0)
    host: true,
    // 2. Ensure the port matches your docker-compose (3000)
    port: 3000,
    // 3. Polling is often needed for hot-reload in Docker on Windows/Mac
    watch: {
      usePolling: true
    }
  }
})