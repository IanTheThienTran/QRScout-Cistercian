import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/QRScout-Cistercian/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // fixes "@/store/store" imports
    },
  },
})
