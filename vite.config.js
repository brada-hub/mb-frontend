import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Monster Band App',
        short_name: 'MonsterBand',
        description: 'Gestión Operativa para Músicos',
        theme_color: '#161b2c',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['date-fns', 'date-fns/locale'],
  },
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
      '/storage': {
        target: 'http://monster-back:8000',
        changeOrigin: true,
        secure: false,
      },
      '/genres': {
        target: 'http://monster-back:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
