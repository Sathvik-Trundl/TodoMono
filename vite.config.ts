import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  root: 'frontend',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, 'frontend/dist'),
    emptyOutDir: true,
  },
})
