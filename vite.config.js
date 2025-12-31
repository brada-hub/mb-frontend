import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Hot Module Replacement para cambios en tiempo real
    hmr: {
      overlay: true, // Muestra errores en pantalla
    },
    watch: {
      usePolling: true, // Mejor detección de cambios en Windows
    },
   proxy: {
      '/api': {
        target: 'http://monster-back:8000', // <-- CAMBIADO
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://monster-back:8000', // <-- CAMBIADO
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
