import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/trains/',
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true
    }
  }
})
