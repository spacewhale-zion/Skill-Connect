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
    https: true, // 3. Enable HTTPS
     port: 5173,
  }
})