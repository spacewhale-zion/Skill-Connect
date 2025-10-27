import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    tailwindcss(),
  ],
   server: { 
    https:false,
     port: 5173,
    open: true,
  },

  preview:{
    port: 4173,
  },
 
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
       '@': path.resolve(__dirname, './src'),
    },
  },
})