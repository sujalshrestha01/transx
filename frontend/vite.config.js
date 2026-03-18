import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    allowedHosts: [
      'interteam-runtishly-elane.ngrok-free.dev' // Add your ngrok host here
    ],
    proxy: {
      '/api': {
        // target: 'https://interteam-runtishly-elane.ngrok-free.dev',
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
