import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Определяем, деплоим ли мы на GitHub Pages
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/AI_AM_AM_BUILDER/' : '/', // Разные пути для GitHub Pages и Vercel
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
}) 