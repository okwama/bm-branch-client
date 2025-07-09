import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    // Remove historyApiFallback as it's not needed in Vite
  },
  optimizeDeps: {
    exclude: [
      'multer',
      'multer-storage-cloudinary',
      'cloudinary',
      'html2canvas',
      'jspdf',
      'leaflet',
      'react-leaflet'
    ],
    include: [
      'lucide-react'
    ],
    force: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  base: '/',
})