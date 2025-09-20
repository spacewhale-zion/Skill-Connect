import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    tailwindcss(),
  ],
   server: {
    https: false, 
     port: 3000,
  }
})