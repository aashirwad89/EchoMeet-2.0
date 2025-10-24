import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
     build: {
    outDir: 'dist',   // this ensures build goes to dist/
    base: './',       // important for relative paths
    chunkSizeWarningLimit: 2000
  }
})
